"""
Bulk Audius catalog ingest — 1000+ playable tracks for OmniMusic browse/search.
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any, Optional

from services.omnimusic_catalog import PRODUCTION_SONGS
from services.omnimusic_resolver import audius_search_as_tracks
from services.omnimusic_store import _normalize

logger = logging.getLogger(__name__)

_BULK_CACHE: list[dict[str, Any]] | None = None
_SEM = asyncio.Semaphore(8)

# Wide query net — artists, genres, viral titles, letters (Audius returns diverse hits)
BULK_SEARCH_QUERIES = [
    "a", "e", "i", "o", "the", "love", "remix", "official",
    "Pasoori", "Aadat", "Jhol", "Kesariya", "Chaleya", "Tum Hi Ho", "Raabta",
    "Atif Aslam", "Arijit Singh", "Rahat Fateh Ali Khan", "Nusrat Fateh Ali Khan",
    "Ali Sethi", "Young Stunners", "Bohemia", "Diljit", "Sidhu Moose Wala",
    "Coke Studio", "Pakistani", "Bollywood", "Punjabi", "Urdu", "Hindi",
    "Taylor Swift", "Drake", "The Weeknd", "Ed Sheeran", "Eminem", "Beyonce",
    "Billie Eilish", "Harry Styles", "Justin Bieber", "Rihanna", "Coldplay",
    "Imagine Dragons", "Linkin Park", "BTS", "Blackpink", "K-pop",
    "rock", "pop", "hip hop", "rap", "edm", "house", "techno", "jazz",
    "blues", "country", "reggae", "latin", "spanish", "arabic", "turkish",
    "instrumental", "chill", "lofi", "workout", "party", "romantic",
    "2024", "2023", "2022", "viral", "trending", "hits", "classic",
    "Shae Gill", "Hasan Raheem", "Maanu", "Talha Anjum", "KK", "Pritam",
    "Shreya Ghoshal", "Sonu Nigam", "Badshah", "AP Dhillon", "Karan Aujla",
    "Neha Kakkar", "Ariana Grande", "Post Malone", "Travis Scott", "Kendrick Lamar",
    "Sia", "Adele", "Bruno Mars", "Dua Lipa", "Marshmello", "Avicii",
    "Skrillex", "Daft Punk", "Queen", "Beatles", "Michael Jackson",
    "Pakistan", "India", "Lahore", "Mumbai", "Karachi", "Desi",
    "folk", "acoustic", "cover", "live", "studio", "mix", "beat",
]


def _assign_playlist(doc: dict[str, Any]) -> dict[str, Any]:
    blob = f"{doc.get('title','')} {doc.get('artist','')} {' '.join(doc.get('tags') or [])}".lower()
    if any(k in blob for k in ("pakistan", "coke studio", "atif", "pasoori", "punjabi", "urdu", "lahore")):
        doc["playlist"] = "Pakistani Latest"
        doc["category"] = "Latest"
    elif any(k in blob for k in ("bollywood", "arijit", "hindi", "shahrukh", "pritam")):
        doc["playlist"] = "Bollywood Latest"
        doc["category"] = "Latest"
    elif any(k in blob for k in ("k-pop", "bts", "blackpink")):
        doc["playlist"] = "Global Pop"
        doc["category"] = "Pop"
    elif any(k in blob for k in ("rock", "metal", "linkin")):
        doc["playlist"] = "Hollywood Classics"
        doc["category"] = "Classics"
    else:
        doc["playlist"] = doc.get("playlist") or "Global Pop"
        doc["category"] = doc.get("category") or "Pop"
    doc["era"] = doc.get("era") or "latest"
    doc["source"] = "audius"
    if "catalog" not in (doc.get("tags") or []):
        doc["tags"] = [*list(doc.get("tags") or []), "catalog", "bulk"]
    return doc


async def _fetch_batch(query: str, *, per_query: int = 30) -> list[dict[str, Any]]:
    async with _SEM:
        try:
            tracks = await audius_search_as_tracks(query, limit=per_query)
            return [_assign_playlist(t) for t in tracks]
        except Exception as exc:
            logger.debug("bulk query %s: %s", query, exc)
            return []


async def build_bulk_catalog(*, target: int = 1200) -> list[dict[str, Any]]:
    """Fetch Audius tracks until target count (deduped)."""
    global _BULK_CACHE
    if _BULK_CACHE and len(_BULK_CACHE) >= min(target, 500):
        return _BULK_CACHE[:target]

    seen: set[str] = set()
    merged: list[dict[str, Any]] = []

    for raw in PRODUCTION_SONGS:
        doc = _normalize(_assign_playlist(dict(raw)))
        if doc["id"] not in seen:
            seen.add(doc["id"])
            merged.append(doc)

    logger.info("OmniMusic bulk ingest: %s seed queries, target %s", len(BULK_SEARCH_QUERIES), target)
    batch_size = 12
    for i in range(0, len(BULK_SEARCH_QUERIES), batch_size):
        if len(merged) >= target:
            break
        chunk = BULK_SEARCH_QUERIES[i : i + batch_size]
        results = await asyncio.gather(*[_fetch_batch(q) for q in chunk])
        for batch in results:
            for doc in batch:
                sid = str(doc.get("id") or "")
                if not sid or sid in seen:
                    continue
                seen.add(sid)
                merged.append(doc)
        logger.info("OmniMusic bulk progress: %s tracks", len(merged))

    _BULK_CACHE = merged
    logger.info("OmniMusic bulk catalog ready: %s tracks", len(merged))
    return merged


async def bulk_seed_store(*, target: int = 1200, replace: bool = True) -> dict[str, Any]:
    """Persist bulk catalog to memory, MongoDB, and Elasticsearch."""
    from services import omnimusic_store as store
    from services.elasticsearch_songs import bulk_save_songs_to_elasticsearch

    docs = await build_bulk_catalog(target=target)
    stored = "memory"

    db = await store._db()
    if db is not None:
        try:
            if docs:
                if replace:
                    await db[store.SONGS].delete_many({})
                batch = 500
                for i in range(0, len(docs), batch):
                    await db[store.SONGS].insert_many(docs[i : i + batch])
            stored = "mongodb"
        except Exception as exc:
            logger.warning("bulk mongo seed: %s", exc)

    if replace:
        store._mem_songs.clear()
    for doc in docs:
        store._mem_songs[doc["id"]] = doc

    es_indexed = 0
    try:
        es_indexed = await bulk_save_songs_to_elasticsearch(docs, refresh=True)
    except Exception as exc:
        logger.warning("bulk ES seed: %s", exc)

    return {
        "success": True,
        "catalog_size": len(docs),
        "target": target,
        "stored": stored,
        "elasticsearch_indexed": es_indexed,
        "replaced": replace,
    }


def list_catalog_slice(
    *,
    offset: int = 0,
    limit: int = 80,
    playlist: Optional[str] = None,
    query: str = "",
) -> tuple[list[dict[str, Any]], int]:
    """In-memory paginated browse from bulk cache / mem store."""
    from services import omnimusic_store as store

    pool: list[dict[str, Any]]
    if _BULK_CACHE:
        pool = list(_BULK_CACHE)
    elif store._mem_songs:
        pool = list(store._mem_songs.values())
    else:
        pool = [_normalize(s) for s in PRODUCTION_SONGS]

    q = query.strip().lower()
    pl = (playlist or "").strip().lower()
    filtered: list[dict[str, Any]] = []
    for doc in pool:
        if pl and pl != "all":
            if pl not in (doc.get("playlist") or "").lower() and pl not in (
                doc.get("category") or ""
            ).lower():
                continue
        if q:
            blob = f"{doc['title']} {doc['artist']} {' '.join(doc.get('tags') or [])}".lower()
            if q not in blob and not all(t in blob for t in q.split() if len(t) > 1):
                if not any(t in blob for t in q.split() if len(t) >= 2):
                    continue
        filtered.append(doc)

    filtered.sort(key=lambda d: (d.get("title") or "").lower())
    total = len(filtered)
    return filtered[offset : offset + limit], total
