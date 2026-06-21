"""
OmniMovies Big Data telemetry — Kafka topic ``movie-analytics`` + JSONL batch store.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from pathlib import Path
from typing import Any, Optional

from config import get_settings
from services import kafka_bus
from services.infra_pool import run_blocking
from services.process_utils import docker_executable

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "movie_analytics"
EVENTS_FILE = DATA_DIR / "events.jsonl"


def _ensure_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def _append_event_sync(event: dict[str, Any]) -> None:
    _ensure_dir()
    with EVENTS_FILE.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, default=str) + "\n")


async def _publish_kafka(event: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    topic = settings.kafka_movie_analytics_topic
    payload = json.dumps(event, default=str).encode("utf-8")

    ping = await kafka_bus.ping_kafka(retry=False)
    if ping.get("connected"):
        return await kafka_bus.publish_event(payload, topic=topic)

    if not docker_executable():
        return {
            "ok": False,
            "simulated": True,
            "topic": topic,
            "error": "Kafka offline — event saved to JSONL",
        }

    try:
        from services.streaming_orchestrator import ensure_service_active

        boot = await ensure_service_active("kafka")
        if not boot.get("ready"):
            return {
                "ok": False,
                "simulated": True,
                "topic": topic,
                "error": boot.get("error", "kafka not ready"),
            }
        return await kafka_bus.publish_event(payload, topic=topic)
    except (FileNotFoundError, OSError) as exc:
        return {"ok": False, "simulated": True, "topic": topic, "error": str(exc)}


_ACTION_TO_STATUS = {
    "play": "play",
    "pause": "pause",
    "skip": "skip",
    "stop": "stop",
    "click": "click",
    "view": "view",
    "buffer": "buffer",
}


async def track_movie_event(
    *,
    user_id: str,
    movie_id: str,
    action: str,
    payload: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Record click/play — legacy movie-analytics + unified movie-events pipeline."""
    event = {
        "event_id": str(uuid.uuid4()),
        "user_id": user_id or "anonymous",
        "movie_id": movie_id,
        "action": action,
        "ts": time.time(),
        "payload": payload or {},
    }
    try:
        await run_blocking(_append_event_sync, event)
        kafka_result = await _publish_kafka(event)
        from services.kafka_pipeline import ingest

        extra = payload or {}
        unified = await ingest(
            domain="movie",
            user_id=user_id or "anonymous",
            content_id=movie_id,
            genre=str(extra.get("genre") or extra.get("category") or "International"),
            playback_status=_ACTION_TO_STATUS.get(action, "view"),
            network_bitrate=float(extra.get("network_bitrate") or 0),
            packet_loss_ratio=float(extra.get("packet_loss_ratio") or 0),
            title=str(extra.get("title") or ""),
            extra=extra,
        )
        return {
            "event_id": event["event_id"],
            "kafka": kafka_result,
            "unified_pipeline": unified,
        }
    except Exception as exc:
        logger.warning("movie analytics failed: %s", exc)
        return {"event_id": event["event_id"], "error": str(exc), "kafka": {"ok": False}}


def schedule_movie_event(
    *,
    user_id: str,
    movie_id: str,
    action: str,
    payload: Optional[dict[str, Any]] = None,
) -> None:
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(
            track_movie_event(
                user_id=user_id,
                movie_id=movie_id,
                action=action,
                payload=payload,
            )
        )
    except RuntimeError:
        logger.debug("No loop — skipped movie event %s %s", movie_id, action)


def load_movie_events(max_lines: int = 5000) -> list[dict[str, Any]]:
    if not EVENTS_FILE.is_file():
        return []
    rows: list[dict[str, Any]] = []
    try:
        lines = EVENTS_FILE.read_text(encoding="utf-8").splitlines()
        for line in lines[-max_lines:]:
            if line.strip():
                rows.append(json.loads(line))
    except Exception as exc:
        logger.debug("movie events read: %s", exc)
    return rows
