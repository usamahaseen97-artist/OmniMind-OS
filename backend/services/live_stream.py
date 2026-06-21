"""
OmniStream Live — dedicated live-stream engine (separate from VOD).

Two delivery modes per channel:

  * ``proxy``     — the source is already an HLS ``.m3u8``. We proxy and rewrite
                    the playlist so every variant playlist and ``.ts`` segment is
                    fetched through our backend. A single upstream is fanned out
                    to many viewers. No transcoding, zero extra CPU.

  * ``transcode`` — the source is a file / RTMP / non-HLS feed. We run a single
                    shared ``ffmpeg`` process that produces an adaptive-bitrate
                    HLS ladder (360p / 720p / 1080p) into a temp dir. One process
                    serves all viewers; it is reference-counted and torn down
                    after an idle timeout so no resources leak.

This module owns *only* live logic. Pre-recorded VOD lives in
``routers/entertainment/stream.py`` and must not be mixed in here.
"""

from __future__ import annotations

import asyncio
import atexit
import json
import logging
import os
import shutil
import subprocess
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

VIEWER_TTL_SECONDS = 18.0          # a viewer is "active" if seen within this window
TRANSCODE_IDLE_TIMEOUT = 45.0      # kill ffmpeg after this many seconds with no viewers
TRANSCODE_READY_TIMEOUT = 20.0     # how long master.m3u8 may take to appear


# Public legal test streams — safe defaults so the feature runs out of the box.
_DEFAULT_CHANNELS: list[dict] = [
    {
        "id": "omni-live-1",
        "name": "OmniStream Live 1",
        "category": "Live Movies",
        "mode": "proxy",
        # Akamai public LIVE test stream (multi-bitrate, truly live).
        "source": "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
        "poster": "",
        "is_live": True,
    },
    {
        "id": "omni-abr-demo",
        "name": "Adaptive Bitrate Demo",
        "category": "Live Movies",
        "mode": "proxy",
        # Mux public multi-bitrate test playlist (great for the quality selector).
        "source": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        "poster": "",
        "is_live": False,
    },
]


@dataclass(frozen=True)
class LiveChannel:
    id: str
    name: str
    category: str
    mode: str  # "proxy" | "transcode"
    source: str
    referrer: str = ""
    poster: str = ""
    is_live: bool = True


def _load_channels() -> dict[str, LiveChannel]:
    raw = os.getenv("OMNISTREAM_LIVE_CHANNELS")
    rows: list[dict]
    if raw:
        try:
            parsed = json.loads(raw)
            rows = parsed if isinstance(parsed, list) else _DEFAULT_CHANNELS
        except Exception:
            logger.warning("OMNISTREAM_LIVE_CHANNELS is not valid JSON — using defaults")
            rows = _DEFAULT_CHANNELS
    else:
        rows = _DEFAULT_CHANNELS

    channels: dict[str, LiveChannel] = {}
    for row in rows:
        try:
            cid = str(row["id"])
            channels[cid] = LiveChannel(
                id=cid,
                name=str(row.get("name") or cid),
                category=str(row.get("category") or "Live"),
                mode=str(row.get("mode") or "proxy"),
                source=str(row.get("source") or ""),
                referrer=str(row.get("referrer") or ""),
                poster=str(row.get("poster") or ""),
                is_live=bool(row.get("is_live", True)),
            )
        except Exception:
            continue
    return channels


class ViewerTracker:
    """Counts concurrent viewers per channel via short-lived heartbeats."""

    def __init__(self) -> None:
        self._seen: dict[str, dict[str, float]] = {}
        self._lock = asyncio.Lock()

    async def heartbeat(self, channel_id: str, token: str) -> None:
        async with self._lock:
            self._seen.setdefault(channel_id, {})[token] = time.time()

    async def count(self, channel_id: str) -> int:
        now = time.time()
        async with self._lock:
            tokens = self._seen.get(channel_id, {})
            for token in [t for t, ts in tokens.items() if now - ts > VIEWER_TTL_SECONDS]:
                tokens.pop(token, None)
            return len(tokens)

    async def total_active(self) -> int:
        now = time.time()
        async with self._lock:
            return sum(
                1
                for tokens in self._seen.values()
                for ts in tokens.values()
                if now - ts <= VIEWER_TTL_SECONDS
            )


@dataclass
class TranscodeSession:
    channel_id: str
    workdir: str
    process: subprocess.Popen
    started_at: float = field(default_factory=time.time)
    last_access: float = field(default_factory=time.time)

    @property
    def master_path(self) -> Path:
        return Path(self.workdir) / "master.m3u8"

    def alive(self) -> bool:
        return self.process.poll() is None

    def touch(self) -> None:
        self.last_access = time.time()

    def terminate(self) -> None:
        try:
            if self.process.poll() is None:
                self.process.terminate()
                try:
                    self.process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.process.kill()
        except Exception:
            pass
        shutil.rmtree(self.workdir, ignore_errors=True)


def _ffmpeg_exe() -> Optional[str]:
    from services.process_utils import ffmpeg_executable

    return ffmpeg_executable()


