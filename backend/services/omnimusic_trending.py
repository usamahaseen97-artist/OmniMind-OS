"""
Cached Audius trending feed — fast OmniMusic dashboard (no per-track resolve).
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Optional

from services.omnimusic_resolver import audius_hit_to_doc, audius_search_as_tracks

logger = logging.getLogger(__name__)

_CACHE: tuple[float, list[dict[str, Any]]] | None = None
_CACHE_TTL = 1800.0
_SEM = asyncio.Semaphore(5)

TRENDING_QUERIES = [
    "Pasoori",
    "Tu Hai Kahan AUR",
    "Jhol Maanu",
    "Kesariya Arijit",
    "Chaleya Jawan",
    "Atif Aslam",
    "Arijit Singh",
    "Coke Studio Pakistan",
    "Dil Dil Pakistan",
    "Bohemian Rhapsody",
    "Blinding Lights",
    "Taylor Swift Anti Hero",
    "Drake",
    "Ed Sheeran Shape of You",
    "Bollywood hits",
    "Pakistani viral songs",
    "Punjabi hits",
    "K-pop trending",
    "The Weeknd",
    "Imagine Dragons",
]


async def _fetch_query(query: str, *, per_query: int = 4) -> list[dict[str, Any]]:
    async with _SEM:
        try:
            hits = await audius_search_as_tracks(query, limit=per_query)
            return hits
        except Exception as exc:
            logger.debug("Trending query %s failed: %s", query, exc)
            return []


async def _build_trending_pool() -> list[dict[str, Any]]:
    chunks = await asyncio.gather(*[_fetch_query(q) for q in TRENDING_QUERIES])
    seen: set[str] = set()
    merged: list[dict[str, Any]] = []
    for batch in chunks:
        for doc in batch:
            tid = str(doc.get("audius_id") or doc.get("id") or "")
            if not tid or tid in seen:
                continue
            seen.add(tid)
            doc = dict(doc)
            doc["playlist"] = doc.get("playlist") or "Trending Now"
            doc["category"] = doc.get("category") or "Trending"
            doc["era"] = "latest"
            if "trending" not in doc.get("tags", []):
                doc["tags"] = [*list(doc.get("tags") or []), "trending", "latest"]
            merged.append(doc)
    if not merged:
        from services.omnimusic_catalog import PRODUCTION_SONGS

        for raw in PRODUCTION_SONGS[:48]:
            doc = dict(raw)
            doc.setdefault("playlist", "Trending Now")
            doc.setdefault("category", "Trending")
            doc.setdefault("tags", [*list(doc.get("tags") or []), "trending", "fallback"])
            merged.append(doc)
        logger.info("OmniMusic trending using production catalog fallback (%s tracks)", len(merged))
    return merged


async def get_trending_tracks(
    *,
    limit: int = 48,
    playlist: Optional[str] = None,
    category: Optional[str] = None,
) -> list[dict[str, Any]]:
    global _CACHE
    now = time.time()
    if _CACHE is None or now - _CACHE[0] > _CACHE_TTL:
        pool = await _build_trending_pool()
        _CACHE = (now, pool)
        logger.info("OmniMusic trending cache refreshed (%s tracks)", len(pool))
    pool = list(_CACHE[1])

    filt = (playlist or category or "").strip()
    if filt and filt != "all":
        low = filt.lower()
        pool = [
            d
            for d in pool
            if low in (d.get("playlist") or "").lower()
            or low in (d.get("category") or "").lower()
            or low in (d.get("artist") or "").lower()
            or any(low in str(t).lower() for t in d.get("tags") or [])
        ]

    return pool[:limit]


def trending_doc_from_hit(hit: dict[str, Any], *, label: str = "") -> dict[str, Any]:
    return audius_hit_to_doc(hit, query=label)
