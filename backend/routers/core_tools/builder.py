"""POST /api/v1/build-engine/scaffold — Tools 1, 2, 3 (Builder Engines)."""

from __future__ import annotations

import asyncio
import json
from typing import Any, AsyncIterator, Literal, Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import Field

from schemas.strict import StrictModel
from services.omniforge_lead_architect import analyze_requirements, build_scaffold_plan
from services.omniforge_polyglot_registry import registry_snapshot
from services.omniforge_sandbox_scaffold import database_init_files
from services.omniforge_swarm_orchestrator import diagnostics_for_analysis, roman_db_prompt, swarm_phases
from services.router_guard import isolated_tool_route
from services.tools.builder_tool import scaffold_project

router = APIRouter(prefix="/api/v1/build-engine", tags=["build-engine"])

STREAM_FILE_PRIORITY = (
    "preview.html",
    ".omniforge/workspace.json",
    ".omniforge/preview.html",
    "README.md",
    "frontend/src/App.jsx",
    "frontend/package.json",
    "backend/main.py",
    "backend/routers/api.py",
    "config/.env.example",
    "index.html",
    "src/App.jsx",
    "src/App.tsx",
    "src/main.jsx",
    "src/main.js",
    "package.json",
)


def _order_scaffold_files(files: list[dict[str, str]]) -> list[dict[str, str]]:
    by_path = {str(f.get("path", "")): f for f in files if f.get("path")}
    ordered: list[dict[str, str]] = []
    for path in STREAM_FILE_PRIORITY:
        hit = by_path.pop(path, None)
        if hit:
            ordered.append(hit)
    ordered.extend(by_path.values())
    return ordered


async def _omniforge_scaffold_payload(body: "OmniForgeBody") -> dict[str, Any]:
    normalized = body.prompt.lower()
    inferred_tool: Literal["game-dev", "app-builder", "business-site-maker"] = "app-builder"
    if "game" in normalized or body.target_stack == "game":
        inferred_tool = "game-dev"
    elif "business" in normalized or body.target_stack == "business":
        inferred_tool = "business-site-maker"

    payload = await scaffold_project(
        prompt=body.prompt,
        email=body.email,
        user_id=body.user_id,
        tool=inferred_tool,
        ui_framework=body.model_layer,
        backend_language=body.target_stack,
        auto_deploy=bool(body.github_repo),
        files=body.files,
    )
    payload["omniforge"] = {
        "mode": body.mode,
        "target_stack": body.target_stack,
        "model_layer": body.model_layer,
        "github_repo": body.github_repo,
        "api_key_hint": body.api_key_hint,
    }
    payload["adapter"] = "omniforge-engine"
    return payload


async def _scaffold_sse_events(body: "OmniForgeBody") -> AsyncIterator[str]:
    analysis = analyze_requirements(
        body.prompt,
        target_stack=body.target_stack,
        mode=body.mode,
    )
    plan = build_scaffold_plan(analysis)
    yield f"data: {json.dumps({'type': 'architect', 'phase': 'analysis', 'analysis': analysis})}\n\n"
    yield f"data: {json.dumps({'type': 'architect', 'phase': 'db_recommendation', 'database': analysis['database'], 'prompt_roman': roman_db_prompt(analysis['database']['recommended'])})}\n\n"
    yield f"data: {json.dumps({'type': 'architect', 'phase': 'plan', 'plan': plan})}\n\n"

    for phase in swarm_phases(analysis):
        yield f"data: {json.dumps({'type': 'swarm', 'agent': phase['agent'], 'status': phase['status'], 'task': phase['task'], 'progress': phase['progress'], 'database': phase.get('database')})}\n\n"
        await asyncio.sleep(0.02)

    for tip in diagnostics_for_analysis(analysis):
        yield f"data: {json.dumps({'type': 'diagnostic', **tip})}\n\n"

    layout = {
        "type": "workspace",
        "streaming": True,
        "layout": {
            "panels": ["explorer", "preview", "code", "agent"],
            "preview_priority": list(STREAM_FILE_PRIORITY),
            "ide_modules": ["solution_explorer", "database", "api_tester", "git", "extensions"],
            "domain": analysis.get("domain"),
            "languages": analysis.get("languages"),
        },
        "files": [],
        "updated_at": "stream-start",
        "architect": analysis,
    }
    yield f"data: {json.dumps(layout)}\n\n"

    payload = await _omniforge_scaffold_payload(body)
    if not payload.get("ok"):
        yield f"data: {json.dumps({'type': 'error', 'error': payload.get('error', 'scaffold failed')})}\n\n"
        return

    files = _order_scaffold_files(list(payload.get("files") or []))
    total = len(files)

    yield f"data: {json.dumps({'type': 'workspace', 'streaming': True, 'files': [f.get('path') for f in files], 'title': payload.get('title'), 'file_count': total})}\n\n"

    for index, item in enumerate(files):
        path = str(item.get("path", ""))
        content = str(item.get("content", ""))
        language = item.get("language")
        lines = content.splitlines(keepends=True) or [content]
        accumulated = ""
        for line_idx, line in enumerate(lines):
            accumulated += line
            partial = line_idx + 1 < len(lines)
            evt = {
                "type": "file",
                "path": path,
                "content": accumulated,
                "language": language,
                "index": index,
                "total": total,
                "partial": partial,
                "line": line_idx + 1,
                "line_count": len(lines),
            }
            yield f"data: {json.dumps(evt)}\n\n"
            if partial:
                await asyncio.sleep(0.008)

    yield f"data: {json.dumps({'type': 'workspace', 'streaming': False, 'files': [f.get('path') for f in files], 'title': payload.get('title'), 'updated_at': payload.get('job_id')})}\n\n"
    yield f"data: {json.dumps({'type': 'done', 'title': payload.get('title'), 'terminal_log': payload.get('terminal_log', []), 'total': total})}\n\n"


