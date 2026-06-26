"""In-process metrics for API reliability monitoring."""

from __future__ import annotations

from typing import Any

_counters: dict[str, int] = {}
_latencies: dict[str, list[float]] = {}


def increment(metric: str, value: int = 1) -> None:
    _counters[metric] = _counters.get(metric, 0) + value


def record_latency(metric: str, ms: float) -> None:
    arr = _latencies.setdefault(metric, [])
    arr.append(ms)
    if len(arr) > 200:
        del arr[0]


def snapshot() -> dict[str, Any]:
    return {
        "counters": dict(_counters),
        "latencies": {k: {"count": len(v), "p95": sorted(v)[int(len(v) * 0.95)] if v else None} for k, v in _latencies.items()},
    }
