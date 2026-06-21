"""
OmniMovies API — Netflix-style catalog, Kafka movie-analytics, Spark trending/personalized.

Prefix: /api/v1/movies
"""

from __future__ import annotations

import logging
from typing import Annotated, Any, Literal, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from config import get_settings
from services.kafka_pipeline import ingest, schedule_telemetry, TelemetryEvent
from services.movie_spark_analytics import compute_movie_analytics
from services.omnimovies_international import INTERNATIONAL_COLLECTIONS, build_international_catalog
from services.spark_analytics import collaborative_recommendations, process_stream_batch
from services.tmdb_client import fetch_international_movies

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/movies", tags=["omnimovies"])


class MovieEventBody(BaseModel):
    movie_id: str = Field(..., min_length=1, max_length=120)
    action: Literal["click", "play", "view", "pause", "skip", "stop", "buffer"]
    user_id: str = Field(default="anonymous", max_length=120)
    title: str = Field(default="", max_length=300)
    category: str = Field(default="", max_length=120)
    genres: list[str] = Field(default_factory=list)
    network_bitrate: float = Field(default=0.0, ge=0)
    packet_loss_ratio: float = Field(default=0.0, ge=0, le=1)


def _public_doc(doc: dict[str, Any], *, base_url: str) -> dict[str, Any]:
    stream = str(doc.get("stream_url") or "")
    if stream and not stream.startswith("http"):
        stream = f"{base_url.rstrip('/')}{stream}"
    poster = (
        doc.get("poster_url")
        or doc.get("thumbnail_url")
        or doc.get("backdrop_url")
        or ""
    )
    return {
        "id": doc["id"],
        "title": doc["title"],
        "description": doc.get("description") or doc.get("overview") or "",
        "overview": doc.get("overview") or doc.get("description") or "",
        "category": doc.get("category") or "International",
        "genres": doc.get("genres") or [doc.get("category") or "International"],
        "release_year": doc.get("release_year"),
        "rating": doc.get("rating"),
        "thumbnail_url": poster,
        "poster_url": poster,
        "backdrop_url": doc.get("backdrop_url") or poster,
        "stream_url": stream,
        "stream_kind": doc.get("stream_kind") or ("hls" if ".m3u8" in stream else "file"),
        "trailer_url": doc.get("trailer_url") or "",
        "source": doc.get("source") or "catalog",
        "tmdb_id": doc.get("tmdb_id"),
    }


@router.get("/catalog")
async def movies_catalog(
    q: Annotated[Optional[str], Query(max_length=200)] = None,
    user_id: Annotated[str, Query(max_length=120)] = "anonymous",
    limit: Annotated[int, Query(ge=12, le=120)] = 80,
):
    """
    Full OmniMovies dashboard payload for the frontend (port 8001).
    Trending Now + Personalized for You powered by Spark/Python over movie-analytics events.
    """
    settings = get_settings()
    base = settings.omnimind_public_api_url.rstrip("/")

    intl = build_international_catalog()
    tmdb_items, tmdb_source = await fetch_international_movies(query=q or "", limit=limit)
    merged_raw: list[dict] = []
    seen: set[str] = set()
    for doc in intl + tmdb_items:
        mid = str(doc.get("id") or "")
        if mid and mid not in seen:
            seen.add(mid)
            merged_raw.append(doc)
    catalog = [_public_doc(d, base_url=base) for d in merged_raw]
    if not catalog:
        catalog = [_public_doc(d, base_url=base) for d in intl]
    catalog_source = f"international+{tmdb_source}"
    by_id = {m["id"]: m for m in catalog}

    if q:
        ql = q.lower()
        filtered = [
            m
            for m in catalog
            if ql in f"{m['title']} {m['overview']} {' '.join(m.get('genres', []))}".lower()
        ]
        if filtered:
            catalog = filtered

    spark_trending = collaborative_recommendations(
        user_id, domain="movie", catalog=catalog, limit=20
    )
    spark_personal = collaborative_recommendations(
        user_id, domain="movie", catalog=list(reversed(catalog)), limit=20
    )

    legacy = compute_movie_analytics(
        user_id=user_id,
        catalog_by_id=by_id,
        trending_limit=20,
        personalized_limit=20,
    )

    trending = spark_trending or legacy.get("trending_now") or catalog[:20]
    personalized = spark_personal or legacy.get("personalized_for_you") or catalog[4:24]

    hero = (personalized[0] if personalized else None) or (trending[0] if trending else None) or (
        catalog[0] if catalog else None
    )

    genre_rows = legacy.get("genre_rows") or []
    if not genre_rows:
        buckets: dict[str, list[dict[str, Any]]] = {}
        for m in catalog:
            g = m.get("category") or "International"
            buckets.setdefault(g, []).append(m)
        genre_rows = [{"genre": g, "items": items} for g, items in buckets.items()]

    schedule_telemetry(
        TelemetryEvent(
            user_id=user_id,
            content_id="catalog",
            genre="international",
            playback_status="view",
            domain="movie",
            title="OmniMovies Catalog",
        )
    )

    pipeline = process_stream_batch()

    return {
        "source": catalog_source,
        "count": len(catalog),
        "hero": hero,
        "trending_now": trending,
        "personalized_for_you": personalized,
        "rows": genre_rows,
        "collections": [
            {
                "name": block["collection"],
                "theme": block["theme"],
                "count": len(block["movies"]),
            }
            for block in INTERNATIONAL_COLLECTIONS
        ],
        "analytics": {
            "engine": legacy.get("engine"),
            "event_count": legacy.get("event_count"),
            "kafka_topic": settings.kafka_movie_events_topic,
            "pipeline": pipeline,
        },
        "movies": catalog,
    }


@router.post("/event")
async def movies_event(body: MovieEventBody):
    """Telemetry → Kafka ``movie-events``."""
    genre = body.category or (body.genres[0] if body.genres else "International")
    result = await ingest(
        domain="movie",
        user_id=body.user_id,
        content_id=body.movie_id,
        genre=genre,
        playback_status=body.action,
        network_bitrate=body.network_bitrate,
        packet_loss_ratio=body.packet_loss_ratio,
        title=body.title,
        extra={"genres": body.genres, "category": body.category},
    )
    return {"ok": True, **result}


@router.get("/analytics/summary")
async def movies_analytics_summary(
    user_id: Annotated[str, Query(max_length=120)] = "anonymous",
):
    """Spark/Python analytics snapshot for dashboards."""
    raw, source = await fetch_international_movies(limit=60)
    settings = get_settings()
    base = settings.omnimind_public_api_url.rstrip("/")
    by_id = {d["id"]: _public_doc(d, base_url=base) for d in raw}
    analytics = compute_movie_analytics(user_id=user_id, catalog_by_id=by_id)
    return {"catalog_source": source, **analytics}


@router.get("/health")
async def movies_health():
    settings = get_settings()
    return {
        "ok": True,
        "service": "omnimovies",
        "tmdb_configured": bool(settings.tmdb_api_key.strip()),
        "kafka_topic": settings.kafka_movie_events_topic,
        "api_base": settings.omnimind_public_api_url,
    }
