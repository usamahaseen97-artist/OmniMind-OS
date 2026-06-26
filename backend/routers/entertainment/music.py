"""OmniMusic — MongoDB songs, search, seed, and generation hook."""

from __future__ import annotations

import logging
from typing import Annotated, AsyncIterator, Optional

logger = logging.getLogger(__name__)

import httpx
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import Field, field_validator

from config import get_settings
from schemas.strict import StrictModel
from schemas.validators import validate_non_blank_str
from services import audius_client, omnimusic_catalog as catalog
from services.entertainment_pipeline import schedule_entertainment_event
from services.omnimusic_store import count_songs, search_songs, seed_songs
from services.omnimusic_search_intel import (
    music_identify_snippet,
    music_predict_queries,
    music_recommendations,
    music_suggestions,
)
from services.entertainment_resilience import safe_await
from services.omnimusic_trending import get_trending_tracks
from services.songs_static_provider import (
    get_static_songs,
    search_static_songs,
    static_catalog_size,
)
from services.spotify_youtube_music import (
    AudioStreamError,
    SpotifyNotConfiguredError,
    TrackNotFoundError,
    search_song_with_stream,
)

router = APIRouter(prefix="/api/v1/music", tags=["omni-music"])
v1_router = router
legacy_router = APIRouter(prefix="/api/music", tags=["omni-music-legacy"])


def _legacy_redirect(path: str, request: Request) -> RedirectResponse:
    """307 to canonical /api/v1/music — preserves HTTP method and body."""
    suffix = f"?{request.url.query}" if request.url.query else ""
    return RedirectResponse(url=f"/api/v1/music{path}{suffix}", status_code=307)


def _public_track(track: dict) -> dict:
    return {
        "id": track["id"],
        "title": track["title"],
        "artist": track["artist"],
        "album": track["album"],
        "duration": track.get("duration", "4:00"),
        "durationSec": track.get("duration_sec", 240),
        "category": track.get("category", "Pop"),
        "playlist": track.get("playlist", track.get("category", "Pop")),
        "year": track.get("year"),
        "era": track.get("era", "latest"),
        "tags": track.get("tags", []),
        "thumbnailUrl": track.get("thumbnail_url") or "",
        "audioUrl": track.get("audio_url") or "",
        "dynamic": bool(track.get("dynamic")),
        "source": track.get("source", "omnimusic"),
        "youtubeId": track.get("youtube_id") or "",
        "global": bool(track.get("dynamic")) or track.get("source") == "youtube",
    }


class MusicGenerateRequest(StrictModel):
    prompt: str = Field(..., min_length=1, max_length=2000)
    duration_seconds: int = Field(default=30, ge=5, le=300)
    style: Optional[str] = Field(default=None, max_length=128)

    @field_validator("prompt")
    @classmethod
    def prompt_ok(cls, v: str) -> str:
        return validate_non_blank_str(v)


class MusicIdentifyRequest(StrictModel):
    snippet: str = Field(..., min_length=2, max_length=500)
    user_id: Optional[str] = Field(default=None, max_length=128)


class MusicRecommendRequest(StrictModel):
    user_id: str = Field(default="", max_length=128)
    play_history: list[dict] = Field(default_factory=list)


@router.get("/health")
async def music_health():
    from services.elasticsearch_songs import elasticsearch_health
    from services.songs_static_provider import static_provider_health

    n = await safe_await(count_songs, fallback=static_catalog_size(), label="music/health/count")
    es = await elasticsearch_health()
    static = static_provider_health()
    search_mode = es.get("search_mode") or "local_json"
    return {
        "service": "omni-music",
        "status": "ready",
        "catalog_size": n,
        "production_catalog": len(catalog.PRODUCTION_SONGS),
        "playlists": len(catalog.PLAYLISTS),
        "categories": catalog.list_categories(),
        "elasticsearch": es,
        "static_catalog": static,
        "search_mode": search_mode,
        "playback": f"{search_mode}+audius",
        "ingestion": "audius-open-audio",
        "note": (
            "Elasticsearch offline — instant local JSON search active"
            if es.get("fallback_active")
            else "Real streams via Audius — search any artist or song"
        ),
        "chatbot_search": "/api/music/search?song_name=...",
        "spotify_configured": bool(
            get_settings().spotify_client_id.strip()
            and get_settings().spotify_client_secret.strip()
        ),
    }


@legacy_router.get("/health")
async def legacy_music_health(request: Request):
    return _legacy_redirect("/health", request)


