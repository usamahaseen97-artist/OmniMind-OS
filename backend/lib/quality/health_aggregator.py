"""Health aggregation for OmniMind quality dashboard."""

from __future__ import annotations

from typing import Any

_SERVICES = [
    {"name": "auth", "path": "/api/v1/auth/health"},
    {"name": "omnicore", "path": "/api/v1/omnicore/projects"},
    {"name": "security", "path": "/api/v1/omnicore/security/dashboard"},
]


def aggregate_health() -> dict[str, Any]:
    return {
        "status": "unknown",
        "services": _SERVICES,
        "message": "Use /api/v1/omnicore/quality/probe for live checks",
    }
