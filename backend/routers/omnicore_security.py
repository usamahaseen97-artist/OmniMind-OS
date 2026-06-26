"""
OmniCore Security Platform API — Sprint 3 zero trust, auth, compliance stubs."""



from __future__ import annotations

import logging

from typing import Any

from fastapi import APIRouter
from pydantic import Field

from lib.enterprise.dependencies import platform_router_dependencies
from lib.security.audit_events import list_events, record_security_event, threat_dashboard
from lib.security.env_validation import validate_environment
from lib.security.zero_trust import authorize_request
from schemas.platform_enterprise import FailedLoginBody
from schemas.strict import StrictModel

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/security",
    tags=["omnicore-security"],
    dependencies=platform_router_dependencies(),
)

_OAUTH_PROVIDERS = [
    {"provider": "google", "enabled": True, "scopes": ["openid", "email", "profile"]},
    {"provider": "microsoft", "enabled": False, "scopes": ["openid", "email", "profile"]},
    {"provider": "github", "enabled": False, "scopes": ["read:user", "user:email"]},
    {"provider": "apple", "enabled": False, "scopes": ["read:user", "user:email"]},
]

_COMPLIANCE = [
    {"framework": "soc2", "score": 45, "status": "partial"},
    {"framework": "iso27001", "score": 40, "status": "partial"},
    {"framework": "hipaa", "score": 20, "status": "planned"},
    {"framework": "gdpr", "score": 20, "status": "planned"},
    {"framework": "ccpa", "score": 20, "status": "planned"},
]


class AuthorizeBody(StrictModel):
    userId: str = Field(..., min_length=1, max_length=128)
    permission: str = Field(..., min_length=3, max_length=64)
    role: str = Field(default="guest", max_length=32)
    context: dict[str, str] = Field(default_factory=dict)


@router.get("/dashboard")
def security_dashboard() -> dict[str, Any]:
    return {"ok": True, "dashboard": threat_dashboard()}


@router.get("/events")
def security_events(limit: int = 50) -> dict[str, Any]:
    return {"ok": True, "events": list_events(limit)}


@router.post("/authorize")
def security_authorize(body: AuthorizeBody) -> dict[str, Any]:
    decision = authorize_request(body.userId, body.permission, role=body.role, context=body.context)
    return {"ok": True, "decision": decision}


@router.get("/compliance")
def compliance_report(framework: str | None = None) -> dict[str, Any]:
    report = _COMPLIANCE if not framework else [c for c in _COMPLIANCE if c["framework"] == framework]
    return {"ok": True, "report": report}


@router.get("/auth/providers")
def auth_providers() -> dict[str, Any]:
    return {"ok": True, "providers": _OAUTH_PROVIDERS}


@router.post("/auth/passkey/challenge")
def passkey_challenge() -> dict[str, Any]:
    return {
        "ok": True,
        "challenge": {
            "challenge": "passkey-stub-challenge",
            "timeout": 60000,
            "userVerification": "preferred",
        },
    }


@router.get("/env/validate")
def env_validate() -> dict[str, Any]:
    return {"ok": True, "validation": validate_environment()}


@router.post("/events/failed-login")
def log_failed_login(body: FailedLoginBody) -> dict[str, Any]:
    evt = record_security_event(
        kind="failed_login",
        severity="medium",
        actor_id=body.email,
        resource="auth",
        detail=body.reason,
        ip=body.ip,
    )
    return {"ok": True, "event": evt}
