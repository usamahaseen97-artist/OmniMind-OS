"""Prometheus/OpenTelemetry-ready HTTP metrics middleware."""

from __future__ import annotations

import logging
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from lib.enterprise.context import get_request_id
from lib.infra.observability import increment, observe_latency

logger = logging.getLogger(__name__)

_PLATFORM_PREFIXES = (
    "/api/v1/omnicore",
    "/api/v1/medical-enterprise",
    "/api/v1/visionary",
    "/api/v1/omnimusic",
    "/api/v1/platform",
)


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        track = any(path.startswith(p) for p in _PLATFORM_PREFIXES)
        started = time.perf_counter()
        response = await call_next(request)
        if track:
            elapsed_ms = (time.perf_counter() - started) * 1000
            status_bucket = f"{response.status_code // 100}xx"
            increment(f"http_requests_total{{method={request.method},status={status_bucket}}}")
            observe_latency(f"http_request_duration_ms{{path_prefix={path.split('/')[3] if path.count('/')>=3 else 'root'}}}", elapsed_ms)
            if response.status_code >= 500:
                increment("http_errors_total")
                logger.error(
                    "platform_request_error method=%s path=%s status=%s duration_ms=%.1f request_id=%s",
                    request.method,
                    path,
                    response.status_code,
                    elapsed_ms,
                    get_request_id(),
                )
        return response
