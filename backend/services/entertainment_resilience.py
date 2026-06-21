"""
Zero-error defaults for entertainment APIs when Elasticsearch or upstream fails.
"""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

T = TypeVar("T")


async def safe_await(
    factory: Callable[[], Awaitable[T]],
    *,
    fallback: T,
    label: str = "entertainment",
) -> T:
    try:
        return await factory()
    except Exception as exc:
        logger.warning("%s fallback (non-fatal): %s", label, exc)
        return fallback


def degraded_json(
    payload: dict[str, Any],
    *,
    error: str | None = None,
) -> JSONResponse:
    body = {**payload, "ok": True, "degraded": True}
    if error:
        body["fallback_reason"] = error[:300]
    return JSONResponse(status_code=200, content=body)
