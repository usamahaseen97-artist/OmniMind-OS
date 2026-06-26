"""Environment validation — ensure secrets are not exposed to client bundles."""

from __future__ import annotations

import os
from typing import Any

SERVER_ONLY_KEYS = frozenset({
    "JWT_SECRET_KEY",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "DATABASE_URL",
    "REDIS_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OMNIMIND_BOOTSTRAP_PASSWORD",
    "OMNIMIND_SOVEREIGN_PASSWORD",
    "OMNIMIND_OPERATOR_SECRET_KEY",
})

REQUIRED_PRODUCTION_KEYS = frozenset({
    "JWT_SECRET_KEY",
})


def validate_environment(*, production: bool = False) -> dict[str, Any]:
    missing = [k for k in REQUIRED_PRODUCTION_KEYS if not (os.getenv(k) or "").strip()]
    server_only_status = {k: "set" if os.getenv(k) else "missing" for k in SERVER_ONLY_KEYS}
    return {
        "ok": not (production and missing),
        "production": production,
        "missingRequired": missing,
        "serverOnlyKeys": server_only_status,
        "jwtEnforced": os.getenv("JWT_ENFORCE_MIDDLEWARE", "false").lower() in ("1", "true", "yes"),
    }
