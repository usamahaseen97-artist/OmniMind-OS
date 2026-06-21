from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from app.config import settings
from app.services.resilience import memory_cache_delete, memory_cache_get, memory_cache_set

_redis: aioredis.Redis | None = None
_redis_ok: bool | None = None


def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def _redis_available() -> bool:
    global _redis_ok
    if _redis_ok is not None:
        return _redis_ok
    try:
        import asyncio

        async with asyncio.timeout(1.5):
            pong = await get_redis().ping()
            _redis_ok = bool(pong)
    except Exception:
        _redis_ok = False
    return _redis_ok


async def cache_get_json(key: str) -> Any | None:
    if await _redis_available():
        try:
            raw = await get_redis().get(key)
            return json.loads(raw) if raw else None
        except Exception:
            pass
    return memory_cache_get(key)


async def cache_set_json(key: str, value: Any, ttl_seconds: int = 600) -> None:
    if await _redis_available():
        try:
            await get_redis().set(key, json.dumps(value), ex=ttl_seconds)
            return
        except Exception:
            pass
    memory_cache_set(key, value)


async def cache_delete(key: str) -> None:
    if await _redis_available():
        try:
            await get_redis().delete(key)
        except Exception:
            pass
    memory_cache_delete(key)
