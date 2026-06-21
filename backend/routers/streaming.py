"""
Combined streaming status (read-only — does NOT auto-start Kafka/Spark).
Use /api/streaming/kafka/* or /api/streaming/spark/* to wake engines on demand.
"""

from __future__ import annotations

from fastapi import APIRouter, Query

from services import kafka_bus, spark_client
from services.streaming_orchestrator import service_status

router = APIRouter(prefix="/api/streaming", tags=["streaming"])


@router.get("/health")
async def streaming_health(retry: bool = Query(False)):
    """
    Lightweight health — no Docker spin-up.
    Pass retry=true to attempt Kafka reconnect only if containers already run.
    """
    kafka_status = await kafka_bus.ping_kafka(retry=retry)
    spark_status = spark_client.ping_spark()
    return {
        "kafka": kafka_status,
        "spark": spark_status,
        "kafka_docker": service_status("kafka"),
        "spark_docker": service_status("spark"),
        "ready": bool(kafka_status.get("connected") and spark_status.get("connected")),
        "on_demand": True,
        "entertainment_topic": "omnimind.entertainment",
        "hint": "Wake: /api/streaming/kafka/health · Analytics: /api/v1/entertainment/analytics/spark",
    }