class ScaffoldBody(StrictModel):
    prompt: str = Field(..., min_length=1, max_length=16000)
    email: str = Field(..., min_length=5, max_length=256)
    user_id: str = Field(default="anonymous", max_length=128)
    tool: Literal["game-dev", "app-builder", "business-site-maker"] = "app-builder"
    ui_framework: Optional[str] = Field(default=None, max_length=64)
    backend_language: Optional[str] = Field(default=None, max_length=64)
    auto_deploy: bool = False
    files: list[dict[str, str]] = Field(default_factory=list)


class OmniForgeBody(StrictModel):
    prompt: str = Field(..., min_length=1, max_length=16000)
    email: str = Field(..., min_length=5, max_length=256)
    user_id: str = Field(default="anonymous", max_length=128)
    mode: Literal["coding", "terminal", "vibe"] = "coding"
    target_stack: Optional[str] = Field(default="polyglot", max_length=64)
    model_layer: Optional[str] = Field(default=None, max_length=128)
    github_repo: Optional[str] = Field(default=None, max_length=512)
    api_key_hint: Optional[str] = Field(default=None, max_length=128)
    files: list[dict[str, str]] = Field(default_factory=list)


@router.post("/scaffold")
@isolated_tool_route(tool="build-engine")
async def build_engine_scaffold(body: ScaffoldBody) -> dict[str, Any]:
    return await scaffold_project(
        prompt=body.prompt,
        email=body.email,
        user_id=body.user_id,
        tool=body.tool,
        ui_framework=body.ui_framework,
        backend_language=body.backend_language,
        auto_deploy=body.auto_deploy,
        files=body.files,
    )


@router.post("/omniforge/scaffold")
@isolated_tool_route(tool="build-engine")
async def omniforge_scaffold(body: OmniForgeBody) -> dict[str, Any]:
    """
    OmniForge unified adapter:
    merges app-builder, game-dev, business-site-maker workflows behind one endpoint.
    """
    return await _omniforge_scaffold_payload(body)


class ArchitectAnalyzeBody(StrictModel):
    prompt: str = Field(..., min_length=1, max_length=16000)
    target_stack: Optional[str] = Field(default="polyglot", max_length=64)
    mode: Literal["coding", "terminal", "vibe"] = "vibe"


@router.post("/omniforge/architect/analyze")
@isolated_tool_route(tool="build-engine")
async def omniforge_architect_analyze(body: ArchitectAnalyzeBody) -> dict[str, Any]:
    """Lead architect — requirement analysis + DB recommendation without file generation."""
    analysis = analyze_requirements(body.prompt, target_stack=body.target_stack, mode=body.mode)
    return {"ok": True, "analysis": analysis, "plan": build_scaffold_plan(analysis)}


@router.get("/omniforge/polyglot/registry")
@isolated_tool_route(tool="build-engine")
async def omniforge_polyglot_registry() -> dict[str, Any]:
    return {"ok": True, **registry_snapshot()}


class DatabaseApproveBody(StrictModel):
    database: str = Field(..., min_length=2, max_length=32)
    prompt: str = Field(default="OmniForge project", max_length=16000)
    approved: bool = True


class DeployBody(StrictModel):
    target: Literal["vercel", "netlify", "railway", "docker"] = "vercel"
    project_name: str = Field(default="omnimind-app", max_length=128)
    custom_domain: Optional[str] = Field(default=None, max_length=256)


@router.post("/omniforge/database/approve")
@isolated_tool_route(tool="build-engine")
async def omniforge_database_approve(body: DatabaseApproveBody) -> dict[str, Any]:
    """After user Yes/No — return schema migration files for approved database."""
    if not body.approved:
        return {"ok": True, "approved": False, "files": [], "message": "Database init skipped by user"}
    files = database_init_files(body.database, body.prompt)
    return {
        "ok": True,
        "approved": True,
        "database": body.database,
        "files": files,
        "roman_ack": f"Theek hai — {body.database} connect ho raha hai.",
    }


@router.post("/omniforge/deploy/one-click")
@isolated_tool_route(tool="build-engine")
async def omniforge_one_click_deploy(body: DeployBody) -> dict[str, Any]:
    """Unified deploy pipeline stub — Vercel/Netlify/Railway."""
    steps = [
        f"▸ Building frontend for {body.target}",
        "▸ Syncing deployment/ manifests",
        "▸ Injecting environment bindings",
    ]
    if body.custom_domain:
        steps.append(f"▸ Proxy domain binding: {body.custom_domain}")
    steps.append(f"✓ Deploy pipeline queued ({body.target})")
    return {
        "ok": True,
        "target": body.target,
        "project": body.project_name,
        "custom_domain": body.custom_domain,
        "terminal_log": steps,
        "preview_url": f"https://{body.project_name}.vercel.app",
    }


@router.post("/omniforge/scaffold/stream")
@isolated_tool_route(tool="build-engine")
async def omniforge_scaffold_stream(body: OmniForgeBody) -> StreamingResponse:
    """SSE stream — emits foundational files first for incremental live preview."""
    return StreamingResponse(
        _scaffold_sse_events(body),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
