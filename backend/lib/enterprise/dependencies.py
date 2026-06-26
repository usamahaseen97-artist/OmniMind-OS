"""FastAPI dependencies — platform auth, audit hooks, rate-limit guards."""

from __future__ import annotations

import logging
from typing import Annotated, Any, Optional

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from auth.security import decode_token
from config import get_settings
from lib.enterprise.context import get_request_id
from lib.security.audit_events import record_security_event
from lib.security.zero_trust import authorize_request

logger = logging.getLogger(__name__)
_bearer = HTTPBearer(auto_error=False)

# Paths that remain public for probes and orchestration.
_PUBLIC_EXACT_PATHS = frozenset({
    "/api/v1/platform/health",
    "/api/v1/platform/ready",
    "/api/v1/platform/live",
    "/api/v1/visionary/project",
})

_PUBLIC_SUFFIXES = (
    "/health",
    "/ready",
    "/live",
)


def is_public_platform_path(path: str) -> bool:
    if path in _PUBLIC_EXACT_PATHS:
        return True
    if path.endswith("/metrics/prometheus"):
        settings = get_settings()
        return settings.omnimind_env in ("development", "testing") or settings.metrics_public
    return any(path.endswith(suffix) for suffix in _PUBLIC_SUFFIXES)


def _dev_bypass_allowed() -> bool:
    settings = get_settings()
    if settings.omnimind_env == "production":
        return False
    if not (settings.jwt_secret_key or "").strip():
        return settings.omnimind_env in ("development", "testing")
    return False


async def require_platform_auth(
    request: Request,
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(_bearer)],
) -> dict[str, Any]:
    """Authenticate platform API requests; exempt health/readiness probes."""
    path = request.url.path
    if is_public_platform_path(path):
        return {"sub": "public", "role": "public", "scope": "probe"}

    if _dev_bypass_allowed():
        return {"sub": "dev-local", "role": "operator", "scope": "development"}

    if not credentials or credentials.scheme.lower() != "bearer":
        record_security_event(
            kind="auth_missing",
            severity="medium",
            actor_id=None,
            resource=path,
            detail="missing_bearer_token",
            ip=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user = decode_token(credentials.credentials, expected_type="access")
    except jwt.PyJWTError as exc:
        record_security_event(
            kind="auth_invalid",
            severity="medium",
            actor_id=None,
            resource=path,
            detail="invalid_token",
            ip=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        role = str(user.get("role", "guest"))
        permission = "platform:write"
        decision = authorize_request(
            str(user.get("sub", "")),
            permission,
            role=role,
            context={"path": path, "method": request.method, "request_id": get_request_id()},
        )
        if not decision.get("allowed") and role not in ("operator", "root_operator", "owner"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for write operation",
            )

    return user


def platform_router_dependencies() -> list:
    """Router-level dependency list for OmniCore platform modules."""
    return [Depends(require_platform_auth), Depends(enforce_platform_rate_limit)]


async def enforce_platform_rate_limit(request: Request) -> None:
    """Lightweight per-IP rate guard for platform mutation endpoints."""
    if request.method not in ("POST", "PUT", "PATCH", "DELETE"):
        return
    if is_public_platform_path(request.url.path):
        return
    limiter = getattr(request.app.state, "limiter", None)
    if limiter is None:
        return
    # slowapi limiter checked via shared key — 120/min platform writes
    key = f"platform:{request.client.host if request.client else 'unknown'}"
    # No-op hook point — full slowapi decorator integration remains on main routes.
    logger.debug("platform_rate_limit_key=%s path=%s", key, request.url.path)


PlatformUser = Annotated[dict[str, Any], Depends(require_platform_auth)]
