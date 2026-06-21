"""
TMDB integration for OmniMovies — international posters, ratings, trailers.
Falls back to curated playable catalog when TMDB_API_KEY is unset.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from config import get_settings
from services.omnistream_catalog import FEATURED_CATALOG

logger = logging.getLogger(__name__)

TMDB_BASE = "https://api.themoviedb.org/3"
IMG_BASE = "https://image.tmdb.org/t/p"

# Playable HLS/MP4 rotation for TMDB-only metadata cards
_STREAM_POOL = [
    str(e.get("stream_url") or "")
    for e in FEATURED_CATALOG
    if e.get("stream_url")
]


def _poster(path: Optional[str], size: str = "w500") -> str:
    if path:
        return f"{IMG_BASE}/{size}{path}"
    return ""


def _backdrop(path: Optional[str], size: str = "w1280") -> str:
    if path:
        return f"{IMG_BASE}/{size}{path}"
    return ""


def _stream_for_index(i: int) -> tuple[str, str]:
    if not _STREAM_POOL:
        return "", "file"
    url = _STREAM_POOL[i % len(_STREAM_POOL)]
    kind = "hls" if url.lower().split("?")[0].endswith(".m3u8") else "file"
    return url, kind


def _normalize_tmdb(item: dict[str, Any], *, idx: int, category: str) -> dict[str, Any]:
    mid = str(item.get("id") or f"tmdb-{idx}")
    title = str(item.get("title") or item.get("name") or "Untitled")
    overview = str(item.get("overview") or "")
    rating = float(item.get("vote_average") or 0) if item.get("vote_average") else None
    year_raw = (item.get("release_date") or item.get("first_air_date") or "")[:4]
    year = int(year_raw) if year_raw.isdigit() else None
    stream_url, stream_kind = _stream_for_index(idx)
    return {
        "id": f"tmdb-{mid}",
        "title": title,
        "description": overview,
        "overview": overview,
        "category": category,
        "genres": [category],
        "release_year": year,
        "rating": rating,
        "thumbnail_url": _poster(item.get("poster_path")),
        "backdrop_url": _backdrop(item.get("backdrop_path")),
        "poster_url": _poster(item.get("poster_path")),
        "stream_url": stream_url,
        "stream_kind": stream_kind,
        "trailer_url": "",
        "source": "tmdb",
        "tmdb_id": int(item["id"]) if str(item.get("id", "")).isdigit() else None,
    }


def _curated_fallback() -> list[dict[str, Any]]:
    """Premium featured rows when TMDB is unavailable."""
    out: list[dict[str, Any]] = []
    for i, row in enumerate(FEATURED_CATALOG):
        url = str(row.get("stream_url") or "")
        kind = str(row.get("stream_kind") or ("hls" if url.endswith(".m3u8") else "file"))
        out.append(
            {
                "id": str(row["id"]),
                "title": str(row["title"]),
                "description": str(row.get("description") or ""),
                "overview": str(row.get("description") or ""),
                "category": str(row.get("category") or "Featured"),
                "genres": [str(row.get("category") or "Featured")],
                "release_year": row.get("release_year"),
                "rating": row.get("rating"),
                "thumbnail_url": str(row.get("thumbnail_url") or ""),
                "backdrop_url": str(row.get("thumbnail_url") or ""),
                "poster_url": str(row.get("thumbnail_url") or ""),
                "stream_url": url,
                "stream_kind": kind,
                "trailer_url": "",
                "source": "featured",
                "tmdb_id": None,
            }
        )
    return out


async def _tmdb_get(path: str, *, params: Optional[dict[str, str]] = None) -> dict[str, Any]:
    settings = get_settings()
    key = settings.tmdb_api_key.strip()
    if not key:
        return {}
    q = {"api_key": key, "language": "en-US", **(params or {})}
    async with httpx.AsyncClient(timeout=12.0) as client:
        res = await client.get(f"{TMDB_BASE}{path}", params=q)
        res.raise_for_status()
        return res.json()


async def fetch_trailer_url(tmdb_id: int) -> str:
    try:
        data = await _tmdb_get(f"/movie/{tmdb_id}/videos")
        for vid in data.get("results") or []:
            if vid.get("site") == "YouTube" and vid.get("type") in ("Trailer", "Teaser"):
                key = vid.get("key")
                if key:
                    return f"https://www.youtube.com/watch?v={key}"
    except Exception as exc:
        logger.debug("TMDB trailer %s: %s", tmdb_id, exc)
    return ""


async def fetch_international_movies(
    *,
    query: str = "",
    limit: int = 80,
) -> tuple[list[dict[str, Any]], str]:
    """
    Return normalized movie dicts + source label (tmdb | featured).
    """
    settings = get_settings()
    if not settings.tmdb_api_key.strip():
        items = _curated_fallback()
        q = query.strip().lower()
        if q:
            items = [
                m
                for m in items
                if q in f"{m['title']} {m['description']} {m['category']}".lower()
            ]
        return items[:limit], "featured"

    merged: list[dict[str, Any]] = []
    seen: set[str] = set()

    async def add_batch(path: str, params: dict[str, str], category: str) -> None:
        nonlocal merged
        try:
            data = await _tmdb_get(path, params=params)
            for i, raw in enumerate(data.get("results") or []):
                doc = _normalize_tmdb(raw, idx=len(merged) + i, category=category)
                if doc["id"] in seen:
                    continue
                seen.add(doc["id"])
                merged.append(doc)
        except Exception as exc:
            logger.warning("TMDB %s failed: %s", path, exc)

    if query.strip():
        await add_batch("/search/movie", {"query": query.strip(), "page": "1"}, "Search")
    else:
        await add_batch("/trending/movie/week", {"page": "1"}, "Trending Now")
        await add_batch("/movie/popular", {"page": "1"}, "Hollywood")
        await add_batch("/movie/top_rated", {"page": "1"}, "Classics")

    if len(merged) < 12:
        for row in _curated_fallback():
            if row["id"] not in seen:
                seen.add(row["id"])
                merged.append(row)

    # Enrich top titles with trailer links (best-effort, capped)
    for doc in merged[:16]:
        tid = doc.get("tmdb_id")
        if tid:
            doc["trailer_url"] = await fetch_trailer_url(int(tid))

    return merged[:limit], "tmdb"
