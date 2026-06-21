"""Spark routes — spin up Docker only when these endpoints are hit."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from services import spark_client
from services.streaming_orchestrator import (
    ensure_spark_running,
    service_status,
    stop_service,
    touch_activity,
)

router = APIRouter(prefix="/api/streaming/spark", tags=["streaming-spark"])


async def _require_spark() -> dict:
    touch_activity("spark")
    status = await ensure_spark_running()
    if not status.get("ready"):
        raise HTTPException(
            status_code=503,
            detail={
                "error": "spark_unavailable",
                "reason": status.get("error", status),
                "hint": "Ensure Docker Desktop is running",
            },
        )
    return status


@router.get("/health")
async def spark_health(_: dict = Depends(_require_spark)):
    spark = await spark_client.ping_spark_async()
    return {"spark": spark, "docker": service_status("spark"), "on_demand": True}


@router.get("/status")
async def spark_status():
    """Container status only — does not start Spark."""
    return {"spark": spark_client.ping_spark(), "docker": service_status("spark")}


@router.post("/stop")
async def spark_stop():
    """Manually stop Spark containers and free RAM."""
    return await stop_service("spark")


@router.get("/ui")
async def spark_ui_link(_: dict = Depends(_require_spark)):
    from config import get_settings

    base = get_settings().spark_ui_url.rstrip("/")
    return {"ui_url": base, "master": get_settings().spark_master_url}
