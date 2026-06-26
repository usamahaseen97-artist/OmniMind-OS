"""Security audit event storage."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

_events: list[dict[str, Any]] = []


def record_security_event(
    *,
    kind: str,
    severity: str,
    actor_id: str | None,
    resource: str,
    detail: str,
    ip: str | None = None,
) -> dict[str, Any]:
    evt = {
        "id": f"sec-{uuid4().hex[:12]}",
        "kind": kind,
        "severity": severity,
        "actorId": actor_id,
        "resource": resource,
        "detail": detail,
        "ip": ip,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _events.insert(0, evt)
    if len(_events) > 5000:
        _events.pop()
    return evt


def list_events(limit: int = 100) -> list[dict[str, Any]]:
    return _events[:limit]


def threat_dashboard() -> dict[str, Any]:
    failed = [e for e in _events if e.get("kind") == "failed_login"]
    denied = [e for e in _events if e.get("kind") == "permission_denied"]
    anomalies = [e for e in _events if e.get("kind") == "anomaly"]
    return {
        "totalEvents": len(_events),
        "failedLogins": len(failed),
        "permissionViolations": len(denied),
        "anomalies": len(anomalies),
        "critical": len([e for e in _events if e.get("severity") == "critical"]),
    }
