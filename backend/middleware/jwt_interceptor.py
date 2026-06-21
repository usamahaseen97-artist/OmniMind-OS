"""
Optional JWT validation middleware — rejects invalid Bearer tokens on protected prefixes.
"""

from __future__ import annotations

import logging
from typing import Callable

import jwt
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from auth.security import decode_token
from config import get_settings

logger = logging.getLogger(__name__)

_PUBLIC_PREFIXES = (
    "/",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/api/v1/auth",
    "/api/v1/webhooks",
    "/api/v1/health",
    "/api/v1/system/status",
    "/api/v1/omnimind",
    "/api/v1/entertainment/music",
    "/api/v1/entertainment/search",
    "/api/v1/neural-agent",
    "/api/v1/media",
    "/api/v1/quantum",
    "/api/v1/maps",
    "/api/v1/business",
    "/api/v1/simulation",
    "/api/v1/finance",
    "/api/v1/trading",
    "/api/v1/medical",
    "/api/v1/marketing",
    "/api/marketing",
    "/marketing",
    "/api/agents",
    "/api/v1/nodes/webhook",
    "/api/v1/webhooks/node-stream",
    "/api/terminal",
    "/api/infra",
    "/api/health",
)


class JWTInterceptorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        settings = get_settings()
        if not settings.jwt_enforce_middleware:
            return await call_next(request)

        path = request.url.path
        if request.method == "OPTIONS":
            return await call_next(request)
        if any(path == p or path.startswith(p + "/") for p in _PUBLIC_PREFIXES if p != "/"):
            if path != "/" or request.method == "GET":
                return await call_next(request)
        if path == "/" and request.method == "GET":
            return await call_next(request)

        protected_prefix = settings.jwt_protected_prefix
        if protected_prefix and not path.startswith(protected_prefix):
            return await call_next(request)

        auth = request.headers.get("Authorization", "")
        if not auth.lower().startswith("bearer "):
            return JSONResponse(status_code=401, content={"detail": "Bearer token required"})

        token = auth.split(" ", 1)[1].strip()
        try:
            decode_token(token, expected_type="access")
        except jwt.PyJWTError:
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

        return await call_next(request)
