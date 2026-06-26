"""Standardized API response envelopes."""

from __future__ import annotations

from typing import Any

from lib.enterprise.context import get_correlation_id, get_request_id


def api_ok(payload: dict[str, Any] | None = None, **kwargs: Any) -> dict[str, Any]:
    """Success envelope with request/correlation IDs."""
    body: dict[str, Any] = {
        "ok": True,
        "request_id": get_request_id(),
        "correlation_id": get_correlation_id(),
    }
    if payload:
        body.update(payload)
    if kwargs:
        body.update(kwargs)
    return body


def api_error(
    *,
    error: str,
    detail: str,
    status_code: int = 400,
    **extra: Any,
) -> dict[str, Any]:
    """Error envelope (for exception handlers)."""
    body: dict[str, Any] = {
        "ok": False,
        "error": error,
        "detail": detail,
        "status_code": status_code,
        "request_id": get_request_id(),
        "correlation_id": get_correlation_id(),
    }
    body.update(extra)
    return body
