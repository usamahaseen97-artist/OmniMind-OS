"""Request ID and correlation ID middleware."""

from __future__ import annotations

import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from lib.enterprise.context import (
    get_correlation_id,
    get_request_id,
    new_correlation_id,
    new_request_id,
    set_correlation_id,
    set_request_id,
)

logger = logging.getLogger(__name__)


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        req_id = request.headers.get("X-Request-ID") or new_request_id()
        corr_id = (
            request.headers.get("X-Correlation-ID")
            or request.headers.get("X-Trace-ID")
            or new_correlation_id()
        )
        set_request_id(req_id)
        set_correlation_id(corr_id)

        response = await call_next(request)
        response.headers["X-Request-ID"] = get_request_id() or req_id
        response.headers["X-Correlation-ID"] = get_correlation_id() or corr_id
        return response
