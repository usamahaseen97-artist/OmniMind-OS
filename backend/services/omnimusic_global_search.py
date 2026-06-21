"""
Dynamic Global Search — Elasticsearch first, then YouTube (yt-dlp) when local hits are sparse.
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any, Optional

from config import get_settings
from services import audius_client
from services.infra_pool import run_blocking
from services.process_utils import ytdlp_base_opts
from services.omnimusic_resolver import audius_search_as_tracks
from services.omnimusic_store import SONGS, _normalize, _score, _search_mem_pool

logger = logging.getLogger(__name__)

MIN_LOCAL_MATCHES = 3
YOUTUBE_TOP_N = 5


def _play_youtube_url(video_id: str) -> str:
    base = get_settings().omnimind_public_api_url.rstrip("/")
    return f"{base}/api/v1/music/play/youtube/{video_id}"


def _parse_title_artist(raw_title: str, uploader: str = "") -> tuple[str, str]:
    title = (raw_title or "").strip()
    artist = (uploader or "").strip() or "YouTube"
    for sep in (" - ", " – ", " | ", " — "):
        if sep in title:
            left, right = title.split(sep, 1)
            if len(left) < 80 and len(right) < 120:
                return right.strip() or title, left.strip() or artist
    return title, artist


def _youtube_search_sync(query: str, *, limit: int = YOUTUBE_TOP_N) -> list[dict[str, Any]]:
    """yt-dlp ytsearch — metadata only (extract_flat), no download."""
    import yt_dlp

    q = query.strip()
    if not q:
        return []

    opts: dict[str, Any] = {
        **ytdlp_base_opts(),
        "skip_download": True,
        "extract_flat": True,
        "noplaylist": True,
        "socket_timeout": 12,
        "retries": 1,
        "default_search": f"ytsearch{min(limit, 10)}",
    }

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(f"ytsearch{limit}:{q}", download=False)
    except FileNotFoundError as exc:
        raise RuntimeError(f"yt-dlp or ffmpeg not found: {exc}") from exc

    if not info:
        return []

    entries: list[dict[str, Any]] = []
    if info.get("_type") in ("playlist", "multi_video") or info.get("entries"):
        for ent in info.get("entries") or []:
            if ent:
                entries.append(ent)
    else:
        entries = [info]

    out: list[dict[str, Any]] = []
    for ent in entries[:limit]:
        vid = str(ent.get("id") or "").strip()
        if not vid or len(vid) > 20:
            continue
        raw_title = str(ent.get("title") or "Track")
        uploader = str(ent.get("uploader") or ent.get("channel") or ent.get("uploader_id") or "")
        title, artist = _parse_title_artist(raw_title, uploader)
        dur_sec = int(ent.get("duration") or 0)
        dur_label, dur_sec = audius_client.format_duration(dur_sec)
        thumb = f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
        out.append(
            {
                "id": f"youtube-{vid}",
                "title": title,
                "artist": artist,
                "album": "YouTube",
                "playlist": "Global Search",
                "category": "Latest",
                "year": 2024,
                "era": "latest",
                "tags": ["youtube", "global", "dynamic", q.lower()],
                "duration": dur_label,
                "duration_sec": dur_sec or 240,
                "thumbnail_url": thumb,
                "youtube_id": vid,
                "youtube_url": ent.get("url") or f"https://www.youtube.com/watch?v={vid}",
                "audio_url": _play_youtube_url(vid),
                "source": "youtube",
                "dynamic": True,
            }
        )
    return out


def youtube_stream_url_sync(video_id: str) -> dict[str, Any]:
    """Resolve direct audio stream URL for a YouTube video id (yt-dlp)."""
    import yt_dlp

    vid = re.sub(r"[^a-zA-Z0-9_-]", "", video_id.strip())
    if not vid:
        raise ValueError("Invalid YouTube video id")

    opts: dict[str, Any] = {
        **ytdlp_base_opts(),
        "format": "bestaudio/best",
        "noplaylist": True,
        "socket_timeout": 15,
        "retries": 1,
        "extractor_args": {"youtube": {"player_client": ["android", "web"]}},
    }

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
    except FileNotFoundError as exc:
        raise RuntimeError(f"yt-dlp or ffmpeg not found: {exc}") from exc

    if not info:
        raise RuntimeError("YouTube video not found")

    stream_url = info.get("url")
    if not stream_url:
        formats = info.get("formats") or []
        audio_fmts = [f for f in formats if f.get("url") and f.get("acodec") not in (None, "none")]
        if audio_fmts:
            stream_url = audio_fmts[-1]["url"]

    if not stream_url:
        raise RuntimeError("No audio stream URL for YouTube video")

    return {
        "stream_url": stream_url,
        "content_type": "audio/mpeg",
        "title": info.get("title"),
    }


async def _fetch_youtube_global(query: str, *, limit: int = YOUTUBE_TOP_N) -> list[dict[str, Any]]:
    settings = get_settings()
    if not settings.music_global_search_ytdlp:
        logger.debug("YouTube global search disabled (MUSIC_GLOBAL_SEARCH_YTDLP=false)")
        return []
    try:
        return await run_blocking(_youtube_search_sync, query, limit=limit)
    except Exception as exc:
        logger.warning("YouTube global search failed for %r: %s", query, exc)
        return []


async def _background_seed_global(docs: list[dict[str, Any]]) -> None:
    """Persist global hits to memory + Elasticsearch for faster next search."""
    if not docs:
        return
    try:
        from services.elasticsearch_songs import bulk_save_songs_to_elasticsearch

        normalized = [_normalize(d) for d in docs]
        from services import omnimusic_store as store

        for doc in normalized:
            store._mem_songs[doc["id"]] = doc

        db = await store._db()
        if db is not None:
            try:
                for doc in normalized:
                    await db[SONGS].update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
            except Exception as exc:
                logger.debug("Mongo seed global: %s", exc)

        n = await bulk_save_songs_to_elasticsearch(normalized, refresh=False)
        logger.info("Global search seeded %s tracks to ES (%s indexed)", len(normalized), n)
    except Exception as exc:
        logger.warning("Background global seed failed: %s", exc)


def _merge_unique(
    merged: list[dict[str, Any]],
    seen: set[str],
    docs: list[dict[str, Any]],
    *,
    prepend: bool = False,
) -> None:
    batch: list[dict[str, Any]] = []
    for doc in docs:
        sid = str(doc.get("id") or "")
        if not sid or sid in seen:
            continue
        seen.add(sid)
        batch.append(_normalize(doc))
    if prepend:
        merged[:0] = batch
    else:
        merged.extend(batch)


async def dynamic_global_search(
    query: str,
    *,
    category: Optional[str] = None,
    playlist: Optional[str] = None,
    limit: int = 60,
    offset: int = 0,
) -> dict[str, Any]:
    """
    1) Elasticsearch fuzzy index
    2) In-memory / Mongo local pool
    3) Audius live (if still sparse)
    4) YouTube ytsearch top N (if still sparse)
    Returns tracks + source breakdown; seeds YouTube hits in background.
    """
    q = query.strip()
    cat = (category or playlist or "").strip()
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()
    counts = {"elasticsearch": 0, "local_json": 0, "local": 0, "audius": 0, "youtube": 0}

    if not q:
        from services.omnimusic_store import search_songs

        tracks = await search_songs("", category=category, playlist=playlist, limit=limit, offset=offset)
        return {
            "tracks": tracks,
            "sources": counts,
            "global_fallback": False,
            "elasticsearch_used": False,
        }

    # 1 — Elasticsearch
    try:
        from services.elasticsearch_songs import search_songs_elasticsearch

        es_hits = await search_songs_elasticsearch(q, limit=min(40, limit + 20))
        before = len(merged)
        _merge_unique(merged, seen, es_hits)
        added = len(merged) - before
        src_key = "elasticsearch" if any(h.get("source") == "elasticsearch" for h in es_hits) else "local_json"
        counts[src_key] = counts.get(src_key, 0) + added
    except Exception as exc:
        logger.debug("ES step skipped: %s", exc)
        try:
            from services.songs_static_provider import search_static_songs

            static_hits = search_static_songs(q, limit=min(40, limit + 20))
            before = len(merged)
            _merge_unique(merged, seen, static_hits)
            counts["local_json"] = len(merged) - before
        except Exception as static_exc:
            logger.debug("Static JSON step: %s", static_exc)

    # 2 — Local memory / production pool
    local_pool = _search_mem_pool(q, cat=cat, limit=80)
    before = len(merged)
    _merge_unique(merged, seen, local_pool)
    counts["local"] = len(merged) - before

    # 3 — Audius if sparse
    if len(merged) < MIN_LOCAL_MATCHES:
        try:
            live = await audius_search_as_tracks(q, limit=min(30, limit + 10))
            before = len(merged)
            _merge_unique(merged, seen, live, prepend=True)
            counts["audius"] = len(merged) - before
        except Exception as exc:
            logger.debug("Audius global step: %s", exc)

    youtube_docs: list[dict[str, Any]] = []
    global_fallback = False

    # 4 — YouTube global
    if len(merged) < MIN_LOCAL_MATCHES:
        youtube_docs = await _fetch_youtube_global(q, limit=YOUTUBE_TOP_N)
        if youtube_docs:
            global_fallback = True
            before = len(merged)
            _merge_unique(merged, seen, youtube_docs, prepend=True)
            counts["youtube"] = len(merged) - before
            asyncio.create_task(_background_seed_global(youtube_docs))

    if cat and cat != "all":
        merged = [
            d
            for d in merged
            if d.get("category") == cat
            or d.get("playlist") == cat
            or cat.lower() in (d.get("playlist") or "").lower()
        ]

    merged.sort(
        key=lambda d: (
            -_score(d, q),
            d.get("source") != "youtube",
            -d.get("year", 0),
            d.get("title", ""),
        ),
    )

    page = merged[offset : offset + limit]

    return {
        "tracks": page,
        "sources": counts,
        "global_fallback": global_fallback,
        "elasticsearch_used": counts["elasticsearch"] > 0,
        "static_json_used": counts.get("local_json", 0) > 0,
        "youtube_seeded": len(youtube_docs),
    }
