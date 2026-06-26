"""Inject request/correlation IDs into JSON API responses."""

from __future__ import annotations

import json
import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from lib.enterprise.context import get_correlation_id, get_request_id

logger = logging.getLogger(__name__)

_PLATFORM_PREFIXES = (
    "/api/v1/omnicore",
    "/api/v1/medical-enterprise",
    "/api/v1/visionary",
    "/api/v1/omnimusic",
    "/api/v1/platform",
)


class ResponseEnvelopeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        path = request.url.path
        if response.status_code >= 400 or not any(path.startswith(p) for p in _PLATFORM_PREFIXES):
            return response
        content_type = response.headers.get("content-type", "")
        if "application/json" not in content_type:
            return response
        try:
            chunks: list[bytes] = []
            async for chunk in response.body_iterator:
                chunks.append(chunk)
            raw = b"".join(chunks)
            body = json.loads(raw.decode())
        except Exception:
            return response
        if not isinstance(body, dict):
            body = {"ok": True, "data": body}
        if "ok" not in body:
            body["ok"] = True
        body.setdefault("request_id", get_request_id())
        body.setdefault("correlation_id", get_correlation_id())
        headers = dict(response.headers)
        headers.pop("content-length", None)
        return JSONResponse(status_code=response.status_code, content=body, headers=headers)
