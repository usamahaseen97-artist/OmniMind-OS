"""Async facade over sync omnicore_store — avoids blocking the event loop."""

from __future__ import annotations

import asyncio
from functools import partial
from typing import Any, Callable, TypeVar

from lib.omnicore_store import append_list_item, load, load_list, save, status

T = TypeVar("T")


async def _run(fn: Callable[..., T], *args: Any, **kwargs: Any) -> T:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, partial(fn, *args, **kwargs))


async def aload(key: str, default: Any) -> Any:
    return await _run(load, key, default)


async def asave(key: str, data: Any) -> bool:
    return await _run(save, key, data)


async def aload_list(key: str) -> list[dict[str, Any]]:
    return await _run(load_list, key)


async def aappend_list_item(key: str, item: dict[str, Any], *, max_items: int = 500) -> list[dict[str, Any]]:
    return await _run(append_list_item, key, item, max_items=max_items)


async def astore_status() -> dict[str, Any]:
    return await _run(status)
