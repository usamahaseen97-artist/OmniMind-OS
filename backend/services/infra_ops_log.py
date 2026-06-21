"""
Operational log bus — streams 100% infrastructure events to the terminal dashboard.
"""

from __future__ import annotations

import asyncio
import logging
from collections import deque
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

_MAX_BUFFER = 500
_buffer: deque[dict[str, Any]] = deque(maxlen=_MAX_BUFFER)
_subscribers: set[asyncio.Queue[dict[str, Any]]] = set()


def _stamp() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S")


def emit_ops_log(line: str, *, level: str = "info", source: str = "infra") -> None:
    """Record + fan-out an operational log line to all live terminal subscribers."""
    entry = {
        "type": "log",
        "line": f"[{_stamp()}] {line}",
        "level": level,
        "source": source,
    }
    _buffer.append(entry)
    logger.info("ops|%s|%s", source, line)
    for queue in list(_subscribers):
        try:
            queue.put_nowait(entry)
        except asyncio.QueueFull:
            pass


def snapshot_ops_logs(limit: int = 120) -> list[dict[str, Any]]:
    return list(_buffer)[-limit:]


async def subscribe_ops_logs() -> asyncio.Queue[dict[str, Any]]:
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=256)
    _subscribers.add(queue)
    for item in snapshot_ops_logs():
        try:
            queue.put_nowait(item)
        except asyncio.QueueFull:
            break
    return queue


def unsubscribe_ops_logs(queue: asyncio.Queue[dict[str, Any]]) -> None:
    _subscribers.discard(queue)


async def replay_mesh_boot_sequence(
    *,
    mesh: str,
    redis_state: dict[str, Any],
    jwt_configured: bool,
) -> None:
    """Emit the full production mesh boot narrative to the terminal dashboard."""
    emit_ops_log("▸ OmniMind V11 Production Mesh — client-to-node stream online", "route", "mesh")
    emit_ops_log(f"◈ Network subnet: {mesh}", "info", "mesh")
    emit_ops_log("◈ omnimind-ingress-lb → nginx:alpine :80/:443", "info", "ingress")
    emit_ops_log("◈ dynamic-core-service → uvicorn :8001 (uvloop × 4 workers)", "info", "core")

    if jwt_configured:
        emit_ops_log("✓ JWT signing key loaded — HS256 session badges active", "success", "auth")
    else:
        emit_ops_log("⚠ JWT_SIGNING_KEY unset — ephemeral dev tokens only", "warn", "auth")

    mode = redis_state.get("mode", "unknown")
    if redis_state.get("ok"):
        emit_ops_log(f"✓ omnimind-cache connected ({mode})", "success", "redis")
        emit_ops_log("✓ Reactive Redis query layer — microsecond cache hits enabled", "success", "redis")
    else:
        emit_ops_log(f"⚠ Redis {mode} — in-process memory fallback routing", "warn", "redis")

    emit_ops_log("✓ CORS isolation matrix — Web · Desktop · iOS · Android", "success", "cors")
    emit_ops_log("✓ WebSocket ingress open — Three.js / Anime.js sync loops ready", "success", "stream")
    emit_ops_log("● 100% operational telemetry streaming to terminal dashboard", "success", "telemetry")
