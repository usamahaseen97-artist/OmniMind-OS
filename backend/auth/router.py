"""
Auth routes — token issuance for production clients.
"""

from __future__ import annotations

import logging
import os

from fastapi import APIRouter, HTTPException, status
from pydantic import Field

from auth.dependencies import CurrentUser
from auth.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from schemas.strict import StrictModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Bootstrap admin — override via OMNIMIND_BOOTSTRAP_EMAIL / OMNIMIND_BOOTSTRAP_PASSWORD
_BOOTSTRAP_EMAIL = os.getenv("OMNIMIND_BOOTSTRAP_EMAIL", "admin@omnimind.local")
_BOOTSTRAP_PASSWORD_HASH = os.getenv("OMNIMIND_BOOTSTRAP_PASSWORD_HASH", "")
_BOOTSTRAP_PASSWORD_PLAIN = os.getenv("OMNIMIND_BOOTSTRAP_PASSWORD", "changeme-in-production")


def _bootstrap_password_hash() -> str:
    if _BOOTSTRAP_PASSWORD_HASH:
        return _BOOTSTRAP_PASSWORD_HASH
    return hash_password(_BOOTSTRAP_PASSWORD_PLAIN)


class LoginBody(StrictModel):
    email: str = Field(..., min_length=3, max_length=256)
    password: str = Field(..., min_length=4, max_length=256)


class RefreshBody(StrictModel):
    refresh_token: str = Field(..., min_length=16, max_length=4096)


class SessionBody(StrictModel):
    """Cross-platform session handshake (web, desktop, iOS, Android)."""
    username: str = Field(..., min_length=3, max_length=128)
    secret_pass: str = Field(..., min_length=4, max_length=256)


_SOVEREIGN_USERNAME = os.getenv("OMNIMIND_SOVEREIGN_USERNAME", "").strip()
_SOVEREIGN_PASSWORD = os.getenv("OMNIMIND_SOVEREIGN_PASSWORD", "").strip()
_OPERATOR_USERNAME = os.getenv("OMNIMIND_OPERATOR_USERNAME", "").strip()
_OPERATOR_SECRET = os.getenv("OMNIMIND_OPERATOR_SECRET_KEY", "").strip()


@router.post("/session")
async def secure_session_handshake(body: SessionBody) -> dict:
    """
    Issue signed JWT badges for mobile, desktop, and web layers.
    Credentials via OMNIMIND_SOVEREIGN_USERNAME / OMNIMIND_SOVEREIGN_PASSWORD.
    """
    if not _SOVEREIGN_USERNAME or not _SOVEREIGN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sovereign session credentials not configured",
        )
    if body.username != _SOVEREIGN_USERNAME or body.secret_pass != _SOVEREIGN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="System credential signature mismatch.",
        )

    subject = body.username
    access = create_access_token(
        subject,
        extra={"role": "root_operator"},
        expires_minutes=24 * 60,
    )
    refresh = create_refresh_token(subject)
    return {
        "ok": True,
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "expires_in": 24 * 60 * 60,
    }


@router.post("/session-token")
async def authenticate_user_access(username: str, secret_key: str) -> dict:
    """
    Issue high-entropy signed JWT tokens for client devices (12h TTL).
    Credentials via OMNIMIND_OPERATOR_USERNAME / OMNIMIND_OPERATOR_SECRET_KEY.
    """
    if not _OPERATOR_USERNAME or not _OPERATOR_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Operator session credentials not configured",
        )
    if username != _OPERATOR_USERNAME or secret_key != _OPERATOR_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid system configuration token signature.",
        )

    access = create_access_token(
        username,
        extra={"scope": "system_root", "role": "root_operator"},
        expires_minutes=12 * 60,
    )
    refresh = create_refresh_token(username)
    return {
        "ok": True,
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "expires_in": 12 * 60 * 60,
    }


@router.post("/login")
async def login(body: LoginBody) -> dict:
    """Issue signed JWT access + refresh tokens."""
    if body.email.lower() != _BOOTSTRAP_EMAIL.lower():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(body.password, _bootstrap_password_hash()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    subject = body.email.lower()
    access = create_access_token(subject, extra={"role": "operator"})
    refresh = create_refresh_token(subject)
    return {
        "ok": True,
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "expires_in": 60 * 60,
    }


@router.post("/refresh")
async def refresh(body: RefreshBody) -> dict:
    try:
        payload = decode_token(body.refresh_token, expected_type="refresh")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    subject = str(payload["sub"])
    access = create_access_token(subject, extra={"role": "operator"})
    return {"ok": True, "access_token": access, "token_type": "bearer"}


@router.get("/me")
async def me(user: CurrentUser) -> dict:
    return {"ok": True, "user": {"sub": user.get("sub"), "role": user.get("role")}}


@router.get("/health")
async def auth_health() -> dict:
    return {"ok": True, "service": "jwt", "algorithm": "HS256"}