def _abr_command(ffmpeg: str, source: str, workdir: Path) -> list[str]:
    """3-rendition adaptive-bitrate HLS ladder (360p/720p/1080p)."""
    return [
        ffmpeg, "-hide_banner", "-loglevel", "warning", "-y",
        "-re", "-i", source,
        "-preset", "veryfast", "-g", "48", "-sc_threshold", "0",
        "-filter_complex",
        "[0:v]split=3[v1][v2][v3];"
        "[v1]scale=w=640:h=360[v1out];"
        "[v2]scale=w=1280:h=720[v2out];"
        "[v3]scale=w=1920:h=1080[v3out]",
        "-map", "[v1out]", "-c:v:0", "libx264", "-b:v:0", "800k", "-maxrate:v:0", "856k", "-bufsize:v:0", "1200k",
        "-map", "[v2out]", "-c:v:1", "libx264", "-b:v:1", "2800k", "-maxrate:v:1", "2996k", "-bufsize:v:1", "4200k",
        "-map", "[v3out]", "-c:v:2", "libx264", "-b:v:2", "5000k", "-maxrate:v:2", "5350k", "-bufsize:v:2", "7500k",
        "-map", "a:0?", "-map", "a:0?", "-map", "a:0?", "-c:a", "aac", "-b:a", "128k", "-ac", "2",
        "-f", "hls", "-hls_time", "4", "-hls_list_size", "6",
        "-hls_flags", "delete_segments+independent_segments",
        "-hls_segment_filename", str(workdir / "v%v_seg%d.ts"),
        "-master_pl_name", "master.m3u8",
        "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2",
        str(workdir / "v%v.m3u8"),
    ]


class TranscodeManager:
    """One shared ffmpeg process per transcoded channel, with idle cleanup."""

    def __init__(self) -> None:
        self._sessions: dict[str, TranscodeSession] = {}
        self._lock = asyncio.Lock()
        self._watchdog: Optional[asyncio.Task] = None
        atexit.register(self.shutdown_sync)

    @property
    def ffmpeg_available(self) -> bool:
        return _ffmpeg_exe() is not None

    def _ensure_watchdog(self) -> None:
        if self._watchdog is None or self._watchdog.done():
            try:
                self._watchdog = asyncio.create_task(self._reap_idle_loop())
            except RuntimeError:
                self._watchdog = None

    async def _reap_idle_loop(self) -> None:
        while True:
            await asyncio.sleep(15)
            now = time.time()
            async with self._lock:
                stale = [
                    cid
                    for cid, s in self._sessions.items()
                    if not s.alive() or now - s.last_access > TRANSCODE_IDLE_TIMEOUT
                ]
                for cid in stale:
                    logger.info("Live transcode idle/dead — stopping channel %s", cid)
                    self._sessions.pop(cid).terminate()
                if not self._sessions:
                    return  # nothing left to watch; loop restarts on next ensure()

    async def ensure(self, channel: LiveChannel) -> Optional[TranscodeSession]:
        ffmpeg = _ffmpeg_exe()
        if not ffmpeg or not channel.source:
            return None

        async with self._lock:
            session = self._sessions.get(channel.id)
            if session and session.alive():
                session.touch()
                return session
            if session:
                session.terminate()
                self._sessions.pop(channel.id, None)

            workdir = tempfile.mkdtemp(prefix=f"omnilive_{channel.id}_")
            cmd = _abr_command(ffmpeg, channel.source, Path(workdir))
            try:
                from services.process_utils import popen_safe

                proc, popen_err = popen_safe(
                    cmd,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    cwd=workdir,
                )
                if proc is None:
                    raise FileNotFoundError(popen_err or "ffmpeg not found")
            except Exception as exc:
                logger.error("Failed to launch ffmpeg for %s: %s", channel.id, exc)
                shutil.rmtree(workdir, ignore_errors=True)
                return None
            session = TranscodeSession(channel.id, workdir, proc)
            self._sessions[channel.id] = session
            self._ensure_watchdog()

        # Wait (outside the lock) for the master playlist to appear.
        deadline = time.time() + TRANSCODE_READY_TIMEOUT
        while time.time() < deadline:
            if not session.alive():
                logger.error("ffmpeg exited early for channel %s", channel.id)
                return None
            if session.master_path.exists() and session.master_path.stat().st_size > 0:
                return session
            await asyncio.sleep(0.4)
        logger.warning("ffmpeg master playlist timeout for channel %s", channel.id)
        return session if session.master_path.exists() else None

    async def get(self, channel_id: str) -> Optional[TranscodeSession]:
        async with self._lock:
            session = self._sessions.get(channel_id)
            if session and session.alive():
                session.touch()
                return session
            return None

    def shutdown_sync(self) -> None:
        for session in list(self._sessions.values()):
            session.terminate()
        self._sessions.clear()


# Module-level singletons
viewers = ViewerTracker()
transcoder = TranscodeManager()
_channels_cache: Optional[dict[str, LiveChannel]] = None


def list_channels() -> list[LiveChannel]:
    global _channels_cache
    if _channels_cache is None:
        _channels_cache = _load_channels()
    return list(_channels_cache.values())


def get_channel(channel_id: str) -> Optional[LiveChannel]:
    global _channels_cache
    if _channels_cache is None:
        _channels_cache = _load_channels()
    return _channels_cache.get(channel_id)
