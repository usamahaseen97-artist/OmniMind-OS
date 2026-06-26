"""OmniCore Platform API — production persistence via omnicore_store."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Query

from lib.enterprise.dependencies import platform_router_dependencies
from lib.omnicore_store_async import aload, asave, astore_status
from lib.response_cache import cached_response, invalidate_cache
from schemas.platform_enterprise import (
    ItemsSaveBody,
    ProjectsSaveBody,
    SearchIndexBody,
    SessionSaveBody,
    SettingsSaveBody,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore",
    tags=["omnicore"],
    dependencies=platform_router_dependencies(),
)

_DEFAULT_PROJECTS: list[dict[str, Any]] = [
    {
        "id": "proj-omniforge-001",
        "name": "OmniForge Workspace",
        "kind": "tool-scoped",
        "toolSlugs": ["omniforge-engine"],
        "pinned": True,
        "favorite": True,
        "metadata": {},
        "version": 1,
        "modifiedAt": datetime.now(timezone.utc).isoformat(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
]


async def _projects() -> list[dict[str, Any]]:
    return await aload("platform_projects", _DEFAULT_PROJECTS)


async def _search_index() -> list[dict[str, Any]]:
    return await aload("platform_search_index", [])


@router.get("/projects")
@cached_response(ttl_seconds=15.0)
async def list_projects() -> dict[str, Any]:
    projects = await _projects()
    logger.debug("list_projects count=%s", len(projects))
    return {"ok": True, "projects": projects}


@router.put("/projects")
async def save_projects(body: ProjectsSaveBody) -> dict[str, Any]:
    await asave("platform_projects", body.projects)
    invalidate_cache("routers.omnicore.list_projects")
    logger.info("save_projects count=%s", len(body.projects))
    return {"ok": True}


@router.put("/workspaces/{project_id}")
async def save_workspace(project_id: str, body: SessionSaveBody) -> dict[str, Any]:
    workspaces: dict[str, dict[str, Any]] = await aload("platform_workspaces", {})
    workspaces[project_id] = {**body.model_dump(), "savedAt": datetime.now(timezone.utc).isoformat()}
    await asave("platform_workspaces", workspaces)
    return {"ok": True}


@router.get("/workspaces/{project_id}")
async def load_workspace(project_id: str) -> dict[str, Any]:
    workspaces: dict[str, dict[str, Any]] = await aload("platform_workspaces", {})
    return {"ok": True, "workspace": workspaces.get(project_id, {})}


@router.get("/search")
async def global_search(q: str = Query("")) -> dict[str, Any]:
    query = q.lower().strip()
    index = await _search_index()
    results = [
        item
        for item in index
        if query and query in str(item.get("title", "")).lower()
    ]
    results.sort(key=lambda x: float(x.get("score", 0)), reverse=True)
    return {"ok": True, "results": results[:50]}


@router.put("/search/index")
async def update_search_index(body: SearchIndexBody) -> dict[str, Any]:
    await asave("platform_search_index", body.items)
    return {"ok": True}


@router.get("/settings")
async def list_settings() -> dict[str, Any]:
    return {"ok": True, "settings": await aload("platform_settings", [])}


@router.put("/settings")
async def save_settings(body: SettingsSaveBody) -> dict[str, Any]:
    await asave("platform_settings", body.settings)
    return {"ok": True}


@router.put("/sessions")
async def save_session(body: SessionSaveBody) -> dict[str, Any]:
    payload = body.model_dump()
    session_id = payload.get("id", f"sess-{uuid4().hex[:8]}")
    payload["id"] = session_id
    payload["lastActiveAt"] = datetime.now(timezone.utc).isoformat()
    sessions: dict[str, dict[str, Any]] = await aload("platform_sessions", {})
    sessions[session_id] = payload
    await asave("platform_sessions", sessions)
    return {"ok": True, "session": payload}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> dict[str, Any]:
    sessions: dict[str, dict[str, Any]] = await aload("platform_sessions", {})
    return {"ok": True, "session": sessions.get(session_id, {})}


@router.get("/recent")
async def list_recent() -> dict[str, Any]:
    return {"ok": True, "items": await aload("platform_recent", [])}


@router.put("/recent")
async def save_recent(body: ItemsSaveBody) -> dict[str, Any]:
    await asave("platform_recent", body.items)
    return {"ok": True}


@router.get("/platform/status")
async def platform_status() -> dict[str, Any]:
    return {"ok": True, "store": await astore_status()}
