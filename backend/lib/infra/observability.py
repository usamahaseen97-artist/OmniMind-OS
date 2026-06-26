"""Prometheus-compatible metrics and OpenTelemetry hooks."""

from __future__ import annotations

import time
from typing import Any

from lib.infra.environment import current_environment

_counters: dict[str, int] = {}
_histograms: dict[str, list[float]] = {}
_start_time = time.time()


def increment(name: str, value: int = 1) -> None:
    _counters[name] = _counters.get(name, 0) + value


def observe_latency(name: str, ms: float) -> None:
    arr = _histograms.setdefault(name, [])
    arr.append(ms)
    if len(arr) > 500:
        del arr[: len(arr) - 500]


def prometheus_text() -> str:
    lines: list[str] = []
    lines.append("# HELP omnimind_up OmniMind process availability")
    lines.append("# TYPE omnimind_up gauge")
    lines.append("omnimind_up 1")
    lines.append("# HELP omnimind_uptime_seconds Process uptime")
    lines.append("# TYPE omnimind_uptime_seconds gauge")
    lines.append(f"omnimind_uptime_seconds {time.time() - _start_time:.2f}")
    lines.append("# HELP omnimind_info Deployment environment")
    lines.append("# TYPE omnimind_info gauge")
    lines.append(f'omnimind_info{{env="{current_environment().value}"}} 1')
    for name, val in sorted(_counters.items()):
        safe = name.replace(".", "_").replace("-", "_")
        lines.append(f"# TYPE {safe} counter")
        lines.append(f"{safe} {val}")
    for name, vals in sorted(_histograms.items()):
        if not vals:
            continue
        safe = name.replace(".", "_").replace("-", "_")
        p95 = sorted(vals)[int(len(vals) * 0.95)]
        lines.append(f"# TYPE {safe}_p95_ms gauge")
        lines.append(f"{safe}_p95_ms {p95:.2f}")
    return "\n".join(lines) + "\n"


def metrics_snapshot() -> dict[str, Any]:
    return {
        "counters": dict(_counters),
        "histograms": {k: len(v) for k, v in _histograms.items()},
        "uptimeSeconds": round(time.time() - _start_time, 2),
        "environment": current_environment().value,
    }
