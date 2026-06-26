"""Platform operations — public health, readiness, and liveness probes."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Request

from config import get_settings
from database import ping
from lib.enterprise.responses import api_ok
from lib.security.env_validation import validate_environment
from services.redis_cache import init_redis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/platform", tags=["platform-ops"])


@router.get("/health")
async def platform_health() -> dict[str, Any]:
    """Liveness — process is running."""
    return api_ok(service="omnimind-platform", status="healthy")


@router.get("/live")
async def platform_live() -> dict[str, Any]:
    return api_ok(live=True)


@router.get("/ready")
async def platform_ready(request: Request) -> dict[str, Any]:
    """Readiness — dependencies required to serve platform traffic."""
    settings = get_settings()
    checks: dict[str, Any] = {
        "config": validate_environment(production=settings.omnimind_env == "production"),
        "mongodb": {"ok": True},
        "redis": {"ok": True},
    }

    try:
        mongo = ping()
        checks["mongodb"] = {"ok": bool(mongo.get("connected") or mongo.get("initialized")), "mode": mongo.get("mode")}
    except Exception as exc:
        checks["mongodb"] = {"ok": False, "error": str(exc)}

    redis_state = getattr(request.app.state, "redis", None)
    if redis_state is None:
        redis_state = await init_redis()
    checks["redis"] = redis_state

    ready = checks["config"].get("ok", True) and (
        checks["mongodb"].get("ok") or settings.omnimind_env in ("development", "testing")
    )
    return api_ok(ready=ready, checks=checks)
