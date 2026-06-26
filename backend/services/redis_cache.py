"""
Redis caching layer with in-process fallback when cluster is unavailable.
Check cache before MongoDB analytical reads for microsecond hot paths.
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any, Awaitable, Callable, Optional, TypeVar

from config import get_settings

logger = logging.getLogger(__name__)

T = TypeVar("T")

_redis_client: Any = None
_memory_fallback: dict[str, tuple[str, float]] = {}


async def init_redis() -> dict[str, Any]:
    """Connect Redis on startup; return status dict for app.state."""
    global _redis_client
    settings = get_settings()
    if not settings.redis_enabled:
        return {"ok": False, "mode": "disabled"}

    url = settings.effective_redis_url
    if not url:
        return {"ok": False, "mode": "no_url"}

    try:
        import redis.asyncio as aioredis

        _redis_client = aioredis.from_url(
            url,
            encoding="utf-8",
            decode_responses=True,
            protocol=2,
            socket_connect_timeout=settings.redis_connect_timeout_seconds,
            socket_timeout=2.0,
            health_check_interval=30,
            max_connections=256,
            retry_on_timeout=True,
        )
        await _redis_client.ping()
        logger.info("Redis cluster connected")
        return {"ok": True, "mode": "redis", "url": url.split("@")[-1]}
    except Exception as exc:
        logger.warning("Redis unavailable — memory fallback active: %s", exc)
        _redis_client = None
        return {"ok": False, "mode": "memory_fallback", "error": str(exc)}


async def close_redis() -> None:
    global _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.aclose()
        except Exception:
            pass
        _redis_client = None


def _memory_get(key: str) -> Optional[str]:
    entry = _memory_fallback.get(key)
    if not entry:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        _memory_fallback.pop(key, None)
        return None
    return value


def _memory_set(key: str, value: str, ttl_seconds: int) -> None:
    _memory_fallback[key] = (value, time.time() + ttl_seconds)
    if len(_memory_fallback) > 5000:
        oldest = sorted(_memory_fallback.items(), key=lambda x: x[1][1])[:500]
        for k, _ in oldest:
            _memory_fallback.pop(k, None)


async def cache_get(key: str) -> Optional[str]:
    """Return cached JSON string or None."""
    if _redis_client is not None:
        try:
            return await _redis_client.get(key)
        except Exception as exc:
            logger.debug("Redis GET miss/error %s: %s", key, exc)
    return _memory_get(key)


async def cache_set(key: str, value: str, ttl_seconds: Optional[int] = None) -> None:
    settings = get_settings()
    ttl = ttl_seconds if ttl_seconds is not None else settings.redis_default_ttl_seconds
    if _redis_client is not None:
        try:
            await _redis_client.set(key, value, ex=ttl)
            return
        except Exception as exc:
            logger.debug("Redis SET error %s: %s", key, exc)
    _memory_set(key, value, ttl)


async def cache_get_json(key: str) -> Optional[Any]:
    raw = await cache_get(key)
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


async def cache_set_json(key: str, payload: Any, ttl_seconds: Optional[int] = None) -> None:
    await cache_set(key, json.dumps(payload, default=str), ttl_seconds)


async def cache_delete(key: str) -> None:
    """Delete a single cache key from Redis or memory fallback."""
    if _redis_client is not None:
        try:
            await _redis_client.delete(key)
        except Exception as exc:
            logger.debug("Redis DELETE error %s: %s", key, exc)
    _memory_fallback.pop(key, None)


async def cache_get_or_load(
    key: str,
    loader: Callable[[], Awaitable[Any]],
    *,
    ttl_seconds: Optional[int] = None,
    namespace: str = "omni",
) -> Any:
    """
    Analytical query helper — Redis first, then loader (typically MongoDB), then cache write.
    """
    full_key = f"{namespace}:{key}"
    cached = await cache_get_json(full_key)
    if cached is not None:
        return {**cached, "_cache": "hit"} if isinstance(cached, dict) else cached

    result = await loader()
    await cache_set_json(full_key, result, ttl_seconds)
    if isinstance(result, dict):
        return {**result, "_cache": "miss"}
    return result


async def invalidate_prefix(prefix: str) -> int:
    """Best-effort cache bust for namespace prefix."""
    count = 0
    if _redis_client is not None:
        try:
            async for key in _redis_client.scan_iter(match=f"{prefix}*"):
                await _redis_client.delete(key)
                count += 1
        except Exception:
            pass
    for k in list(_memory_fallback.keys()):
        if k.startswith(prefix):
            _memory_fallback.pop(k, None)
            count += 1
    return count


# ── OmniMind hot-path namespaces (target <50ms on hit) ─────────────────────

PROFILE_TTL = 1800
UI_STATE_TTL = 600
CONV_MSG_TTL = 900
CONV_LIST_TTL = 300


def _profile_key(user_id: str) -> str:
    return f"omni:profile:{user_id}"


def _ui_state_key(user_id: str, state_hash: str) -> str:
    return f"omni:ui:{user_id}:{state_hash}"


def _conv_messages_key(conversation_id: str) -> str:
    return f"omni:conv:msgs:{conversation_id}"


def _conv_list_key(user_id: str) -> str:
    return f"omni:conv:list:{user_id}"


async def cache_get_profile(user_id: str) -> Optional[Any]:
    return await cache_get_json(_profile_key(user_id))


async def cache_set_profile(user_id: str, payload: Any) -> None:
    await cache_set_json(_profile_key(user_id), payload, ttl_seconds=PROFILE_TTL)


async def get_user_session(
    user_id: str,
    loader: Callable[[], Awaitable[Any]],
    *,
    ttl_seconds: int = PROFILE_TTL,
) -> tuple[Any, bool]:
    """
    Redis-first user session/profile lookup.
    Returns (payload, cache_hit); caller supplies Mongo loader for misses.
    """
    key = _profile_key(user_id)
    cached = await cache_get_json(key)
    if cached is not None:
        return cached, True
    payload = await loader()
    if payload is not None:
        await cache_set_json(key, payload, ttl_seconds=ttl_seconds)
    return payload, False


async def cache_get_ui_state(user_id: str, state_hash: str) -> Optional[Any]:
    return await cache_get_json(_ui_state_key(user_id, state_hash))


async def cache_set_ui_state(user_id: str, state_hash: str, payload: Any) -> None:
    await cache_set_json(_ui_state_key(user_id, state_hash), payload, ttl_seconds=UI_STATE_TTL)


async def cache_get_conversation_messages(conversation_id: str) -> Optional[list]:
    data = await cache_get_json(_conv_messages_key(conversation_id))
    return data if isinstance(data, list) else None


async def cache_set_conversation_messages(
    conversation_id: str,
    messages: list,
    *,
    ttl_seconds: int = CONV_MSG_TTL,
) -> None:
    await cache_set_json(_conv_messages_key(conversation_id), messages, ttl_seconds=ttl_seconds)


async def cache_invalidate_conversation(conversation_id: str, user_id: str | None = None) -> None:
    await invalidate_prefix(_conv_messages_key(conversation_id))
    if user_id:
        await invalidate_prefix(_conv_list_key(user_id))


async def fast_cache_get_or_load(
    key: str,
    loader: Callable[[], Awaitable[Any]],
    *,
    ttl_seconds: Optional[int] = None,
    namespace: str = "omni:fast",
) -> tuple[Any, bool]:
    """Return (value, cache_hit). Used for Mongo read-through hot paths."""
    full_key = f"{namespace}:{key}"
    cached = await cache_get_json(full_key)
    if cached is not None:
        return cached, True
    result = await loader()
    await cache_set_json(full_key, result, ttl_seconds)
    return result, False
