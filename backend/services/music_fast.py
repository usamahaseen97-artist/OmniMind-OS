"""
Fast music resolution — cache → Elasticsearch fuzzy → Audius fallback → yt-dlp.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Optional

from config import get_settings
from services import audius_client
from services.infra_pool import run_blocking
from services.omnimusic_resolver import audius_hit_to_doc, play_url

logger = logging.getLogger(__name__)

_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_CACHE_TTL = 3600.0
_CACHE_MAX = 400


def _cache_key(song_name: str) -> str:
    return song_name.strip().lower()


def _cache_get(key: str) -> Optional[dict[str, Any]]:
    row = _CACHE.get(key)
    if not row:
        return None
    if time.time() - row[0] > _CACHE_TTL:
        _CACHE.pop(key, None)
        return None
    return dict(row[1])


def _cache_set(key: str, payload: dict[str, Any]) -> None:
    if len(_CACHE) >= _CACHE_MAX:
        oldest = min(_CACHE.items(), key=lambda x: x[1][0])[0]
        _CACHE.pop(oldest, None)
    _CACHE[key] = (time.time(), payload)


def _track_payload_from_doc(song_name: str, doc: dict[str, Any], *, source: str) -> dict[str, Any]:
    tid = str(doc.get("audius_id") or "")
    audio = str(doc.get("audio_url") or doc.get("audio_stream_url") or "")
    if tid and (not audio or "/api/v1/music/play/" not in audio):
        audio = play_url(tid)
    return {
        "success": True,
        "song_name": song_name.strip(),
        "title": doc.get("title", song_name),
        "artist": doc.get("artist", ""),
        "album": doc.get("album", "OmniMusic"),
        "album_image_url": doc.get("thumbnail_url") or doc.get("album_image_url", ""),
        "audio_stream_url": audio,
        "duration_sec": doc.get("duration_sec", 240),
        "audius_id": tid,
        "sources": {"metadata": source, "audio": "audius-proxy" if tid else source},
        "fast": True,
    }


def _track_payload_from_audius(song_name: str, hit: dict[str, Any]) -> dict[str, Any]:
    doc = audius_hit_to_doc(hit, query=song_name)
    tid = str(doc.get("audius_id") or "")
    return {
        "success": True,
        "song_name": song_name.strip(),
        "title": doc["title"],
        "artist": doc["artist"],
        "album": doc.get("album", "Audius"),
        "album_image_url": doc.get("thumbnail_url", ""),
        "audio_stream_url": play_url(tid) if tid else doc.get("audio_url", ""),
        "duration_sec": doc.get("duration_sec", 240),
        "audius_id": tid,
        "sources": {"metadata": "audius", "audio": "audius-proxy"},
        "fast": True,
    }


async def _elasticsearch_fast(song_name: str) -> Optional[dict[str, Any]]:
    from services.elasticsearch_songs import search_songs_elasticsearch

    hits = await search_songs_elasticsearch(song_name, limit=3)
    if not hits:
        return None
    best = hits[0]
    if not best.get("audio_url") and not best.get("audius_id"):
        return None
    payload = _track_payload_from_doc(song_name, best, source="elasticsearch")
    payload["es_score"] = best.get("_es_score")
    return payload


async def _audius_fast(song_name: str) -> Optional[dict[str, Any]]:
    try:
        hits = await audius_client.search_tracks(song_name, limit=1)
        if hits:
            return _track_payload_from_audius(song_name, hits[0])
    except Exception as exc:
        logger.debug("Audius fast path failed: %s", exc)
    return None


async def _spotify_youtube_slow(song_name: str) -> dict[str, Any]:
    from services.spotify_youtube_music import search_song_with_stream_slow

    settings = get_settings()
    timeout = max(8.0, float(settings.music_ytdlp_timeout_seconds))
    return await asyncio.wait_for(
        run_blocking(search_song_with_stream_slow, song_name),
        timeout=timeout + 12.0,
    )


async def fast_resolve_song(song_name: str) -> dict[str, Any]:
    """
    Resolve playable track (cache → Elasticsearch multi_match → Audius → yt-dlp).
    """
    key = _cache_key(song_name)
    cached = _cache_get(key)
    if cached:
        cached["cached"] = True
        return cached

    es_track = await _elasticsearch_fast(song_name)
    if es_track:
        _cache_set(key, es_track)
        return es_track

    audius_track = await _audius_fast(song_name)
    if audius_track:
        _cache_set(key, audius_track)
        try:
            from services.elasticsearch_songs import save_song_to_elasticsearch

            await save_song_to_elasticsearch(
                {
                    "id": f"audius-{audius_track.get('audius_id')}",
                    "title": audius_track["title"],
                    "artist": audius_track["artist"],
                    "album": audius_track.get("album", ""),
                    "thumbnail_url": audius_track.get("album_image_url", ""),
                    "audio_url": audius_track.get("audio_stream_url", ""),
                    "audius_id": audius_track.get("audius_id", ""),
                    "source": "audius",
                    "tags": ["audius", song_name.lower()],
                }
            )
        except Exception:
            pass
        return audius_track

    settings = get_settings()
    if settings.music_skip_ytdlp:
        return {
            "success": False,
            "song_name": song_name,
            "error": "No fast stream found (Elasticsearch/Audius). Seed ES index or enable yt-dlp.",
            "fast": True,
        }

    try:
        slow = await _spotify_youtube_slow(song_name)
        slow["fast"] = False
        if slow.get("success"):
            _cache_set(key, slow)
        return slow
    except asyncio.TimeoutError:
        return {
            "success": False,
            "song_name": song_name,
            "error": "Music lookup timed out — try a shorter song name",
            "fast": False,
        }
    except Exception as exc:
        return {
            "success": False,
            "song_name": song_name,
            "error": str(exc),
            "fast": False,
        }


async def fast_play_music_payload(song_name: str) -> dict[str, Any]:
    """Build chatbot music_player SSE payload."""
    track = await fast_resolve_song(song_name)
    return {
        "type": "music_player",
        "song_name": song_name,
        "title": track.get("title", song_name),
        "artist": track.get("artist", ""),
        "album": track.get("album", ""),
        "album_image_url": track.get("album_image_url", ""),
        "audio_stream_url": track.get("audio_stream_url", ""),
        "duration_sec": track.get("duration_sec"),
        "track": track,
        "success": bool(track.get("success")),
        "error": track.get("error"),
        "cached": track.get("cached", False),
        "fast": track.get("fast", True),
    }
