"""
Spotify metadata + YouTube audio stream URL (yt-dlp) for OmniMind Music Tool / chatbot.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from config import get_settings
from services.infra_pool import run_blocking
from services.process_utils import ytdlp_base_opts

logger = logging.getLogger(__name__)


class SpotifyNotConfiguredError(RuntimeError):
    pass


class TrackNotFoundError(RuntimeError):
    pass


class AudioStreamError(RuntimeError):
    pass


def _spotify_client():
    settings = get_settings()
    cid = settings.spotify_client_id.strip()
    secret = settings.spotify_client_secret.strip()
    if not cid or not secret:
        raise SpotifyNotConfiguredError(
            "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in backend/.env"
        )
    import spotipy
    from spotipy.oauth2 import SpotifyClientCredentials

    auth = SpotifyClientCredentials(client_id=cid, client_secret=secret)
    return spotipy.Spotify(auth_manager=auth)


def spotify_lookup_sync(song_name: str) -> dict[str, Any]:
    """Return exact title, artist, album art from Spotify search."""
    sp = _spotify_client()
    result = sp.search(q=song_name.strip(), type="track", limit=1)
    items = (result.get("tracks") or {}).get("items") or []
    if not items:
        raise TrackNotFoundError(f"No Spotify track for: {song_name}")

    track = items[0]
    artists = track.get("artists") or []
    artist_name = ", ".join(a.get("name", "") for a in artists if a.get("name")) or "Unknown Artist"
    album = track.get("album") or {}
    images = album.get("images") or []
    image_url = ""
    if images:
        image_url = str(images[0].get("url") or "")
        for img in images:
            if img.get("width", 0) >= 300:
                image_url = str(img.get("url") or image_url)
                break

    return {
        "spotify_id": track.get("id"),
        "title": track.get("name") or song_name,
        "artist": artist_name,
        "album": album.get("name") or "",
        "album_image_url": image_url,
        "duration_ms": track.get("duration_ms"),
        "spotify_url": (track.get("external_urls") or {}).get("spotify"),
    }


def _youtube_audio_sync(title: str, artist: str) -> dict[str, Any]:
    """yt-dlp: find YouTube match and return direct audio stream URL (slow fallback)."""
    import yt_dlp

    query = f"{title} {artist}".strip()
    opts: dict[str, Any] = {
        **ytdlp_base_opts(),
        "format": "bestaudio/best",
        "noplaylist": True,
        "default_search": "ytsearch1",
        "socket_timeout": 10,
        "retries": 1,
        "fragment_retries": 1,
        "extractor_args": {"youtube": {"player_client": ["android", "web"]}},
    }

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(f"ytsearch1:{query}", download=False)
    except FileNotFoundError as exc:
        raise AudioStreamError(f"yt-dlp or ffmpeg not found: {exc}") from exc

    if not info:
        raise AudioStreamError("YouTube search returned no results")

    if info.get("_type") in ("playlist", "multi_video") or info.get("entries"):
        entries = info.get("entries") or []
        info = entries[0] if entries else info

    stream_url = info.get("url")
    if not stream_url:
        formats = info.get("formats") or []
        audio_fmts = [
            f
            for f in formats
            if f.get("url") and f.get("acodec") not in (None, "none")
        ]
        if audio_fmts:
            stream_url = audio_fmts[-1]["url"]

    if not stream_url:
        raise AudioStreamError("Could not extract audio stream URL from YouTube")

    return {
        "audio_stream_url": stream_url,
        "youtube_id": info.get("id"),
        "youtube_title": info.get("title"),
        "youtube_url": info.get("webpage_url") or info.get("original_url"),
        "duration_sec": int(info.get("duration") or 0),
    }


def search_song_with_stream_slow(song_name: str) -> dict[str, Any]:
    """Blocking slow path: Spotify + yt-dlp (used only as fallback)."""
    meta = spotify_lookup_sync(song_name)
    yt = _youtube_audio_sync(meta["title"], meta["artist"])
    duration_sec = yt.get("duration_sec") or 0
    if not duration_sec and meta.get("duration_ms"):
        duration_sec = int(meta["duration_ms"]) // 1000
    return {
        "success": True,
        "song_name": song_name.strip(),
        "title": meta["title"],
        "artist": meta["artist"],
        "album": meta["album"],
        "album_image_url": meta["album_image_url"],
        "audio_stream_url": yt["audio_stream_url"],
        "duration_sec": duration_sec,
        "spotify_id": meta.get("spotify_id"),
        "spotify_url": meta.get("spotify_url"),
        "youtube_id": yt.get("youtube_id"),
        "youtube_title": yt.get("youtube_title"),
        "youtube_url": yt.get("youtube_url"),
        "sources": {"metadata": "spotify", "audio": "youtube-yt-dlp"},
    }


async def search_song_with_stream(song_name: str) -> dict[str, Any]:
    """Fast path (Audius + cache); falls back to Spotify/YouTube when needed."""
    from services.music_fast import fast_resolve_song

    return await fast_resolve_song(song_name)
