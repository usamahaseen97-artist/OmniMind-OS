"""
Isolated thread pool for blocking infra work (Docker CLI, sync HTTP).
Keeps the FastAPI event loop free for chat and lightweight routes.
"""

from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Any, Callable, TypeVar

T = TypeVar("T")

_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="omnimind-infra")


async def run_blocking(func: Callable[..., T], *args: Any, **kwargs: Any) -> T:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(_executor, partial(func, *args, **kwargs))


def shutdown_pool() -> None:
    _executor.shutdown(wait=False, cancel_futures=True)
