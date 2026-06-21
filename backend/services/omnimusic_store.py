"""
OmniMusic MongoDB store — songs collection for production search & playback.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Optional

from services.omnimusic_catalog import PRODUCTION_SONGS
from services.omnimusic_resolver import audius_search_as_tracks
from services.omnimusic_trending import get_trending_tracks

logger = logging.getLogger(__name__)

SONGS = "songs"
_mem_songs: dict[str, dict[str, Any]] = {}


async def _db():
    try:
        from services.mongo_async import get_async_database

        return await get_async_database()
    except Exception as exc:
        logger.debug("OmniMusic Mongo unavailable: %s", exc)
        return None


def _normalize(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(doc.get("id") or doc.get("_id") or ""),
        "title": str(doc.get("title") or ""),
        "artist": str(doc.get("artist") or ""),
        "album": str(doc.get("album") or ""),
        "duration": str(doc.get("duration") or "4:00"),
        "duration_sec": int(doc.get("duration_sec") or doc.get("durationSec") or 240),
        "category": str(doc.get("category") or "Pop"),
        "playlist": str(doc.get("playlist") or doc.get("category") or "Pop"),
        "year": int(doc.get("year") or 2020),
        "era": str(doc.get("era") or "latest"),
        "thumbnail_url": str(doc.get("thumbnail_url") or ""),
        "audio_url": str(doc.get("audio_url") or ""),
        "tags": list(doc.get("tags") or []),
        "source": str(doc.get("source") or "omnimusic"),
    }


def _score(doc: dict[str, Any], query: str) -> int:
    if not query:
        return 1
    q = query.lower().strip()
    blob = " ".join(
        [
            doc["title"],
            doc["artist"],
            doc["album"],
            doc["category"],
            doc.get("playlist", ""),
            " ".join(doc.get("tags", [])),
        ]
    ).lower()
    if q in blob:
        return 100
    tokens = [t for t in re.split(r"\s+", q) if len(t) > 1]
    return sum(30 for t in tokens if t in blob)


async def seed_songs(replace: bool = True) -> dict[str, Any]:
    """Replace MongoDB songs with the production catalog + Elasticsearch songs index."""
    docs = [_normalize(s) for s in PRODUCTION_SONGS]
    stored = "memory"
    db = await _db()
    if db is not None:
        try:
            if replace:
                await db[SONGS].delete_many({})
                if docs:
                    await db[SONGS].insert_many(docs)
            else:
                for doc in docs:
                    await db[SONGS].update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
            stored = "mongodb"
        except Exception as exc:
            logger.warning("OmniMusic seed failed, using memory: %s", exc)

    if replace:
        _mem_songs.clear()
    for doc in docs:
        _mem_songs[doc["id"]] = doc

    es_indexed = 0
    try:
        from services.elasticsearch_songs import bulk_save_songs_to_elasticsearch

        es_indexed = await bulk_save_songs_to_elasticsearch(docs, refresh=True)
    except Exception as exc:
        logger.warning("Elasticsearch seed index skipped: %s", exc)

    return {
        "seeded": len(docs),
        "stored": stored,
        "replaced": replace,
        "elasticsearch_indexed": es_indexed,
    }


def _search_mem_pool(
    q: str,
    *,
    cat: str = "",
    limit: int = 100,
) -> list[dict[str, Any]]:
    results: list[tuple[int, dict[str, Any]]] = []
    for doc in _mem_songs.values():
        if cat and cat != "all" and doc["category"] != cat and doc.get("playlist") != cat:
            continue
        sc = _score(doc, q) if q else 1
        if sc > 0 or not q:
            results.append((sc, doc))
    results.sort(key=lambda x: (-x[0], -x[1].get("year", 0), x[1]["title"]))
    return [d for _, d in results[:limit]]


async def search_songs(
    query: str = "",
    *,
    category: Optional[str] = None,
    playlist: Optional[str] = None,
    limit: int = 80,
    offset: int = 0,
) -> list[dict[str, Any]]:
    q = query.strip()
    cat = (category or playlist or "").strip()
    results: list[tuple[int, dict[str, Any]]] = []

    db = await _db()
    if db is not None:
        try:
            clauses: list[dict[str, Any]] = []
            if cat and cat != "all":
                clauses.append({"$or": [{"category": cat}, {"playlist": cat}]})
            if q:
                clauses.append(
                    {
                        "$or": [
                            {"title": {"$regex": q, "$options": "i"}},
                            {"artist": {"$regex": q, "$options": "i"}},
                            {"album": {"$regex": q, "$options": "i"}},
                            {"tags": q},
                        ]
                    }
                )
            filt: dict[str, Any] = clauses[0] if len(clauses) == 1 else {"$and": clauses} if clauses else {}
            cursor = db[SONGS].find(filt).limit(limit * 2)
            docs = await cursor.to_list(length=limit * 2)
            for raw in docs:
                doc = _normalize(raw)
                sc = _score(doc, q) if q else 1
                if sc > 0 or not q:
                    results.append((sc, doc))
        except Exception as exc:
            logger.warning("OmniMusic Mongo search failed: %s", exc)

    if not results:
        for doc in _mem_songs.values():
            if cat and cat != "all" and doc["category"] != cat and doc.get("playlist") != cat:
                continue
            sc = _score(doc, q)
            if sc > 0 or not q:
                results.append((sc, doc))
        if not results and not _mem_songs:
            for raw in PRODUCTION_SONGS:
                doc = _normalize(raw)
                if cat and cat != "all" and doc["category"] != cat:
                    continue
                sc = _score(doc, q)
                if sc > 0 or not q:
                    results.append((sc, doc))

    results.sort(key=lambda x: (-x[0], -x[1].get("year", 0), x[1]["title"]))
    out = [d for _, d in results[:limit]]

    if q:
        from services.omnimusic_global_search import dynamic_global_search

        result = await dynamic_global_search(
            q,
            category=category,
            playlist=playlist,
            limit=limit,
            offset=offset,
        )
        return result["tracks"]

    if len(_mem_songs) >= 100:
        from services.omnimusic_bulk_catalog import list_catalog_slice

        rows, _ = list_catalog_slice(
            offset=offset,
            limit=limit,
            playlist=cat or None,
            query="",
        )
        if rows:
            return rows

    trending = await get_trending_tracks(
        limit=min(limit + offset, 120),
        playlist=cat or None,
        category=cat or None,
    )
    seen: set[str] = set()
    merged: list[dict[str, Any]] = []
    for doc in trending + out:
        if doc["id"] in seen:
            continue
        seen.add(doc["id"])
        merged.append(doc)
    return merged[offset : offset + limit]


async def catalog_total() -> int:
    if _mem_songs:
        return len(_mem_songs)
    db = await _db()
    if db is not None:
        try:
            return await db[SONGS].count_documents({})
        except Exception:
            pass
    return len(PRODUCTION_SONGS)


async def count_songs() -> int:
    return await catalog_total()
