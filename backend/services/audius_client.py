"""
Audius Open Audio — free search + stream (no API key required).
https://docs.audius.org/api
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

APP_NAME = "OmniMind"
_HOST_TTL = 300.0
_CIRCUIT_COOLDOWN = 300.0
_MAX_FAILURES = 2
_REQUEST_TIMEOUT = httpx.Timeout(4.0, connect=3.0)
_discovery_hosts: list[str] = []
_host_index: int = 0
_host_fetched_at: float = 0.0
_failure_count: int = 0
_circuit_open_until: float = 0.0


def _circuit_open() -> bool:
    return time.time() < _circuit_open_until


def _record_failure() -> None:
    global _failure_count, _circuit_open_until
    _failure_count += 1
    if _failure_count >= _MAX_FAILURES:
        _circuit_open_until = time.time() + _CIRCUIT_COOLDOWN
        logger.debug(
            "Audius circuit open for %.0fs after %s failures",
            _CIRCUIT_COOLDOWN,
            _failure_count,
        )


def _record_success() -> None:
    global _failure_count, _circuit_open_until
    _failure_count = 0
    _circuit_open_until = 0.0


async def _refresh_discovery_hosts() -> list[str]:
    global _discovery_hosts, _host_fetched_at
    if _circuit_open():
        return _discovery_hosts
    async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
        res = await client.get("https://api.audius.co")
        res.raise_for_status()
        hosts = [str(h).rstrip("/") for h in (res.json().get("data") or []) if h]
        if not hosts:
            raise RuntimeError("Audius: no discovery hosts")
        _discovery_hosts = hosts[:12]
        _host_fetched_at = time.time()
        _record_success()
        return _discovery_hosts


async def get_discovery_host() -> str:
    global _host_index
    now = time.time()
    if not _discovery_hosts or now - _host_fetched_at >= _HOST_TTL:
        await _refresh_discovery_hosts()
    if not _discovery_hosts:
        raise RuntimeError("Audius: no discovery hosts")
    return _discovery_hosts[_host_index % len(_discovery_hosts)]


def _rotate_host() -> None:
    global _host_index
    if _discovery_hosts:
        _host_index = (_host_index + 1) % len(_discovery_hosts)


async def search_tracks(query: str, *, limit: int = 10) -> list[dict[str, Any]]:
    q = query.strip()
    if not q:
        return []
    if _circuit_open():
        return []
    if not _discovery_hosts:
        try:
            await _refresh_discovery_hosts()
        except Exception as exc:
            _record_failure()
            logger.debug("Audius discovery refresh failed: %s", exc)
            return []

    attempts = min(2, len(_discovery_hosts) or 1)
    last_exc: Exception | None = None
    for _ in range(attempts):
        if _circuit_open():
            return []
        host = await get_discovery_host()
        try:
            async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
                res = await client.get(
                    f"{host}/v1/tracks/search",
                    params={"query": q, "app_name": APP_NAME, "limit": min(limit, 50)},
                )
                res.raise_for_status()
                _record_success()
                return list(res.json().get("data") or [])
        except Exception as exc:
            last_exc = exc
            logger.debug("Audius search on %s failed: %s", host, exc)
            _record_failure()
            _rotate_host()
    if last_exc and not _circuit_open():
        logger.debug("Audius search exhausted hosts for %r", q[:40])
    return []


def upstream_stream_url(host: str, track_id: str) -> str:
    return f"{host.rstrip('/')}/v1/tracks/{track_id}/stream"


def artwork_url(track: dict[str, Any]) -> str:
    art = track.get("artwork") or {}
    if isinstance(art, dict):
        for key in ("1000x1000", "480x480", "150x150"):
            if art.get(key):
                return str(art[key])
    return ""


def format_duration(seconds: int) -> tuple[str, int]:
    sec = max(0, int(seconds or 0))
    m, s = divmod(sec, 60)
    return f"{m}:{s:02d}", sec
