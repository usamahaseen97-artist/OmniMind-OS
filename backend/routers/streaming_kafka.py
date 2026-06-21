"""Kafka routes — spin up Docker only when these endpoints are hit."""

from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException

from schemas.strict import StrictModel
from pydantic import Field, field_validator

from services import kafka_bus
from services.streaming_orchestrator import (
    ensure_kafka_running,
    service_status,
    stop_service,
    touch_activity,
)

router = APIRouter(prefix="/api/streaming/kafka", tags=["streaming-kafka"])


class KafkaPublishBody(StrictModel):
    message: str = Field(..., min_length=1, max_length=4096)
    topic: str | None = Field(default=None, max_length=128)

    @field_validator("topic")
    @classmethod
    def topic_chars(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.replace(".", "").replace("-", "").replace("_", "").isalnum():
            raise ValueError("topic must be alphanumeric with . - _ only")
        return v


async def _require_kafka() -> dict:
    touch_activity("kafka")
    status = await ensure_kafka_running()
    if not status.get("ready"):
        raise HTTPException(
            status_code=503,
            detail={
                "error": "kafka_unavailable",
                "reason": status.get("error", status),
                "hint": "Ensure Docker Desktop is running",
            },
        )
    return status


@router.get("/health")
async def kafka_health(_: dict = Depends(_require_kafka)):
    ping = await kafka_bus.ping_kafka()
    return {"kafka": ping, "docker": service_status("kafka"), "on_demand": True}


@router.get("/status")
async def kafka_status():
    """Container status only — does not start Kafka."""
    ping = await kafka_bus.ping_kafka()
    return {"kafka": ping, "docker": service_status("kafka")}


@router.post("/stop")
async def kafka_stop():
    """Manually stop Kafka containers and free RAM."""
    return await stop_service("kafka")


@router.post("/publish")
async def kafka_publish(body: KafkaPublishBody, _: dict = Depends(_require_kafka)):
    payload = json.dumps({"message": body.message, "source": "omnimind-api"}).encode("utf-8")
    result = await kafka_bus.publish_event(payload, topic=body.topic)
    if not result.get("ok"):
        raise HTTPException(status_code=503, detail=result)
    return result
