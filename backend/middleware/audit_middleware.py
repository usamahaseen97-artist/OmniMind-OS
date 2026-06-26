"""Audit logging middleware for mutating platform requests."""

from __future__ import annotations

import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from lib.enterprise.context import get_correlation_id, get_request_id
from lib.security.audit_events import record_security_event

logger = logging.getLogger(__name__)

_AUDIT_PREFIXES = (
    "/api/v1/omnicore",
    "/api/v1/medical-enterprise",
    "/api/v1/visionary",
    "/api/v1/omnimusic",
)

_MUTATING = frozenset({"POST", "PUT", "PATCH", "DELETE"})


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        should_audit = any(path.startswith(p) for p in _AUDIT_PREFIXES) and request.method in _MUTATING

        response = await call_next(request)

        if should_audit:
            actor = request.headers.get("X-User-ID", "unknown")
            auth = request.headers.get("Authorization", "")
            if auth.lower().startswith("bearer "):
                actor = "authenticated"
            severity = "low" if response.status_code < 400 else "medium"
            record_security_event(
                kind="api_mutation",
                severity=severity,
                actor_id=actor,
                resource=path,
                detail=f"{request.method} status={response.status_code}",
                ip=request.client.host if request.client else None,
            )
            logger.info(
                "audit mutation method=%s path=%s status=%s request_id=%s correlation_id=%s",
                request.method,
                path,
                response.status_code,
                get_request_id(),
                get_correlation_id(),
            )
        return response
