"""
Unified Kafka ingestion for OmniMovies, OmniMusic, and OmniTV telemetry.

Topics: movie-events, music-events, tv-events
Each event: user_id, content_id, genre, playback_status, network_bitrate, packet_loss_ratio
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from collections import deque
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Literal, Optional

from config import get_settings
from services import kafka_bus
from services.process_utils import docker_executable

logger = logging.getLogger(__name__)

Domain = Literal["movie", "music", "tv"]
PlaybackStatus = Literal["play", "pause", "skip", "stop", "click", "view", "buffer"]

TOPIC_BY_DOMAIN: dict[Domain, str] = {
    "movie": "movie-events",
    "music": "music-events",
    "tv": "tv-events",
}

DATA_ROOT = Path(__file__).resolve().parent.parent / "data" / "kafka_pipeline"
_RING: dict[str, deque[dict[str, Any]]] = {
    t: deque(maxlen=8000) for t in TOPIC_BY_DOMAIN.values()
}


@dataclass
class TelemetryEvent:
    user_id: str
    content_id: str
    genre: str
    playback_status: str
    network_bitrate: float = 0.0
    packet_loss_ratio: float = 0.0
    domain: str = "movie"
    timestamp: float = field(default_factory=time.time)
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    extra: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        row = asdict(self)
        domain_key = self.domain if self.domain in TOPIC_BY_DOMAIN else "movie"
        row["topic"] = TOPIC_BY_DOMAIN[domain_key]  # type: ignore[index]
        return row


def _topic_for(domain: Domain) -> str:
    settings = get_settings()
    if domain == "movie":
        return settings.kafka_movie_events_topic
    if domain == "music":
        return settings.kafka_music_events_topic
    return settings.kafka_tv_events_topic


def _append_jsonl(topic: str, event: dict[str, Any]) -> None:
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    safe = topic.replace("/", "-")
    path = DATA_ROOT / f"{safe}.jsonl"
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, default=str) + "\n")


def _ring_push(topic: str, event: dict[str, Any]) -> None:
    buf = _RING.setdefault(topic, deque(maxlen=8000))
    buf.append(event)


def _tail_jsonl(path: Path, max_lines: int) -> list[dict[str, Any]]:
    """Read only the last N lines of a JSONL file (avoid loading huge files)."""
    chunk = 65536
    try:
        size = path.stat().st_size
        if size == 0:
            return []
        with path.open("rb") as handle:
            handle.seek(max(0, size - chunk))
            if size > chunk:
                handle.readline()
            text = handle.read().decode("utf-8", errors="replace")
        out: list[dict[str, Any]] = []
        for line in text.splitlines()[-max_lines:]:
            if line.strip():
                out.append(json.loads(line))
        return out
    except Exception as exc:
        logger.debug("kafka jsonl tail %s: %s", path, exc)
        return []


def load_topic_events(topic: str, *, max_lines: int = 5000) -> list[dict[str, Any]]:
    """Load persisted + in-memory events (Spark consumer simulation)."""
    rows: list[dict[str, Any]] = list(_RING.get(topic, []))
    path = DATA_ROOT / f"{topic.replace('/', '-')}.jsonl"
    if path.is_file():
        rows.extend(_tail_jsonl(path, max_lines))
    return rows[-max_lines:]


async def publish_telemetry(event: TelemetryEvent) -> dict[str, Any]:
    """Publish to Kafka topic; always mirror to in-memory stream + JSONL."""
    domain = event.domain if event.domain in TOPIC_BY_DOMAIN else "movie"
    topic = _topic_for(domain)  # type: ignore
    payload = event.to_dict()
    payload["topic"] = topic

    _ring_push(topic, payload)
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _append_jsonl, topic, payload)

    ping = await kafka_bus.ping_kafka(retry=False)
    if ping.get("connected"):
        result = await kafka_bus.publish_event(json.dumps(payload).encode("utf-8"), topic=topic)
        return {"topic": topic, "event_id": event.event_id, **result}

    if not docker_executable():
        return {
            "ok": False,
            "simulated": True,
            "topic": topic,
            "event_id": event.event_id,
            "error": "Kafka offline — event buffered in-memory + JSONL",
        }

    try:
        from services.streaming_orchestrator import ensure_service_active

        boot = await ensure_service_active("kafka")
        if not boot.get("ready"):
            return {
                "ok": False,
                "simulated": True,
                "topic": topic,
                "event_id": event.event_id,
                "error": boot.get("error", "kafka not ready"),
            }
        result = await kafka_bus.publish_event(json.dumps(payload).encode("utf-8"), topic=topic)
        return {"topic": topic, "event_id": event.event_id, **result}
    except (FileNotFoundError, OSError) as exc:
        return {
            "ok": False,
            "simulated": True,
            "topic": topic,
            "event_id": event.event_id,
            "error": str(exc),
        }


def schedule_telemetry(event: TelemetryEvent) -> None:
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(publish_telemetry(event))
    except RuntimeError:
        logger.debug("No event loop — telemetry skipped %s", event.content_id)


async def ingest(
    *,
    domain: Domain,
    user_id: str,
    content_id: str,
    genre: str,
    playback_status: PlaybackStatus | str,
    network_bitrate: float = 0.0,
    packet_loss_ratio: float = 0.0,
    title: str = "",
    extra: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    ev = TelemetryEvent(
        user_id=user_id or "anonymous",
        content_id=content_id,
        genre=genre or "General",
        playback_status=str(playback_status),
        network_bitrate=float(network_bitrate or 0),
        packet_loss_ratio=float(packet_loss_ratio or 0),
        domain=domain,
        title=title,
        extra=extra or {},
    )
    return await publish_telemetry(ev)
