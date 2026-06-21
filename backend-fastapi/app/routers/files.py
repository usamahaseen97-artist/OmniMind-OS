from __future__ import annotations

import asyncio
import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import SessionLocal, get_db
from app.models import Project, ProjectFile
from app.routers.deps import current_user_id
from app.schemas import FileUpsert

router = APIRouter(prefix="/api/v1/files", tags=["files"])


def _serialize_files(rows: list[ProjectFile]) -> list[dict]:
    return [
        {"id": f.id, "path": f.path, "content": f.content, "language": f.language}
        for f in rows
    ]


def _files_signature(rows: list[ProjectFile]) -> str:
    payload = sorted((f.path, f.content or "", f.language or "") for f in rows)
    return hashlib.sha256(json.dumps(payload).encode()).hexdigest()


@router.get("/{project_id}")
async def list_files(
    project_id: str,
    user_id: str = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    project = await db.scalar(select(Project).where(Project.id == project_id, Project.user_id == user_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    rows = (await db.scalars(select(ProjectFile).where(ProjectFile.project_id == project_id))).all()
    return {"items": _serialize_files(rows)}


@router.get("/{project_id}/watch")
async def watch_files(
    project_id: str,
    user_id: str = Depends(current_user_id),
) -> StreamingResponse:
    """SSE stream — emits full file list whenever the project store changes."""

    async def event_stream():
        last_sig = ""
        while True:
            async with SessionLocal() as session:
                project = await session.scalar(
                    select(Project).where(Project.id == project_id, Project.user_id == user_id)
                )
                if not project:
                    yield f"data: {json.dumps({'error': 'Project not found'})}\n\n"
                    break

                rows = (
                    await session.scalars(select(ProjectFile).where(ProjectFile.project_id == project_id))
                ).all()
                sig = _files_signature(rows)
                if sig != last_sig:
                    last_sig = sig
                    payload = {"items": _serialize_files(rows), "revision": sig[:12]}
                    yield f"data: {json.dumps(payload)}\n\n"

            await asyncio.sleep(1.5)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@router.post("/{project_id}")
async def upsert_file(
    project_id: str,
    body: FileUpsert,
    user_id: str = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    project = await db.scalar(select(Project).where(Project.id == project_id, Project.user_id == user_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file = await db.scalar(select(ProjectFile).where(ProjectFile.project_id == project_id, ProjectFile.path == body.path))
    if not file:
        file = ProjectFile(project_id=project_id, path=body.path, content=body.content, language=body.language)
        db.add(file)
    else:
        file.content = body.content
        file.language = body.language
    await db.commit()
    return {"id": file.id, "path": file.path, "language": file.language}
