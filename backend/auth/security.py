"""
OmniMind V11 — production JWT + bcrypt credential pipeline.
"""

from __future__ import annotations

import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from passlib.context import CryptContext

from config import get_settings

logger = logging.getLogger(__name__)

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _pwd_context.verify(plain, hashed)
    except Exception:
        return False


def _signing_key() -> str:
    settings = get_settings()
    key = (settings.jwt_secret_key or "").strip()
    if not key:
        key = secrets.token_urlsafe(48)
        logger.warning("JWT_SECRET_KEY unset — ephemeral signing key (tokens invalid after restart)")
    return key


def create_access_token(
    subject: str,
    *,
    extra: Optional[dict[str, Any]] = None,
    expires_minutes: Optional[int] = None,
) -> str:
    settings = get_settings()
    ttl = expires_minutes if expires_minutes is not None else settings.jwt_access_expire_minutes
    now = _utcnow()
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=ttl)).timestamp()),
        "type": "access",
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, _signing_key(), algorithm=ALGORITHM)


def create_refresh_token(subject: str, *, expires_days: Optional[int] = None) -> str:
    settings = get_settings()
    days = expires_days if expires_days is not None else settings.jwt_refresh_expire_days
    now = _utcnow()
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=days)).timestamp()),
        "type": "refresh",
    }
    return jwt.encode(payload, _signing_key(), algorithm=ALGORITHM)


def decode_token(token: str, *, expected_type: Optional[str] = None) -> dict[str, Any]:
    """Validate signature + expiry; raises jwt.PyJWTError on failure."""
    payload = jwt.decode(
        token,
        _signing_key(),
        algorithms=[ALGORITHM],
        options={"require": ["exp", "sub", "iat"]},
    )
    if expected_type and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(f"expected token type {expected_type}")
    return payload
