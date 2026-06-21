"""
Entertainment telemetry — Kafka event bus + on-disk batches for Apache Spark analytics.

Used by OmniMusic, OmniStream, OmniTV, and OmniCharge when users search, play, or pay.
Kafka/Spark start on-demand via streaming_orchestrator (docker compose).
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
from services import kafka_bus, spark_client
from services.infra_pool import run_blocking
from services.process_utils import docker_executable
from services.streaming_orchestrator import ensure_service_active, touch_activity

logger = logging.getLogger(__name__)

ENTERTAINMENT_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "entertainment"
_recent_events: list[dict[str, Any]] = []
_RECENT_CAP = 1000


def _ensure_data_dir() -> Path:
    ENTERTAINMENT_DATA_DIR.mkdir(parents=True, exist_ok=True)
    return ENTERTAINMENT_DATA_DIR


def _append_recent(event: dict[str, Any]) -> None:
    _recent_events.append(event)
    if len(_recent_events) > _RECENT_CAP:
        del _recent_events[: len(_recent_events) - _RECENT_CAP]


def _persist_event_line(event: dict[str, Any]) -> str:
    directory = _ensure_data_dir()
    day = time.strftime("%Y%m%d")
    path = directory / f"events_{day}.jsonl"
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, default=str) + "\n")
    return str(path)


async def publish_to_kafka(event: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    topic = settings.kafka_entertainment_topic
    payload = json.dumps(event, default=str).encode("utf-8")

    ping = await kafka_bus.ping_kafka(retry=False)
    if ping.get("connected"):
        touch_activity("kafka")
        result = await kafka_bus.publish_event(payload, topic=topic)
        return {"topic": topic, **result}

    if not docker_executable():
        return {
            "ok": False,
            "simulated": True,
            "topic": topic,
            "error": "Docker not installed - event saved to JSONL only",
        }

    touch_activity("kafka")
    try:
        boot = await ensure_service_active("kafka")
    except (FileNotFoundError, OSError) as exc:
        logger.debug("Kafka docker bootstrap skipped: %s", exc)
        return {"ok": False, "simulated": True, "topic": topic, "error": str(exc)}

    if not boot.get("ready"):
        return {
            "ok": False,
            "simulated": True,
            "topic": topic,
            "error": boot.get("error", "kafka not ready"),
        }

    result = await kafka_bus.publish_event(payload, topic=topic)
    return {"topic": topic, **result}


async def track_entertainment_event(
    module: str,
    action: str,
    *,
    user_id: str = "anonymous",
    payload: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Record event → JSONL batch (Spark) + Kafka topic + in-memory ring buffer."""
    event = {
        "event_id": str(uuid.uuid4()),
        "module": module,
        "action": action,
        "user_id": user_id,
        "ts": time.time(),
        "payload": payload or {},
    }
    _append_recent(event)

    try:
        path = await run_blocking(_persist_event_line, event)
        kafka_result = await publish_to_kafka(event)
        return {"event_id": event["event_id"], "batch_path": path, "kafka": kafka_result}
    except Exception as exc:
        logger.warning(
            "Entertainment telemetry failed for %s.%s: %s",
            module,
            action,
            exc,
        )
        return {
            "event_id": event["event_id"],
            "error": str(exc),
            "kafka": {"ok": False, "simulated": True},
        }


def schedule_entertainment_event(
    module: str,
    action: str,
    *,
    user_id: str = "anonymous",
    payload: Optional[dict[str, Any]] = None,
) -> None:
    """Fire-and-forget from sync route handlers (non-blocking)."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(
            track_entertainment_event(module, action, user_id=user_id, payload=payload)
        )
    except RuntimeError:
        logger.debug("No event loop — skipped entertainment telemetry %s.%s", module, action)


def compute_trending_preview(limit: int = 10) -> dict[str, Any]:
    """Lightweight aggregation without Spark (always available)."""
    counts: dict[str, int] = {}
    modules: dict[str, int] = {}
    for ev in _recent_events:
        key = f"{ev.get('module')}:{ev.get('action')}"
        counts[key] = counts.get(key, 0) + 1
        mod = str(ev.get("module") or "unknown")
        modules[mod] = modules.get(mod, 0) + 1

    top_actions = sorted(counts.items(), key=lambda x: -x[1])[:limit]
    return {
        "event_count": len(_recent_events),
        "modules": modules,
        "top_actions": [{"key": k, "count": c} for k, c in top_actions],
    }


def _load_jsonl_events(max_files: int = 7) -> list[dict[str, Any]]:
    directory = _ensure_data_dir()
    paths = sorted(directory.glob("events_*.jsonl"), reverse=True)[:max_files]
    rows: list[dict[str, Any]] = []
    for path in paths:
        try:
            for line in path.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    rows.append(json.loads(line))
        except Exception as exc:
            logger.debug("Skip batch %s: %s", path, exc)
    return rows


def _spark_aggregate_sync() -> dict[str, Any]:
    """PySpark group-by when JVM available; else Python fallback."""
    rows = _load_jsonl_events()
    if not rows:
        return {"success": True, "engine": "none", "rows": 0, "trends": []}

    try:
        spark = spark_client.get_spark_session()
        df = spark.createDataFrame(rows)
        from pyspark.sql import functions as F

        grouped = (
            df.groupBy("module", "action")
            .count()
            .orderBy(F.desc("count"))
            .limit(20)
            .collect()
        )
        trends = [
            {"module": r["module"], "action": r["action"], "count": int(r["count"])}
            for r in grouped
        ]
        return {
            "success": True,
            "engine": "pyspark",
            "rows": len(rows),
            "trends": trends,
        }
    except Exception as exc:
        logger.info("Spark job fallback to Python: %s", exc)
        counts: dict[tuple[str, str], int] = {}
        for ev in rows:
            key = (str(ev.get("module")), str(ev.get("action")))
            counts[key] = counts.get(key, 0) + 1
        trends = [
            {"module": m, "action": a, "count": c}
            for (m, a), c in sorted(counts.items(), key=lambda x: -x[1])[:20]
        ]
        return {
            "success": True,
            "engine": "python",
            "rows": len(rows),
            "trends": trends,
            "spark_note": str(exc),
        }


async def run_spark_entertainment_analytics() -> dict[str, Any]:
    touch_activity("spark")
    await ensure_service_active("spark")
    spark_status = await spark_client.ping_spark_async()
    result = await run_blocking(_spark_aggregate_sync)
    preview = compute_trending_preview()
    return {
        "spark": spark_status,
        "analytics": result,
        "live_preview": preview,
    }


def recent_events(limit: int = 50) -> list[dict[str, Any]]:
    return list(_recent_events[-limit:])
