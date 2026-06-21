"""
OmniMind V11 Dev Engine — sandbox workspaces, SSE prompt execution, hot-reload watch.
"""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import Field, field_validator

from schemas.strict import StrictModel
from schemas.validators import validate_non_blank_str
from services.dev_sandbox_engine import (
    ensure_workspace,
    get_diagnostics,
    list_files,
    normalize_tool_type,
    read_file,
    save_project,
    stream_execute_prompt,
    stream_watch_build,
    write_file,
)

router = APIRouter(prefix="/api/dev", tags=["dev-engine"])


class ExecutePromptBody(StrictModel):
    tool_type: str = Field(..., min_length=2, max_length=64)
    user_prompt: str = Field(..., min_length=1, max_length=16000)
    active_file: str = Field(default="", max_length=512)

    @field_validator("user_prompt")
    @classmethod
    def prompt_ok(cls, v: str) -> str:
        return validate_non_blank_str(v)


class SaveProjectBody(StrictModel):
    tool_type: str = Field(..., min_length=2, max_length=64)
    label: str = Field(default="", max_length=200)


class InitWorkspaceBody(StrictModel):
    tool_type: str = Field(..., min_length=2, max_length=64)


@router.post("/init-workspace")
async def init_workspace(body: InitWorkspaceBody) -> dict[str, Any]:
    """Instantiate tool-specific sandbox tree on disk."""
    try:
        return ensure_workspace(body.tool_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/workspace/{tool_type}/files")
async def workspace_files(tool_type: str) -> dict[str, Any]:
    try:
        slug = normalize_tool_type(tool_type)
        ensure_workspace(tool_type)
        return {"tool_type": slug, "files": list_files(tool_type)}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/workspace/{tool_type}/file")
async def workspace_file(tool_type: str, path: str = Query(..., min_length=1)) -> dict[str, Any]:
    try:
        content = read_file(tool_type, path)
        return {"path": path, "content": content}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/execute-prompt")
async def execute_prompt(body: ExecutePromptBody):
    """
    Stream generated code tokens (SSE) then patch the active sandbox file.
    Events: token, meta, file_written, build, done.
    """
    try:
        normalize_tool_type(body.tool_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    async def generate():
        try:
            async for chunk in stream_execute_prompt(
                tool_type=body.tool_type,
                user_prompt=body.user_prompt,
                active_file=body.active_file,
            ):
                yield chunk
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/watch-build")
async def watch_build(tool_type: str = Query(..., min_length=2, max_length=64)):
    """
    Persistent SSE — emits hot_reload payloads when sandbox files change.
    """
    try:
        normalize_tool_type(tool_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    async def generate():
        try:
            async for chunk in stream_watch_build(tool_type):
                yield chunk
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post("/save-project")
async def save_project_route(body: SaveProjectBody) -> dict[str, Any]:
    try:
        return save_project(body.tool_type, label=body.label)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/diagnostics")
async def diagnostics(tool_type: str = Query(..., min_length=2, max_length=64)) -> dict[str, Any]:
    try:
        return get_diagnostics(tool_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/patch-file")
async def patch_file(
    tool_type: str = Query(...),
    path: str = Query(...),
    content: str = "",
) -> JSONResponse:
    """Direct file mutation (used by internal tooling)."""
    try:
        result = write_file(tool_type, path, content)
        return JSONResponse(result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
