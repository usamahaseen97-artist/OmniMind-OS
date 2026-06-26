"""
Visionary Studio API — Phase 1 workspace architecture stubs."""



from __future__ import annotations

import logging

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter

from lib.enterprise.dependencies import platform_router_dependencies
from schemas.platform_enterprise import ProjectCreateBody

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/visionary",
    tags=["visionary-studio"],
    dependencies=platform_router_dependencies(),
)

_projects: dict[str, dict[str, Any]] = {
    "proj-visionary-001": {
        "id": "proj-visionary-001",
        "name": "Untitled Creative Project",
        "resolution": {"width": 3840, "height": 2160},
        "fps": 30,
        "duration_frames": 900,
        "modified_at": datetime.now(timezone.utc).isoformat(),
        "saved_at": None,
    }
}


@router.get("/project")
def get_default_project() -> dict[str, Any]:
    """Health probe + default project payload for Visionary Studio."""
    project = next(iter(_projects.values()))
    return {"ok": True, "project": project, "phase": 1}


@router.get("/projects")
def list_projects() -> dict[str, Any]:
    return {"ok": True, "projects": list(_projects.values())}


@router.post("/projects")
def create_project(body: ProjectCreateBody) -> dict[str, Any]:
    pid = f"proj-{uuid4().hex[:12]}"
    payload = body.model_dump()
    project = {
        "id": pid,
        "name": payload.get("name", "Untitled Creative Project"),
        "resolution": payload.get("resolution", {"width": 1920, "height": 1080}),
        "fps": payload.get("fps", 30),
        "duration_frames": payload.get("duration_frames", 900),
        "modified_at": datetime.now(timezone.utc).isoformat(),
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    _projects[pid] = project
    return {"ok": True, "project": project}
