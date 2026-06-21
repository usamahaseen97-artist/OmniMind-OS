"""
Map Bloomberg / analytics batches into AR-ready 3D spatial metadata.
"""

from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from services.bloomberg_client import BloombergClient, BloombergSnapshot
from services.finance_pipeline import compute_analytics_preview, spark_readiness
from config import get_settings


def _normalize_price(price: float, lo: float, hi: float) -> float:
    if hi <= lo:
        return 0.5
    return max(0.0, min(1.0, (price - lo) / (hi - lo)))


def build_spatial_overlay(
    snapshot: BloombergSnapshot,
    *,
    analytics: Optional[dict[str, Any]] = None,
    spark: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Convert financial snapshot → 3D entity graph for AR clients."""
    ticks = snapshot.ticks
    prices = [float(t.get("price", 0)) for t in ticks] or [1.0]
    lo, hi = min(prices), max(prices)
    n = max(len(ticks), 1)
    radius = 3.0

    entities: list[dict[str, Any]] = []
    for i, tick in enumerate(ticks):
        angle = (2 * math.pi * i) / n
        norm = _normalize_price(float(tick.get("price", 0)), lo, hi)
        symbol = str(tick.get("symbol", f"asset-{i}"))
        short = symbol.split()[0] if symbol else f"T{i}"

        entities.append(
            {
                "id": f"tick-{short}-{i}",
                "type": "market_tick",
                "symbol": symbol,
                "position": {
                    "x": round(radius * math.cos(angle), 3),
                    "y": round(0.5 + norm * 2.5, 3),
                    "z": round(radius * math.sin(angle), 3),
                },
                "scale": {
                    "x": 1.0,
                    "y": round(0.8 + norm * 1.2, 3),
                    "z": 1.0,
                },
                "rotation": {"x": 0, "y": round(math.degrees(angle), 1), "z": 0},
                "label": short,
                "color": "#22d3ee" if norm >= 0.5 else "#a78bfa",
                "payload": {
                    "price": tick.get("price"),
                    "bid": tick.get("bid"),
                    "ask": tick.get("ask"),
                    "volume": tick.get("volume"),
                    "timestamp": tick.get("timestamp"),
                },
            }
        )

    indicator_entities: list[dict[str, Any]] = []
    for j, ind in enumerate(snapshot.indicators):
        indicator_entities.append(
            {
                "id": f"indicator-{ind.get('name', j)}",
                "type": "financial_indicator",
                "position": {"x": -4.0 + j * 1.2, "y": 3.5, "z": -2.0},
                "scale": {"x": 0.9, "y": 0.9, "z": 0.9},
                "rotation": {"x": 0, "y": 0, "z": 0},
                "label": str(ind.get("name", "indicator")),
                "color": "#34d399",
                "payload": ind,
            }
        )

    trend_entities: list[dict[str, Any]] = []
    if analytics:
        for k, trend in enumerate(analytics.get("trends", [])[:6]):
            ret = float(trend.get("period_return_pct", 0))
            trend_entities.append(
                {
                    "id": f"trend-{trend.get('symbol', k)}",
                    "type": "analytics_trend",
                    "position": {"x": 4.5, "y": 1.0 + k * 0.55, "z": 2.0},
                    "scale": {
                        "x": 1.0,
                        "y": round(0.6 + min(abs(ret) / 10, 2.0), 3),
                        "z": 1.0,
                    },
                    "rotation": {"x": 0, "y": 15 * k, "z": 0},
                    "label": str(trend.get("symbol", "")).split()[0],
                    "color": "#4ade80" if ret >= 0 else "#f87171",
                    "payload": trend,
                }
            )

    spark_status = spark or {"connected": False}
    return {
        "schema": "omnimind.spatial.overlay.v1",
        "scene_id": str(uuid.uuid4()),
        "batch_id": snapshot.batch_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": snapshot.source,
        "bloomberg_mode": get_settings().bloomberg_mode,
        "anchor": {
            "position": {"x": 0, "y": 0, "z": 0},
            "rotation": {"x": 0, "y": 0, "z": 0},
            "label": "OmniMind Finance Hub",
        },
        "entities": entities + indicator_entities + trend_entities,
        "entity_count": len(entities) + len(indicator_entities) + len(trend_entities),
        "analytics_summary": analytics,
        "spark_online": spark_status.get("connected", False),
        "spark": spark_status,
    }


async def fetch_overlay_data(
    *,
    symbols: Optional[list[str]] = None,
    history_days: int = 14,
) -> dict[str, Any]:
    settings = get_settings()
    client = BloombergClient(mode=settings.bloomberg_mode, symbols=symbols)
    snapshot = client.fetch_snapshot(history_days=history_days)
    analytics = compute_analytics_preview(snapshot)
    spark = await spark_readiness()
    overlay = build_spatial_overlay(snapshot, analytics=analytics, spark=spark)
    overlay["finance"] = {
        "tick_count": len(snapshot.ticks),
        "indicator_count": len(snapshot.indicators),
        "history_bars": len(snapshot.history),
    }
    return overlay
