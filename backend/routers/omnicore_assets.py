"""
OmniCore Assets Platform API — Phase 3 project, asset & storage stubs."""



from __future__ import annotations

import logging

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Query

from lib.enterprise.dependencies import platform_router_dependencies
from schemas.platform_enterprise import (
    AssetSaveBody,
    BackupCreateBody,
    ItemsSaveBody,
    ProjectCreateBody,
    ProjectsSaveBody,
    SearchIndexBody,
    VersionSaveBody,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/assets",
    tags=["omnicore-assets"],
    dependencies=platform_router_dependencies(),
)

_projects: list[dict[str, Any]] = [
    {
        "id": "uproj-001",
        "name": "OmniMind Launch",
        "kind": "cross-tool",
        "toolSlugs": ["visionary-studio", "omnimusic"],
        "archived": False,
        "version": 1,
    }
]
_assets: list[dict[str, Any]] = [
    {"id": "asset-1", "name": "hero-banner.png", "kind": "image", "projectId": "uproj-001", "favorite": True},
    {"id": "asset-2", "name": "launch-track.wav", "kind": "audio", "projectId": "uproj-001", "favorite": False},
]
_search_index: list[dict[str, Any]] = []
_versions: dict[str, list[dict[str, Any]]] = {}
_backups: list[dict[str, Any]] = []


@router.get("/projects")
def list_projects() -> dict[str, Any]:
    return {"ok": True, "projects": _projects}


@router.put("/projects")
def save_projects(body: ProjectsSaveBody) -> dict[str, Any]:
    global _projects
    _projects = body.projects
    return {"ok": True}


@router.post("/projects")
def create_project(body: ProjectCreateBody) -> dict[str, Any]:
    payload = body.model_dump()
    payload.setdefault("id", f"uproj-{uuid4().hex[:8]}")
    _projects.insert(0, payload)
    return {"ok": True, "project": payload}


@router.get("/assets")
def list_assets(projectId: str | None = Query(None)) -> dict[str, Any]:
    assets = _assets if not projectId else [a for a in _assets if a.get("projectId") == projectId]
    return {"ok": True, "assets": assets}


@router.post("/assets")
def save_asset(body: AssetSaveBody) -> dict[str, Any]:
    payload = body.model_dump()
    payload.setdefault("id", f"asset-{uuid4().hex[:8]}")
    _assets.insert(0, payload)
    return {"ok": True, "asset": payload}


@router.get("/search")
def search_assets(q: str = Query("")) -> dict[str, Any]:
    query = q.lower()
    results = [a for a in _assets if query in a.get("name", "").lower()] if query else _assets
    return {"ok": True, "results": results}


@router.put("/search/index")
def update_index(body: SearchIndexBody) -> dict[str, Any]:
    global _search_index
    _search_index = body.items
    return {"ok": True}


@router.get("/versions/{target_id}")
def list_versions(target_id: str) -> dict[str, Any]:
    return {"ok": True, "versions": _versions.get(target_id, [])}


@router.post("/versions")
def save_version(body: VersionSaveBody) -> dict[str, Any]:
    payload = body.model_dump()
    tid = payload.get("targetId", "")
    _versions.setdefault(tid, []).insert(0, payload)
    return {"ok": True}


@router.get("/backups")
def list_backups() -> dict[str, Any]:
    return {"ok": True, "backups": _backups}


@router.post("/backups")
def create_backup(body: BackupCreateBody) -> dict[str, Any]:
    backup = {
        "id": f"bak-{uuid4().hex[:8]}",
        "label": body.label,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    _backups.insert(0, backup)
    return {"ok": True, "backup": backup}
