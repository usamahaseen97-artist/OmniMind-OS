"""
Instant local JSON song catalog — used when Elasticsearch is down, locked, or disabled.

Loads once into memory for zero-latency search (no network, no crash).
"""

from __future__ import annotations

import json
import logging
import re
import time
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
STATIC_JSON_PATH = DATA_DIR / "songs_static.json"
_BOOTSTRAPPED = False


def _score(doc: dict[str, Any], query: str) -> int:
    if not query:
        return 1
    q = query.lower().strip()
    blob = " ".join(
        [
            str(doc.get("title") or ""),
            str(doc.get("artist") or ""),
            str(doc.get("album") or ""),
            str(doc.get("playlist") or ""),
            str(doc.get("category") or ""),
            " ".join(doc.get("tags") or []),
        ]
    ).lower()
    if q in blob:
        return 100
    score = 0
    for tok in re.split(r"\s+", q):
        if len(tok) < 2:
            continue
        if tok in blob:
            score += 30
    return score


def _normalize_raw(raw: dict[str, Any]) -> dict[str, Any]:
    tags = raw.get("tags") or []
    if isinstance(tags, str):
        tags = [tags]
    return {
        "id": str(raw.get("id") or ""),
        "title": str(raw.get("title") or ""),
        "artist": str(raw.get("artist") or ""),
        "album": str(raw.get("album") or ""),
        "playlist": str(raw.get("playlist") or raw.get("category") or "Pop"),
        "category": str(raw.get("category") or "Pop"),
        "tags": [str(t) for t in tags],
        "era": str(raw.get("era") or "latest"),
        "year": int(raw.get("year") or 2020),
        "duration_sec": int(raw.get("duration_sec") or raw.get("durationSec") or 240),
        "duration": str(raw.get("duration") or "4:00"),
        "thumbnail_url": str(raw.get("thumbnail_url") or raw.get("thumbnailUrl") or ""),
        "audio_url": str(raw.get("audio_url") or raw.get("audioUrl") or ""),
        "audius_id": str(raw.get("audius_id") or ""),
        "youtube_id": str(raw.get("youtube_id") or ""),
        "source": str(raw.get("source") or "local_json"),
    }


def bootstrap_static_json(*, force: bool = False) -> int:
    """Write songs_static.json from production catalog if missing or forced."""
    global _BOOTSTRAPPED
    if STATIC_JSON_PATH.is_file() and not force:
        return len(_load_pool_raw())

    from services.omnimusic_catalog import PRODUCTION_SONGS

    songs = [_normalize_raw(s) for s in PRODUCTION_SONGS]
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": 1,
        "generated_at": time.time(),
        "source": "omnimusic_catalog",
        "count": len(songs),
        "songs": songs,
    }
    STATIC_JSON_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    _load_pool_raw.cache_clear()
    _BOOTSTRAPPED = True
    logger.info("Static song JSON written: %s (%s tracks)", STATIC_JSON_PATH, len(songs))
    return len(songs)


@lru_cache(maxsize=1)
def _load_pool_raw() -> tuple[dict[str, Any], ...]:
    if not STATIC_JSON_PATH.is_file():
        bootstrap_static_json()
    try:
        data = json.loads(STATIC_JSON_PATH.read_text(encoding="utf-8"))
        rows = data.get("songs") if isinstance(data, dict) else data
        if not isinstance(rows, list):
            rows = []
        pool = tuple(_normalize_raw(r) for r in rows if r.get("id") and r.get("title"))
        if pool:
            return pool
    except Exception as exc:
        logger.warning("Static JSON read failed: %s — rebuilding", exc)
    bootstrap_static_json(force=True)
    data = json.loads(STATIC_JSON_PATH.read_text(encoding="utf-8"))
    rows = data.get("songs") or []
    return tuple(_normalize_raw(r) for r in rows if r.get("id") and r.get("title"))


def static_catalog_size() -> int:
    return len(_load_pool_raw())


def get_static_songs(
    *,
    query: str = "",
    category: Optional[str] = None,
    playlist: Optional[str] = None,
    limit: int = 80,
    offset: int = 0,
) -> list[dict[str, Any]]:
    q = query.strip()
    cat = (category or playlist or "").strip()
    hits: list[tuple[int, dict[str, Any]]] = []
    for doc in _load_pool_raw():
        if cat and cat != "all":
            if doc.get("category") != cat and doc.get("playlist") != cat:
                if cat.lower() not in (doc.get("playlist") or "").lower():
                    continue
        sc = _score(doc, q) if q else 1
        if sc > 0 or not q:
            hits.append((sc, dict(doc)))
    hits.sort(key=lambda x: (-x[0], -x[1].get("year", 0), x[1]["title"]))
    page = [d for _, d in hits[offset : offset + limit]]
    for row in page:
        row["source"] = "local_json"
    return page


def search_static_songs(query: str, *, limit: int = 20) -> list[dict[str, Any]]:
    """Elasticsearch-compatible search shape — instant, in-process."""
    return get_static_songs(query=query, limit=limit)


def static_provider_health() -> dict[str, Any]:
    try:
        n = static_catalog_size()
        return {
            "active": True,
            "connected": True,
            "path": str(STATIC_JSON_PATH),
            "count": n,
            "mode": "local_json",
            "latency": "in_memory",
        }
    except Exception as exc:
        return {
            "active": False,
            "connected": False,
            "path": str(STATIC_JSON_PATH),
            "error": str(exc)[:200],
        }