@router.get("/play/youtube/{video_id}")
async def play_youtube_stream(video_id: str, request: Request):
    """Proxy YouTube audio stream (yt-dlp resolve) — CORS-safe playback for global search."""
    from services.omnimusic_global_search import youtube_stream_url_sync
    from services.infra_pool import run_blocking

    try:
        resolved = await run_blocking(youtube_stream_url_sync, video_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"YouTube stream error: {exc}") from exc

    url = resolved["stream_url"]
    headers: dict[str, str] = {}
    if request.headers.get("range"):
        headers["Range"] = request.headers.get("range", "")

    client = httpx.AsyncClient(timeout=httpx.Timeout(30.0, read=180.0))
    try:
        upstream = await client.send(
            client.build_request("GET", url, headers=headers),
            stream=True,
            follow_redirects=True,
        )
    except httpx.HTTPError as exc:
        await client.aclose()
        raise HTTPException(status_code=502, detail=f"YouTube upstream error: {exc}") from exc

    if upstream.status_code >= 400:
        await upstream.aclose()
        await client.aclose()
        raise HTTPException(status_code=upstream.status_code, detail="YouTube stream unavailable")

    out_headers: dict[str, str] = {
        "Accept-Ranges": "bytes",
        "Content-Type": resolved.get("content_type") or upstream.headers.get("content-type", "audio/mpeg"),
        "Cache-Control": "no-store",
    }
    if cl := upstream.headers.get("content-length"):
        out_headers["Content-Length"] = cl
    if cr := upstream.headers.get("content-range"):
        out_headers["Content-Range"] = cr

    async def stream_body() -> AsyncIterator[bytes]:
        try:
            async for chunk in upstream.aiter_bytes(chunk_size=262_144):
                yield chunk
        finally:
            await upstream.aclose()
            await client.aclose()

    return StreamingResponse(
        stream_body(),
        status_code=upstream.status_code,
        headers=out_headers,
    )


@router.get("/play/{track_id}")
async def play_audius_stream(track_id: str, request: Request):
    """Proxy Audius stream through OmniMind (CORS-safe, seek/range supported)."""
    host = await audius_client.get_discovery_host()
    url = audius_client.upstream_stream_url(host, track_id)
    headers: dict[str, str] = {}
    if request.headers.get("range"):
        headers["Range"] = request.headers.get("range", "")

    client = httpx.AsyncClient(timeout=httpx.Timeout(30.0, read=180.0))
    try:
        upstream = await client.send(
            client.build_request(
                "GET",
                url,
                params={"app_name": audius_client.APP_NAME},
                headers=headers,
            ),
            stream=True,
            follow_redirects=True,
        )
    except httpx.HTTPError as exc:
        await client.aclose()
        raise HTTPException(status_code=502, detail=f"Audius stream error: {exc}") from exc

    if upstream.status_code >= 400:
        await upstream.aclose()
        await client.aclose()
        raise HTTPException(status_code=upstream.status_code, detail="Track stream unavailable")

    out_headers: dict[str, str] = {
        "Accept-Ranges": "bytes",
        "Content-Type": upstream.headers.get("content-type", "audio/mpeg"),
        "Cache-Control": "no-store",
    }
    if cl := upstream.headers.get("content-length"):
        out_headers["Content-Length"] = cl
    if cr := upstream.headers.get("content-range"):
        out_headers["Content-Range"] = cr

    async def stream_body() -> AsyncIterator[bytes]:
        try:
            async for chunk in upstream.aiter_bytes(chunk_size=262_144):
                yield chunk
        finally:
            await upstream.aclose()
            await client.aclose()

    return StreamingResponse(
        stream_body(),
        status_code=upstream.status_code,
        headers=out_headers,
    )


