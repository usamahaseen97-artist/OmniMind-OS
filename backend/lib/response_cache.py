"""Sync response cache decorator for read-heavy stub routers."""

from __future__ import annotations

import functools
import time
from typing import Any, Callable, TypeVar

F = TypeVar("F", bound=Callable[..., Any])

_cache: dict[str, tuple[Any, float]] = {}
_DEFAULT_TTL = 30.0
_MAX_ENTRIES = 256


def cached_response(ttl_seconds: float = _DEFAULT_TTL) -> Callable[[F], F]:
    def decorator(fn: F) -> F:
        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            key = f"{fn.__module__}.{fn.__qualname__}"
            now = time.time()
            hit = _cache.get(key)
            if hit and now < hit[1]:
                return hit[0]
            result = fn(*args, **kwargs)
            if len(_cache) >= _MAX_ENTRIES:
                oldest = min(_cache.items(), key=lambda x: x[1][1])[0]
                _cache.pop(oldest, None)
            _cache[key] = (result, now + ttl_seconds)
            return result

        return wrapper  # type: ignore[return-value]

    return decorator


def invalidate_cache(prefix: str | None = None) -> None:
    if prefix is None:
        _cache.clear()
        return
    for key in list(_cache.keys()):
        if key.startswith(prefix):
            _cache.pop(key, None)
