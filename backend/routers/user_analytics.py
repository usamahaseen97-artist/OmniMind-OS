"""
User-facing Big Data endpoints — mood, buffer healing, unified telemetry.
"""

from __future__ import annotations

from typing import Annotated, Any, Literal, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from services.kafka_pipeline import Domain, ingest, schedule_telemetry
from services.spark_analytics import (
    compute_buffer_healing,
    compute_current_mood,
    compute_taste_matrix,
    process_stream_batch,
)

router = APIRouter(prefix="/api/v1/user", tags=["bigdata-user"])


class TelemetryIn(BaseModel):
    domain: Literal["movie", "music", "tv"]
    user_id: str = Field(default="anonymous", max_length=120)
    content_id: str = Field(..., min_length=1, max_length=120)
    genre: str = Field(default="General", max_length=120)
    playback_status: Literal["play", "pause", "skip", "stop", "click", "view", "buffer"] = "play"
    network_bitrate: float = Field(default=0.0, ge=0)
    packet_loss_ratio: float = Field(default=0.0, ge=0, le=1)
    title: str = Field(default="", max_length=300)


@router.get("/current-mood")
async def current_mood(
    user_id: Annotated[str, Query(max_length=120)] = "anonymous",
):
    mood = compute_current_mood(user_id)
    batch = process_stream_batch()
    return {"mood": mood, "pipeline": batch}


@router.get("/buffer-healing")
async def buffer_healing(
    user_id: Annotated[str, Query(max_length=120)] = "anonymous",
):
    return compute_buffer_healing(user_id)


@router.get("/taste-matrix")
async def taste_matrix(
    user_id: Annotated[str, Query(max_length=120)] = "anonymous",
):
    return compute_taste_matrix(user_id)


@router.post("/telemetry")
async def post_telemetry(body: TelemetryIn):
    result = await ingest(
        domain=body.domain,
        user_id=body.user_id,
        content_id=body.content_id,
        genre=body.genre,
        playback_status=body.playback_status,
        network_bitrate=body.network_bitrate,
        packet_loss_ratio=body.packet_loss_ratio,
        title=body.title,
    )
    return {"ok": True, **result}


@router.post("/telemetry/async")
async def post_telemetry_async(body: TelemetryIn):
    from services.kafka_pipeline import TelemetryEvent

    schedule_telemetry(
        TelemetryEvent(
            user_id=body.user_id,
            content_id=body.content_id,
            genre=body.genre,
            playback_status=body.playback_status,
            network_bitrate=body.network_bitrate,
            packet_loss_ratio=body.packet_loss_ratio,
            domain=body.domain,
            title=body.title,
        )
    )
    return {"ok": True, "queued": True}
