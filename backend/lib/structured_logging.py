"""Structured JSON logging for OmniMind backend services."""

from __future__ import annotations

import json
import logging
import sys
import time
from typing import Any


class StructuredFormatter(logging.Formatter):
    """Emit one JSON object per log line for log aggregators."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(record.created)),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        for key in ("request_id", "path", "method", "duration_ms", "status"):
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        return json.dumps(payload, default=str)


def configure_structured_logging(level: int = logging.INFO) -> None:
    """Attach JSON formatter to root handler if not already configured."""
    root = logging.getLogger()
    if root.handlers:
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    root.addHandler(handler)
    root.setLevel(level)


_metrics: dict[str, float] = {}


def record_metric(name: str, value: float = 1.0) -> None:
    """Delegate to unified observability counters."""
    from lib.infra.observability import increment

    increment(name, int(value))


def snapshot_metrics() -> dict[str, float]:
    from lib.infra.observability import metrics_snapshot

    snap = metrics_snapshot()
    return {k: float(v) for k, v in (snap.get("counters") or {}).items()}
