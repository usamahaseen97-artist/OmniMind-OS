"""Mission Control aggregator — unified OS dashboard data."""

from __future__ import annotations

import os
import shutil
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from lib.infra.observability import metrics_snapshot
from lib.omnicore_store import append_list_item, load, load_list, save, status as store_status
from lib.automation.executor import list_executions, compute_metrics as automation_metrics

LOGS_KEY = "mission_control_logs"
TERMINALS_KEY = "mission_control_terminals"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def system_snapshot() -> dict[str, Any]:
    disk = shutil.disk_usage(os.getcwd())
    metrics = metrics_snapshot()
    bg_agents = load_list("ecosystem_background_agents")
    ai_history = load_list("ai_request_history")
    return {
        "cpuPercent": None,
        "gpuPercent": None,
        "ramUsedMb": None,
        "ramTotalMb": None,
        "storageUsedGb": round(disk.used / (1024**3), 2),
        "storageTotalGb": round(disk.total / (1024**3), 2),
        "networkMbps": None,
        "backgroundTasks": len([j for j in bg_agents if j.get("status") in ("queued", "running")]),
        "runningProcesses": os.getpid(),
        "sdk": "online",
        "api": "online",
        "database": "online" if store_status().get("mongo") else "degraded",
        "gateway": "online" if ai_history else "unknown",
        "aiProviders": [{"id": "auto", "status": "online"}],
        "plugins": [],
        "cloud": "online",
        "updatedAt": _now(),
    }


def security_snapshot() -> dict[str, Any]:
    events = load_list("security_events") if load_list("security_events") else []
    return {
        "threats": len([e for e in events if e.get("severity") in ("high", "critical")]),
        "permissionRequests": 0,
        "pluginAccessEvents": 0,
        "apiUsageCount": len(load_list("ai_request_history")),
        "failedLogins": len([e for e in events if e.get("kind") == "failed_login"]),
        "events": events[:20],
        "auditLogs": load_list("audit_logs")[:20],
    }


def background_jobs() -> list[dict[str, Any]]:
    jobs: list[dict[str, Any]] = []
    for j in load_list("ecosystem_background_agents"):
        jobs.append(
            {
                "id": j.get("id", ""),
                "kind": j.get("kind", "automation"),
                "label": j.get("label", ""),
                "status": j.get("status", "queued"),
                "progress": j.get("progress", 0),
                "toolSlug": j.get("toolSlug", ""),
                "startedAt": j.get("createdAt", _now()),
            }
        )
    for ex in list_executions()[:10]:
        if ex.get("status") in ("queued", "running"):
            jobs.append(
                {
                    "id": ex.get("id", ""),
                    "kind": "automation",
                    "label": f"Workflow {ex.get('workflowId', '')}",
                    "status": ex.get("status", ""),
                    "progress": ex.get("progress", 0),
                    "toolSlug": "automation-engine",
                    "startedAt": ex.get("startedAt", _now()),
                }
            )
    return jobs


def append_log(source: str, message: str, level: str = "info") -> dict[str, Any]:
    entry = {"id": f"log-{uuid4().hex[:8]}", "source": source, "level": level, "message": message, "at": _now()}
    append_list_item(LOGS_KEY, entry, max_items=1000)
    line = {"id": f"term-{uuid4().hex[:8]}", "terminal": source if source in ("backend", "ai", "gateway") else "backend", "text": message, "level": level, "at": _now()}
    append_list_item(TERMINALS_KEY, line, max_items=500)
    return entry


def list_logs(source: str | None = None) -> list[dict[str, Any]]:
    logs = load_list(LOGS_KEY)
    if source:
        return [l for l in logs if l.get("source") == source]
    return logs


def list_terminals() -> list[dict[str, Any]]:
    return load_list(TERMINALS_KEY)


def analytics_series() -> list[dict[str, Any]]:
    metrics = automation_metrics()
    now = datetime.now(timezone.utc)
    base = metrics.get("totalExecutions", 0)
    points = []
    for i in range(12):
        t = now.isoformat()
        points.append({"t": t, "v": max(0, base - i)})
    return [
        {"label": "Performance", "points": points},
        {"label": "AI Usage", "points": points},
        {"label": "Automation", "points": [{"t": now.isoformat(), "v": int(metrics.get("successRate", 0) * 100)}]},
    ]


def health_scores() -> dict[str, Any]:
    auto = automation_metrics()
    infra = store_status()
    performance = 88 if infra.get("mongo") else 62
    security = 85
    reliability = int(auto.get("successRate", 0.8) * 100)
    ai = 82
    infrastructure = 90 if infra.get("mongo") else 55
    overall = round((performance + security + reliability + ai + infrastructure) / 5)
    return {
        "overall": overall,
        "performance": performance,
        "security": security,
        "reliability": reliability,
        "ai": ai,
        "infrastructure": infrastructure,
    }


def full_dashboard() -> dict[str, Any]:
    projects = load("platform_projects", [])
    project_rows = []
    if isinstance(projects, list):
        for p in projects[:12]:
            project_rows.append(
                {
                    "projectId": p.get("id", ""),
                    "name": p.get("name", ""),
                    "progress": min(100, int(p.get("version", 1) * 15)),
                    "healthScore": health_scores()["overall"],
                    "errors": 0,
                    "warnings": 0,
                    "deploymentStatus": "pending",
                    "assetCount": 0,
                    "memoryEntries": 0,
                    "aiContextPreview": "",
                }
            )
    return {
        "system": system_snapshot(),
        "workspace": {"activeProjectId": None, "toolCount": len(projects) if isinstance(projects, list) else 0, "sessionId": None},
        "projects": project_rows,
        "ai": {"agents": [], "requestCount": len(load_list("ai_request_history")), "latencyP50": 120},
        "cloud": {"syncEnabled": True, "lastSyncAt": None, "status": "online"},
        "security": security_snapshot(),
        "health": health_scores(),
        "backgroundJobs": background_jobs(),
        "resources": {
            "cpuPercent": None,
            "gpuPercent": None,
            "memoryMb": None,
            "diskGb": system_snapshot()["storageUsedGb"],
            "bandwidthMbps": None,
            "modelUsage": {"requests": len(load_list("ai_request_history"))},
            "tokenUsage": 0,
            "aiCostUsd": 0,
            "cacheHitRate": None,
            "workers": system_snapshot()["runningProcesses"],
        },
        "quickActions": [
            {"id": "qa-sync", "label": "Sync", "action": "sync"},
            {"id": "qa-diag", "label": "Run Diagnostics", "action": "diagnostics"},
        ],
    }
