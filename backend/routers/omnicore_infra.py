"""
OmniCore Infrastructure API — deployment, metrics, cache, storage (Sprint 5)."""



from __future__ import annotations

import logging

from typing import Any

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from lib.enterprise.dependencies import platform_router_dependencies
from lib.infra.cache_layers import CacheLayer
from lib.infra.environment import deployment_snapshot
from lib.infra.observability import metrics_snapshot, prometheus_text
from lib.infra.queue_worker import QUEUE_NAMES
from lib.infra.storage_backend import storage_backend

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/infra",
    tags=["omnicore-infra"],
    dependencies=platform_router_dependencies(),
)


@router.get("/health")
def infra_health() -> dict[str, Any]:
    return {"ok": True, "service": "omnicore-infra", "status": "healthy"}


@router.get("/deployment")
def deployment_info() -> dict[str, Any]:
    return {"ok": True, "deployment": deployment_snapshot()}


@router.get("/metrics")
def infra_metrics() -> dict[str, Any]:
    return {"ok": True, "metrics": metrics_snapshot()}


@router.get("/metrics/prometheus", response_class=PlainTextResponse)
def prometheus_metrics() -> str:
    return prometheus_text()


@router.get("/cache/layers")
def cache_layers() -> dict[str, Any]:
    return {
        "ok": True,
        "layers": [layer.value for layer in CacheLayer],
        "description": "Redis-backed named cache namespaces with memory fallback",
    }


@router.get("/storage")
def storage_info() -> dict[str, Any]:
    return {"ok": True, "storage": storage_backend.snapshot()}


@router.get("/queues")
def queue_info() -> dict[str, Any]:
    return {"ok": True, "queues": list(QUEUE_NAMES)}
