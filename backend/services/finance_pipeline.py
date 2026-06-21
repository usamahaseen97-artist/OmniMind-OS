"""
Route Bloomberg snapshots → Kafka, on-disk batches (Spark), and analytics preview.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Optional

from config import get_settings
from services import kafka_bus, spark_client
from services.bloomberg_client import BloombergClient, BloombergSnapshot
from services.infra_pool import run_blocking
from services.streaming_orchestrator import ensure_service_active, touch_activity

logger = logging.getLogger(__name__)

FINANCE_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "finance"


def _ensure_data_dir() -> Path:
    FINANCE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    return FINANCE_DATA_DIR


def persist_snapshot(snapshot: BloombergSnapshot) -> str:
    """Write JSON batch for Spark jobs / regression pipelines."""
    directory = _ensure_data_dir()
    path = directory / f"{snapshot.batch_id}.json"
    payload = snapshot.to_dict()
    payload["spark_records"] = snapshot.to_spark_records()
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return str(path)


async def publish_to_kafka(snapshot: BloombergSnapshot) -> dict[str, Any]:
    touch_activity("kafka")
    boot = await ensure_service_active("kafka")
    if not boot.get("ready"):
        return {"ok": False, "error": boot.get("error", "kafka not ready"), **boot}
    settings = get_settings()
    topic = settings.kafka_finance_topic
    payload = json.dumps(snapshot.to_dict()).encode("utf-8")
    result = await kafka_bus.publish_event(payload, topic=topic)
    return {"topic": topic, **result}


def compute_analytics_preview(snapshot: BloombergSnapshot) -> dict[str, Any]:
    """Lightweight trend/regression hints (full Spark job can consume batch file)."""
    by_symbol: dict[str, list[float]] = {}
    for bar in snapshot.history:
        sym = bar.get("symbol", "")
        by_symbol.setdefault(sym, []).append(float(bar.get("close", 0)))

    trends = []
    for sym, closes in by_symbol.items():
        if len(closes) < 2:
            continue
        first, last = closes[0], closes[-1]
        pct = ((last - first) / first * 100) if first else 0
        trends.append(
            {
                "symbol": sym,
                "period_return_pct": round(pct, 2),
                "last_close": last,
                "bars": len(closes),
            }
        )

    ticks = snapshot.ticks
    return {
        "symbol_count": len(snapshot.symbols),
        "tick_count": len(ticks),
        "indicator_count": len(snapshot.indicators),
        "history_bars": len(snapshot.history),
        "trends": sorted(trends, key=lambda x: x["period_return_pct"], reverse=True),
        "sample_tick": ticks[0] if ticks else None,
    }


async def spark_readiness() -> dict[str, Any]:
    return await spark_client.ping_spark_async()


async def run_mock_financial_stream(
    *,
    symbols: Optional[list[str]] = None,
    stream_batches: int = 3,
    history_days: int = 14,
) -> dict[str, Any]:
    """
    Full pipeline test: mock Bloomberg → disk → Kafka → analytics + Spark status.
    """
    settings = get_settings()
    client = BloombergClient(mode=settings.bloomberg_mode, symbols=symbols)

    snapshots = client.stream_ticks(batches=stream_batches)
    paths: list[str] = []
    kafka_results: list[dict] = []
    analytics_batches: list[dict] = []

    touch_activity("spark")

    def _process_batch(snap: BloombergSnapshot) -> tuple[str, dict]:
        path = persist_snapshot(snap)
        analytics = compute_analytics_preview(snap)
        return path, analytics

    for snap in snapshots:
        path, analytics = await run_blocking(_process_batch, snap)
        paths.append(path)
        kafka_results.append(await publish_to_kafka(snap))
        analytics_batches.append(analytics)

    await ensure_service_active("spark")
    spark_status = await spark_readiness()
    primary = snapshots[-1] if snapshots else client.fetch_snapshot(history_days=history_days)

    return {
        "success": True,
        "mode": settings.bloomberg_mode,
        "batch_count": len(snapshots),
        "latest_batch_id": primary.batch_id,
        "data_paths": paths,
        "kafka": kafka_results,
        "analytics": analytics_batches,
        "spark": spark_status,
        "frontend_payload": {
            "message": "Bloomberg mock stream processed",
            "latest": {
                "batch_id": primary.batch_id,
                "ticks": primary.ticks[:5],
                "indicators": primary.indicators,
                "trends": analytics_batches[-1]["trends"][:5] if analytics_batches else [],
            },
            "spark_online": spark_status.get("connected", False),
            "kafka_published": all(k.get("ok") for k in kafka_results),
        },
    }
