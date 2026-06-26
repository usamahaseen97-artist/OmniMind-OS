"""Request-scoped context — request ID and correlation ID propagation."""

from __future__ import annotations

import uuid
from contextvars import ContextVar

_request_id: ContextVar[str | None] = ContextVar("request_id", default=None)
_correlation_id: ContextVar[str | None] = ContextVar("correlation_id", default=None)


def new_request_id() -> str:
    return f"req-{uuid.uuid4().hex[:16]}"


def new_correlation_id() -> str:
    return f"corr-{uuid.uuid4().hex[:16]}"


def set_request_id(value: str) -> None:
    _request_id.set(value)


def set_correlation_id(value: str) -> None:
    _correlation_id.set(value)


def get_request_id() -> str | None:
    return _request_id.get()


def get_correlation_id() -> str | None:
    return _correlation_id.get()
