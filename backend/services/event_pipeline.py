"""
Kafka + Spark event fan-out with async MongoDB audit log (non-blocking).
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any, Optional

logger = logging.getLogger(__name__)

_memory_events: list[dict[str, Any]] = []
_MEMORY_CAP = 500


async def publish_omnimind_event(
    user_id: str,
    event_type: str,
    payload: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Publish to Kafka when available; always queue Mongo log + in-memory sim."""
    body = {
        "event": event_type,
        "user_id": user_id,
        "ts": time.time(),
        "payload": payload or {},
    }
    encoded = json.dumps(body, default=str).encode("utf-8")

    kafka_result: dict[str, Any] = {"ok": False, "simulated": True}
    try:
        from services import kafka_bus

        kafka_result = await kafka_bus.publish_event(encoded)
        if not kafka_result.get("ok"):
            kafka_result["simulated"] = True
            _memory_events.append(body)
            if len(_memory_events) > _MEMORY_CAP:
                _memory_events.pop(0)
    except Exception as exc:
        logger.debug("Kafka publish skipped: %s", exc)
        _memory_events.append(body)

    asyncio.create_task(_log_event_mongo(user_id, event_type, body))

    return {"kafka": kafka_result, "queued_mongo": True}


async def _log_event_mongo(user_id: str, event_type: str, body: dict[str, Any]) -> None:
    try:
        from services.mongo_async import get_async_database

        db = await get_async_database()
        if db is None:
            return
        await db["event_audit"].insert_one(
            {
                "user_id": user_id,
                "event_type": event_type,
                "body": body,
                "created_at": time.time(),
            }
        )
    except Exception as exc:
        logger.debug("Mongo event log skipped: %s", exc)


def recent_simulated_events(limit: int = 20) -> list[dict[str, Any]]:
    return list(_memory_events[-limit:])
