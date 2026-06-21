"""
Async Kafka client (aiokafka) for OmniMind.
Connects to bootstrap servers from KAFKA_BOOTSTRAP_SERVERS (.env).
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

try:
    from aiokafka import AIOKafkaProducer
    from aiokafka.errors import KafkaConnectionError
    _AIOKAFKA_AVAILABLE = True
except ImportError:
    AIOKafkaProducer = None  # type: ignore[misc, assignment]
    KafkaConnectionError = Exception  # type: ignore[misc, assignment]
    _AIOKAFKA_AVAILABLE = False

from config import get_settings

logger = logging.getLogger(__name__)

_producer: Optional[AIOKafkaProducer] = None
_kafka_ready: bool = False


def _bootstrap_list() -> list[str]:
    raw = get_settings().kafka_bootstrap_servers.strip()
    return [s.strip() for s in raw.split(",") if s.strip()]


async def get_producer() -> Optional[AIOKafkaProducer]:
    """Return a started producer, or None if Kafka is unavailable."""
    global _producer, _kafka_ready
    if not _kafka_ready or _producer is None:
        return None
    return _producer


async def init_kafka() -> dict[str, Any]:
    """
    Connect to Kafka with retries (for docker-compose startup).
    Safe to call from FastAPI lifespan — does not raise.
    """
    global _producer, _kafka_ready

    if not _AIOKAFKA_AVAILABLE:
        return {
            "connected": False,
            "reason": "aiokafka not installed",
            "hint": "pip install aiokafka  OR  use STREAMING_LAZY_LOAD=true (default)",
        }

    settings = get_settings()
    servers = _bootstrap_list()
    if not servers:
        return {"connected": False, "reason": "KAFKA_BOOTSTRAP_SERVERS not set"}

    retries = max(1, settings.kafka_connect_retries)
    delay = max(0.5, settings.kafka_connect_retry_seconds)

    last_error: Optional[str] = None
    for attempt in range(1, retries + 1):
        producer = AIOKafkaProducer(
            bootstrap_servers=servers,
            client_id=settings.kafka_client_id,
            acks="all",
        )
        try:
            await producer.start()
            await producer.send_and_wait(
                settings.kafka_events_topic,
                value=b'{"event":"omnimind.bootstrap","status":"ok"}',
            )
            _producer = producer
            _kafka_ready = True
            logger.info(
                "Kafka connected (%s) topic=%s attempt=%s",
                ",".join(servers),
                settings.kafka_events_topic,
                attempt,
            )
            return {
                "connected": True,
                "bootstrap_servers": servers,
                "topic": settings.kafka_events_topic,
                "attempt": attempt,
            }
        except (KafkaConnectionError, OSError, asyncio.TimeoutError) as exc:
            last_error = str(exc)
            try:
                await producer.stop()
            except Exception:
                pass
            logger.debug("Kafka not ready (attempt %s/%s): %s", attempt, retries, exc)
            if attempt < retries:
                await asyncio.sleep(delay)
        except Exception as exc:
            last_error = str(exc)
            try:
                await producer.stop()
            except Exception:
                pass
            logger.warning("Kafka init error: %s", exc)
            break

    _producer = None
    _kafka_ready = False
    return {
        "connected": False,
        "bootstrap_servers": servers,
        "error": last_error or "connection failed",
        "hint": "Run: docker compose up -d  (from project root)",
    }


async def ping_kafka(*, retry: bool = False) -> dict[str, Any]:
    """Health check. Set retry=True to attempt a full reconnect (startup / manual)."""
    if _kafka_ready and _producer is not None:
        return {
            "connected": True,
            "bootstrap_servers": _bootstrap_list(),
            "topic": get_settings().kafka_events_topic,
        }
    if not retry:
        return {
            "connected": False,
            "bootstrap_servers": _bootstrap_list(),
            "hint": "Run: docker compose up -d",
        }
    return await init_kafka()


async def publish_event(payload: bytes, topic: Optional[str] = None) -> dict[str, Any]:
    """Publish a message to Kafka."""
    producer = await get_producer()
    if producer is None:
        from services.process_utils import docker_executable

        if not docker_executable():
            return {
                "ok": False,
                "simulated": True,
                "error": "Kafka unavailable (Docker CLI not installed)",
            }
        status = await init_kafka()
        if not status.get("connected"):
            return {"ok": False, **status}
        producer = await get_producer()
    if producer is None:
        return {"ok": False, "error": "Kafka producer unavailable"}

    settings = get_settings()
    target = topic or settings.kafka_events_topic
    meta = await producer.send_and_wait(target, value=payload)
    return {"ok": True, "topic": target, "partition": meta.partition, "offset": meta.offset}


async def close_kafka() -> None:
    """Stop producer on app shutdown."""
    global _producer, _kafka_ready
    if _producer is not None:
        try:
            await _producer.stop()
        except Exception as exc:
            logger.debug("Kafka producer stop: %s", exc)
    _producer = None
    _kafka_ready = False
