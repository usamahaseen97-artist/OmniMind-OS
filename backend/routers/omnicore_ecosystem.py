"""
OmniCore Ecosystem OS API — dashboard, activity, system metrics, background agents."""



from __future__ import annotations

import logging

import os
import shutil
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter

from lib.enterprise.dependencies import platform_router_dependencies
from lib.infra.observability import metrics_snapshot
from lib.omnicore_store import append_list_item, load, load_list, save
from schemas.platform_enterprise import ActivityBody, BackgroundJobBody, SidebarSaveBody

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/ecosystem",
    tags=["omnicore-ecosystem"],
    dependencies=platform_router_dependencies(),
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _system_snapshot() -> dict[str, Any]:
    disk = shutil.disk_usage(os.getcwd())
    used_gb = round(disk.used / (1024**3), 2)
    total_gb = round(disk.total / (1024**3), 2)
    ai_history = load_list("ai_request_history")
    bg_jobs = load_list("ecosystem_background_agents")
    metrics = metrics_snapshot()

    return {
        "cpuPercent": None,
        "gpuPercent": None,
        "ramUsedMb": None,
        "ramTotalMb": None,
        "storageUsedGb": used_gb,
        "storageTotalGb": total_gb,
        "networkMbps": None,
        "aiTokensToday": sum(int(h.get("tokenCount", 0)) for h in ai_history),
        "providerUsage": {"requests": len(ai_history)},
        "runningModels": ["auto"],
        "workers": len([j for j in bg_jobs if j.get("status") == "running"]),
        "processes": os.getpid(),
        "renderQueue": len([j for j in bg_jobs if j.get("kind") == "video" and j.get("status") == "queued"]),
        "videoQueue": len([j for j in bg_jobs if j.get("kind") == "video"]),
        "audioQueue": len([j for j in bg_jobs if j.get("kind") == "music"]),
        "uptimeSeconds": metrics.get("uptimeSeconds", 0),
    }


@router.get("/dashboard")
def ecosystem_dashboard() -> dict[str, Any]:
    projects = load("platform_projects", [])
    activity = load_list("ecosystem_activity")[:20]
    bg_jobs = load_list("ecosystem_background_agents")
    ai_tasks = load_list("ai_tasks")
    return {
        "ok": True,
        "dashboard": {
            "runningTasks": [t for t in ai_tasks if t.get("status") in ("queued", "running")][:10],
            "backgroundJobs": [j for j in bg_jobs if j.get("status") in ("queued", "running")][:10],
            "projectCount": len(projects) if isinstance(projects, list) else 0,
            "activityCount": len(activity),
        },
    }


@router.get("/system")
def ecosystem_system() -> dict[str, Any]:
    return {"ok": True, "system": _system_snapshot()}


@router.get("/activity")
def list_activity() -> dict[str, Any]:
    return {"ok": True, "items": load_list("ecosystem_activity")}


@router.post("/activity")
def push_activity(body: ActivityBody) -> dict[str, Any]:
    payload = body.model_dump()
    item = {
        "id": f"act-{uuid4().hex[:8]}",
        "kind": payload.get("kind", "system"),
        "title": payload.get("title", ""),
        "detail": payload.get("detail"),
        "progress": payload.get("progress"),
        "status": payload.get("status", "running"),
        "toolSlug": payload.get("toolSlug"),
        "createdAt": _now(),
        "updatedAt": _now(),
    }
    append_list_item("ecosystem_activity", item, max_items=500)
    return {"ok": True, "item": item}


@router.get("/background-agents")
def list_background_agents() -> dict[str, Any]:
    return {"ok": True, "jobs": load_list("ecosystem_background_agents")}


@router.post("/background-agents")
def enqueue_background_agent(body: BackgroundJobBody) -> dict[str, Any]:
    payload = body.model_dump()
    job = {
        "id": f"bg-{uuid4().hex[:8]}",
        "kind": payload.get("kind", "code"),
        "label": payload.get("label", "Background job"),
        "toolSlug": payload.get("toolSlug", "omnimind"),
        "status": "queued",
        "progress": 0,
        "detached": bool(payload.get("detached", True)),
        "createdAt": _now(),
        "updatedAt": _now(),
    }
    append_list_item("ecosystem_background_agents", job, max_items=200)
    return {"ok": True, "job": job}


@router.get("/ai-tasks")
def list_ai_tasks() -> dict[str, Any]:
    tasks = load_list("ai_tasks")
    history = load_list("ai_request_history")
    merged = tasks + [
        {
            "id": h.get("id", f"req-{i}"),
            "label": h.get("prompt", "AI request")[:80],
            "status": "completed" if h.get("status") == "success" else "failed",
            "progress": 100,
            "toolSlug": h.get("toolSlug"),
            "createdAt": h.get("timestamp", _now()),
            "updatedAt": h.get("timestamp", _now()),
            "retryCount": 0,
            "exportable": True,
        }
        for i, h in enumerate(history[:30])
    ]
    return {"ok": True, "tasks": merged[:100]}


@router.get("/notifications")
def list_notifications() -> dict[str, Any]:
    return {"ok": True, "notifications": load_list("ecosystem_notifications")}


@router.get("/sidebar")
def load_sidebar() -> dict[str, Any]:
    return {"ok": True, "pins": load("ecosystem_sidebar_pins", [])}


@router.put("/sidebar")
def save_sidebar(body: SidebarSaveBody) -> dict[str, Any]:
    save("ecosystem_sidebar_pins", body.pins)
    return {"ok": True}
