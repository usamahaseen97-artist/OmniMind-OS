"""Sync/async response cache decorator for read-heavy platform routers."""

from __future__ import annotations

import functools
import inspect
import time
from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

_cache: dict[str, tuple[Any, float]] = {}
_DEFAULT_TTL = 30.0
_MAX_ENTRIES = 256


def _cache_set(key: str, result: Any, ttl_seconds: float) -> None:
    if len(_cache) >= _MAX_ENTRIES:
        oldest = min(_cache.items(), key=lambda x: x[1][1])[0]
        _cache.pop(oldest, None)
    _cache[key] = (result, time.time() + ttl_seconds)


def cached_response(ttl_seconds: float = _DEFAULT_TTL) -> Callable[[F], F]:
    def decorator(fn: F) -> F:
        key = f"{fn.__module__}.{fn.__qualname__}"

        if inspect.iscoroutinefunction(fn):

            @functools.wraps(fn)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                now = time.time()
                hit = _cache.get(key)
                if hit and now < hit[1]:
                    return hit[0]
                result = await fn(*args, **kwargs)
                _cache_set(key, result, ttl_seconds)
                return result

            return async_wrapper  # type: ignore[return-value]

        @functools.wraps(fn)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            now = time.time()
            hit = _cache.get(key)
            if hit and now < hit[1]:
                return hit[0]
            result = fn(*args, **kwargs)
            _cache_set(key, result, ttl_seconds)
            return result

        return sync_wrapper  # type: ignore[return-value]

    return decorator


def invalidate_cache(prefix: str | None = None) -> None:
    if prefix is None:
        _cache.clear()
        return
    for cache_key in list(_cache.keys()):
        if cache_key.startswith(prefix):
            _cache.pop(cache_key, None)
