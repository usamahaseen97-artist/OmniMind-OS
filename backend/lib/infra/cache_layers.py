"""Named Redis cache layers — API, prompt, session, file, image."""

from __future__ import annotations

import hashlib
import json
from enum import Enum
from typing import Any, Optional

from services.redis_cache import cache_get_json, cache_set_json, cache_delete


class CacheLayer(str, Enum):
    API = "api"
    PROMPT = "prompt"
    SESSION = "session"
    FILE = "file"
    IMAGE = "image"
    DISTRIBUTED = "dist"


_DEFAULT_TTL: dict[CacheLayer, int] = {
    CacheLayer.API: 60,
    CacheLayer.PROMPT: 3600,
    CacheLayer.SESSION: 86400,
    CacheLayer.FILE: 7200,
    CacheLayer.IMAGE: 43200,
    CacheLayer.DISTRIBUTED: 300,
}


def _key(layer: CacheLayer, key: str) -> str:
    return f"omni:cache:{layer.value}:{key}"


async def cache_get(layer: CacheLayer, key: str) -> Optional[Any]:
    return await cache_get_json(_key(layer, key))


async def cache_set(layer: CacheLayer, key: str, value: Any, ttl_seconds: int | None = None) -> None:
    ttl = ttl_seconds if ttl_seconds is not None else _DEFAULT_TTL[layer]
    await cache_set_json(_key(layer, key), value, ttl_seconds=ttl)


async def cache_invalidate(layer: CacheLayer, key: str) -> None:
    await cache_delete(_key(layer, key))


def prompt_cache_key(template_id: str, variables: dict[str, Any]) -> str:
    payload = json.dumps({"t": template_id, "v": variables}, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()[:32]
