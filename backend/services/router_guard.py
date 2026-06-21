"""Async error isolation for sovereign tool routers."""

from __future__ import annotations

import functools
import logging
from typing import Any, Callable, TypeVar

from fastapi import HTTPException

logger = logging.getLogger(__name__)

F = TypeVar("F", bound=Callable[..., Any])


def isolated_tool_route(*, tool: str) -> Callable[[F], F]:
    """Catch, log, and normalize errors per tool endpoint."""

    def decorator(fn: F) -> F:
        @functools.wraps(fn)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                result = await fn(*args, **kwargs)
                if isinstance(result, dict) and result.get("ok") is False:
                    logger.warning("[%s] business rejection: %s", tool, result.get("error"))
                return result
            except HTTPException:
                raise
            except ValueError as exc:
                logger.warning("[%s] validation error: %s", tool, exc)
                raise HTTPException(status_code=422, detail=str(exc)) from exc
            except Exception as exc:
                logger.exception("[%s] unhandled pipeline error", tool)
                raise HTTPException(
                    status_code=500,
                    detail={"tool": tool, "error": "pipeline_failure", "message": str(exc)},
                ) from exc

        return wrapper  # type: ignore[return-value]

    return decorator
