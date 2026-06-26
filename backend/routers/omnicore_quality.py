"""
OmniCore Quality API — Sprint 4 QA, health, metrics stubs."""



from __future__ import annotations

import logging

from typing import Any

from fastapi import APIRouter

from lib.enterprise.dependencies import platform_router_dependencies
from lib.quality.health_aggregator import aggregate_health
from lib.quality.metrics_collector import snapshot as metrics_snapshot
from lib.security.env_validation import validate_environment

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/quality",
    tags=["omnicore-quality"],
    dependencies=platform_router_dependencies(),
)


@router.get("/health")
def quality_health() -> dict[str, Any]:
    return {"ok": True, "service": "omnicore-quality", "status": "healthy"}


@router.get("/dashboard")
def quality_dashboard() -> dict[str, Any]:
    return {
        "ok": True,
        "dashboard": {
            "health": aggregate_health(),
            "metrics": metrics_snapshot(),
            "env": validate_environment(),
        },
    }


@router.get("/metrics")
def quality_metrics() -> dict[str, Any]:
    return {"ok": True, "metrics": metrics_snapshot()}


@router.get("/env/validate")
def env_validate() -> dict[str, Any]:
    return {"ok": True, "validation": validate_environment(production=False)}
