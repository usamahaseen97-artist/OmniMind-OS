"""
Platform readiness — single endpoint for frontend + ops (publish checklist).
"""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from config import get_settings
from database import ping
from services import connection_controller, kafka_bus, lm_studio, spark_client
from services.integration_gateway import integration_matrix
from services.provider_registry import provider_matrix

router = APIRouter(prefix="/api/v1/platform", tags=["platform"])


@router.get("/readiness")
async def platform_readiness() -> JSONResponse:
    """
    Lightweight health — no blocking Docker calls when lazy-load is enabled.
    Always returns HTTP 200 so the UI can show online.
    """
    settings = get_settings()
    try:
        db = ping()
    except Exception as exc:
        db = {"connected": True, "mode": "in_memory_fallback", "error": str(exc)}

    mongo_ok = bool(db.get("connected"))
    mongo_mode = db.get("mode") or ("atlas" if mongo_ok else "in_memory_fallback")
    api_ok = mongo_ok or mongo_mode == "in_memory_fallback"

    kafka_ping = await kafka_bus.ping_kafka(retry=False)

    spark_ping = spark_client.ping_spark()

    lm_ping: dict = {"connected": False}
    try:
        lm_ping = await lm_studio.check_connection()
    except Exception as exc:
        lm_ping = {"connected": False, "error": str(exc)}

    hints: list[str] = []
    if mongo_mode == "in_memory_fallback":
        hints.append(
            "MongoDB: in-memory mode — set MONGODB_URI in backend/.env for persistent Atlas storage.",
        )
    elif not mongo_ok:
        hints.append("MongoDB: set MONGODB_URI or MONGODB_USER+PASSWORD+HOST in backend/.env")

    if settings.streaming_lazy_load:
        hints.append("Kafka/Spark: optional — not required for chat.")
    else:
        if not kafka_ping.get("connected"):
            hints.append("Kafka: optional — docker compose up -d kafka")
        if not spark_ping.get("connected"):
            hints.append("Spark: optional — docker compose up -d spark-master spark-worker")

    return JSONResponse(
        status_code=200,
        content={
            "ok": api_ok,
            "api_online": True,
            "publish_ready": mongo_ok and mongo_mode not in ("in_memory_fallback", "error"),
            "version": "v11",
            "mongodb": {
                "connected": mongo_ok,
                "mode": mongo_mode,
                "database": db.get("database"),
            },
            "llm": {
                "provider": settings.llm_provider,
                "lm_studio": lm_ping,
                "gemini_configured": bool(settings.gemini_api_key),
            },
            "engine": connection_controller.engine_status_payload(lm_ping),
            "integrations": integration_matrix(),
            "providers": provider_matrix(lm_online=bool(lm_ping.get("connected"))),
            "streaming": {
                "lazy_load": settings.streaming_lazy_load,
                "kafka": kafka_ping,
                "spark": spark_ping,
            },
            "cors_origins_configured": len(settings.cors_origins) > 0,
            "hints": hints[:6],
        },
    )
