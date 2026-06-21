"""Entertainment streaming analytics — Kafka + Spark status and trending."""

from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from services import kafka_bus, spark_client
from services.entertainment_pipeline import (
    compute_trending_preview,
    recent_events,
    run_spark_entertainment_analytics,
    schedule_entertainment_event,
    track_entertainment_event,
)
from services.streaming_orchestrator import service_status

router = APIRouter(prefix="/api/v1/entertainment", tags=["entertainment-streaming"])


class EntertainmentTelemetryBody(BaseModel):
    module: str = Field(..., min_length=1, max_length=32)
    action: str = Field(..., min_length=1, max_length=64)
    user_id: str = Field(default="anonymous", max_length=128)
    payload: dict = Field(default_factory=dict)


@router.get("/streaming/status")
async def entertainment_streaming_status():
    """Kafka + Spark readiness for macro-engine modules (read-only)."""
    kafka = await kafka_bus.ping_kafka(retry=False)
    spark = spark_client.ping_spark()
    return {
        "kafka": kafka,
        "spark": spark,
        "kafka_docker": service_status("kafka"),
        "spark_docker": service_status("spark"),
        "topics": {
            "events": "omnimind.events",
            "entertainment": "omnimind.entertainment",
            "finance": "omnimind.finance",
        },
        "hint": "Wake engines: GET /api/streaming/kafka/health or /api/streaming/spark/health",
    }


@router.get("/analytics/preview")
async def entertainment_analytics_preview(
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
):
    return {
        "preview": compute_trending_preview(limit=limit),
        "recent": recent_events(limit=20),
    }


@router.post("/analytics/spark")
async def entertainment_spark_analytics():
    """Run Spark (or Python fallback) aggregation on entertainment event batches."""
    return await run_spark_entertainment_analytics()


@router.post("/telemetry")
async def entertainment_telemetry(body: EntertainmentTelemetryBody):
    """Client-reported play/search events (OmniMusic player, OmniStream UI)."""
    result = await track_entertainment_event(
        body.module,
        body.action,
        user_id=body.user_id,
        payload=body.payload,
    )
    return {"success": True, **result}


@router.post("/telemetry/fire")
async def entertainment_telemetry_fire(body: EntertainmentTelemetryBody):
    """Non-blocking telemetry (same as telemetry, for high-frequency UI pings)."""
    schedule_entertainment_event(
        body.module,
        body.action,
        user_id=body.user_id,
        payload=body.payload,
    )
    return {"success": True, "queued": True}