@router.get("/catalog")
async def music_catalog(
    q: Annotated[str, Query(max_length=200)] = "",
    playlist: Annotated[Optional[str], Query(max_length=64)] = None,
    category: Annotated[Optional[str], Query(max_length=32)] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 80,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    from services.omnimusic_store import catalog_total

    pl = None if not playlist or playlist == "all" else playlist
    cat = None if not category or category == "all" else category
    try:
        tracks = await search_songs(q, playlist=pl, category=cat, limit=limit, offset=offset)
    except Exception as exc:
        tracks = get_static_songs(query=q, playlist=pl, category=cat, limit=limit, offset=offset)
        if not tracks:
            logger.warning("music/catalog fallback: %s", exc)
    total = await safe_await(catalog_total, fallback=static_catalog_size(), label="music/catalog/total")
    schedule_entertainment_event(
        "omnimusic",
        "catalog",
        payload={"q": q, "playlist": pl, "count": len(tracks), "total": total},
    )
    return {
        "count": len(tracks),
        "total": total,
        "offset": offset,
        "limit": limit,
        "has_more": offset + len(tracks) < total,
        "playlists": catalog.list_playlists(q),
        "categories": catalog.list_categories(),
        "tracks": [_public_track(t) for t in tracks],
    }


@legacy_router.get("/catalog")
async def legacy_music_catalog(request: Request):
    return _legacy_redirect("/catalog", request)


@legacy_router.get("/search")
async def music_search_spotify_youtube(
    song_name: Annotated[str, Query(min_length=1, max_length=200)],
):
    """
    Chatbot Music Tool — Spotify metadata + YouTube audio stream (yt-dlp).

    Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in backend/.env.
    """
    try:
        result = await search_song_with_stream(song_name)
        schedule_entertainment_event(
            "omnimusic",
            "spotify_youtube_search",
            payload={"song_name": song_name, "title": result.get("title")},
        )
        return result
    except SpotifyNotConfiguredError as exc:
        raise HTTPException(
            status_code=503,
            detail={"error": "spotify_not_configured", "message": str(exc)},
        ) from exc
    except TrackNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except AudioStreamError as exc:
        raise HTTPException(
            status_code=502,
            detail={"error": "youtube_stream_failed", "message": str(exc)},
        ) from exc
    except Exception as exc:
        logger.exception("music/search failed for %s", song_name)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/es/reindex")
async def music_elasticsearch_reindex(replace: Annotated[bool, Query()] = True):
    """Bulk index production catalog into Elasticsearch songs index."""
    result = await safe_await(
        lambda: seed_songs(replace=replace),
        fallback={
            "seeded": static_catalog_size(),
            "stored": "local_json",
            "elasticsearch_indexed": 0,
        },
        label="music/es/reindex",
    )
    return {"success": True, **result}


@router.post("/bulk-seed")
async def music_bulk_seed(
    target: Annotated[int, Query(ge=100, le=3000)] = 1200,
    replace: Annotated[bool, Query()] = True,
):
    """Ingest 1000+ live Audius tracks into Mongo, memory, and Elasticsearch."""
    from services.omnimusic_bulk_catalog import bulk_seed_store

    result = await bulk_seed_store(target=target, replace=replace)
    schedule_entertainment_event(
        "omnimusic",
        "bulk_seed",
        payload={"catalog_size": result.get("catalog_size"), "target": target},
    )
    return result


@legacy_router.post("/bulk-seed")
async def legacy_music_bulk_seed(request: Request):
    return _legacy_redirect("/bulk-seed", request)


@router.get("/es/search")
async def music_elasticsearch_search(
    q: Annotated[str, Query(min_length=1, max_length=200)],
    limit: Annotated[int, Query(ge=1, le=20)] = 8,
):
    """Direct Elasticsearch multi_match fuzzy search (debug / tools)."""
    from services.elasticsearch_songs import search_songs_elasticsearch

    hits = await safe_await(
        lambda: search_songs_elasticsearch(q, limit=limit),
        fallback=search_static_songs(q, limit=limit),
        label="music/es/search",
    )
    return {
        "query": q,
        "count": len(hits),
        "tracks": [_public_track(t) for t in hits],
        "search_mode": "local_json" if hits and hits[0].get("source") == "local_json" else "elasticsearch",
    }


@router.get("/suggest")
async def music_suggest(
    q: Annotated[str, Query(max_length=200)] = "",
    limit: Annotated[int, Query(ge=1, le=20)] = 10,
):
    """Instant search suggestions (type-ahead, YouTube-style)."""
    items = await safe_await(
        lambda: music_suggestions(q, limit=limit),
        fallback=[],
        label="music/suggest",
    )
    return {"query": q, "suggestions": items, "search_mode": "local_json"}


@router.get("/predict")
async def music_predict(
    q: Annotated[str, Query(min_length=1, max_length=120)],
):
    """AI-predicted search queries from partial input."""
    queries = await music_predict_queries(q)
    return {"partial": q, "queries": queries}


@router.post("/identify")
async def music_identify(body: MusicIdentifyRequest):
    """Identify song from lyric line / voice transcript (TikTok, Reel)."""
    result = await music_identify_snippet(body.snippet)
    track = result.get("track")
    if track:
        result["track"] = _public_track(track)
    schedule_entertainment_event(
        "omnimusic",
        "identify",
        payload={"snippet_len": len(body.snippet), "success": result.get("success")},
    )
    return result


@router.post("/recommendations")
async def music_recommend(body: MusicRecommendRequest):
    """Personalized recommendations from play history + taste."""
    tracks = await safe_await(
        lambda: music_recommendations(
            play_history=body.play_history,
            user_id=body.user_id,
            limit=20,
        ),
        fallback=get_static_songs(limit=20),
        label="music/recommendations",
    )
    return {
        "count": len(tracks),
        "tracks": [_public_track(t) for t in tracks],
    }


@router.get("/trending")
async def music_trending(
    limit: Annotated[int, Query(ge=1, le=80)] = 40,
    playlist: Annotated[Optional[str], Query(max_length=64)] = None,
):
    """Fast trending feed (cached Audius) — Spotify-style home rows."""
    pl = None if not playlist or playlist == "all" else playlist
    tracks = await safe_await(
        lambda: get_trending_tracks(limit=limit, playlist=pl),
        fallback=get_static_songs(limit=limit),
        label="music/trending",
    )
    if not tracks:
        tracks = await safe_await(
            lambda: search_songs("", playlist=pl, limit=limit, offset=0),
            fallback=get_static_songs(limit=limit),
            label="music/trending/catalog",
        )
    schedule_entertainment_event(
        "omnimusic",
        "trending",
        payload={"count": len(tracks), "playlist": pl},
    )
    return {
        "count": len(tracks),
        "tracks": [_public_track(t) for t in tracks],
    }


@router.get("/search")
async def music_search_catalog(
    q: Annotated[str, Query(min_length=1, max_length=200)],
    category: Annotated[Optional[str], Query(max_length=32)] = None,
    limit: Annotated[int, Query(ge=1, le=120)] = 60,
):
    """
    Dynamic Global Search: Elasticsearch → local DB → Audius → YouTube (yt-dlp top 5).
    YouTube hits are async-seeded into the songs index for the next query.
    """
    from services.omnimusic_global_search import dynamic_global_search

    cat = None if not category or category == "all" else category
    try:
        result = await dynamic_global_search(q, category=cat, limit=limit, offset=0)
    except Exception as exc:
        logger.warning("music/search fallback: %s", exc)
        result = {
            "tracks": get_static_songs(query=q, category=cat, limit=limit),
            "sources": {"local_json": 1},
            "global_fallback": False,
            "elasticsearch_used": False,
            "static_json_used": True,
        }
    tracks = result["tracks"]
    schedule_entertainment_event(
        "omnimusic",
        "search",
        payload={
            "query": q.strip(),
            "count": len(tracks),
            "category": cat,
            "global_fallback": result.get("global_fallback"),
            "sources": result.get("sources"),
        },
    )
    return {
        "query": q.strip(),
        "count": len(tracks),
        "tracks": [_public_track(t) for t in tracks],
        "global_fallback": result.get("global_fallback", False),
        "sources": result.get("sources", {}),
        "elasticsearch_used": result.get("elasticsearch_used", False),
    }


@router.post("/seed")
async def music_seed(replace: Annotated[bool, Query()] = True):
    """Replace the songs collection with the production catalog."""
    result = await seed_songs(replace=replace)
    schedule_entertainment_event(
        "omnimusic",
        "seed",
        payload={"replaced": replace, "seeded": result.get("seeded")},
    )
    return {
        "success": True,
        "message": "OmniMusic production catalog seeded",
        **result,
        "categories": catalog.list_categories(),
    }


@legacy_router.post("/seed")
async def legacy_music_seed(request: Request):
    return _legacy_redirect("/seed", request)


@router.post("/generate")
async def generate_music(body: MusicGenerateRequest):
    """Placeholder — wire to music model / Replicate / local pipeline later."""
    return {
        "success": True,
        "status": "queued",
        "message": "OmniMusic generation pipeline placeholder",
        "request": {
            "prompt": body.prompt,
            "duration_seconds": body.duration_seconds,
            "style": body.style,
        },
        "audio_url": None,
        "hint": "Connect WAN / Replicate / local audio model in a future release.",
    }


@legacy_router.post("/generate")
async def legacy_generate_music(request: Request):
    return _legacy_redirect("/generate", request)
