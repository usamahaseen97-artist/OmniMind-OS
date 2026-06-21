"""Background sync of public GitHub API aggregate lists for free inference fallbacks."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from pathlib import Path
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

# Top public API aggregate files on GitHub (community-maintained directories).
COMMUNITY_SOURCES = (
    "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md",
    "https://raw.githubusercontent.com/abhishekbanthia/Public-APIs/master/README.md",
    "https://raw.githubusercontent.com/n0shake/Public-APIs/master/README.md",
)

AI_KEYWORDS = re.compile(
    r"\b(ai|llm|gpt|openai|inference|machine.?learning|nlp|chat|model|huggingface|gemini)\b",
    re.I,
)
URL_RE = re.compile(r"https?://[^\s\)>\"]+", re.I)

_nodes: list[dict[str, Any]] = []
_last_sync: str | None = None
_lock = asyncio.Lock()


def _seed_path() -> Path:
    return Path(__file__).resolve().parents[2] / "data" / "community_api_seed.json"


def _cache_path() -> Path:
    return Path(get_settings().community_cache_path)


def _load_seed() -> list[dict[str, Any]]:
    path = _seed_path()
    if not path.is_file():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        logger.warning("community seed load failed: %s", exc)
        return []


def _parse_markdown_nodes(text: str, source: str) -> list[dict[str, Any]]:
    """Extract AI-related HTTP endpoints from aggregate README tables."""
    out: list[dict[str, Any]] = []
    for line in text.splitlines():
        if not AI_KEYWORDS.search(line):
            continue
        urls = URL_RE.findall(line)
        if not urls:
            continue
        base = urls[0].rstrip("/")
        if "github.com" in base and "/blob/" in base:
            continue
        node_id = re.sub(r"[^a-z0-9]+", "_", base.lower())[:48]
        out.append(
            {
                "id": f"community_{node_id}",
                "name": f"Community API ({source})",
                "type": "openai_compat",
                "url": base if base.endswith("/chat/completions") else f"{base}/v1/chat/completions",
                "model": "auto",
                "priority": 50,
                "tags": ["community", "synced"],
                "source": source,
            }
        )
    return out


async def _fetch_source(url: str) -> str:
    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        res = await client.get(url)
        res.raise_for_status()
        return res.text


def _merge_nodes(seed: list[dict[str, Any]], discovered: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {n["id"]: n for n in seed if n.get("id")}
    for node in discovered:
        nid = node.get("id")
        if nid and nid not in by_id:
            by_id[nid] = node
    merged = list(by_id.values())
    merged.sort(key=lambda n: int(n.get("priority", 99)))
    return merged


async def sync_community_directory(*, force: bool = False) -> dict[str, Any]:
    """Pull public API aggregate files and merge with bundled seed nodes."""
    global _nodes, _last_sync

    async with _lock:
        seed = _load_seed()
        discovered: list[dict[str, Any]] = []

        for source in COMMUNITY_SOURCES:
            try:
                text = await _fetch_source(source)
                discovered.extend(_parse_markdown_nodes(text, source))
            except Exception as exc:
                logger.warning("community sync skipped %s: %s", source, exc)

        merged = _merge_nodes(seed, discovered)
        _nodes = merged
        from datetime import datetime, timezone

        _last_sync = datetime.now(timezone.utc).isoformat()

        cache = _cache_path()
        cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_text(
            json.dumps({"synced_at": _last_sync, "nodes": merged}, indent=2),
            encoding="utf-8",
        )

        return {
            "ok": True,
            "synced_at": _last_sync,
            "node_count": len(merged),
            "sources": list(COMMUNITY_SOURCES),
            "force": force,
        }


def load_cached_nodes() -> list[dict[str, Any]]:
    global _nodes, _last_sync
    if _nodes:
        return _nodes
    cache = _cache_path()
    if cache.is_file():
        try:
            data = json.loads(cache.read_text(encoding="utf-8"))
            _nodes = list(data.get("nodes") or [])
            _last_sync = data.get("synced_at")
            if _nodes:
                return _nodes
        except Exception:
            pass
    _nodes = _load_seed()
    return _nodes


def community_nodes() -> list[dict[str, Any]]:
    return load_cached_nodes()


def sync_status() -> dict[str, Any]:
    return {
        "last_sync": _last_sync,
        "node_count": len(load_cached_nodes()),
        "sources": list(COMMUNITY_SOURCES),
    }


async def community_sync_loop() -> None:
    """Background task — refresh community API directory on interval."""
    cfg = get_settings()
    while True:
        try:
            await sync_community_directory()
        except Exception as exc:
            logger.warning("community sync loop error: %s", exc)
        await asyncio.sleep(max(300, cfg.community_sync_interval_sec))
