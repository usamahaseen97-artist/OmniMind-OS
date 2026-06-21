from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Project
from app.routers.deps import current_user_id
from app.schemas import ProjectCreate

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("")
async def list_projects(
    user_id: str = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    rows = (await db.scalars(select(Project).where(Project.user_id == user_id))).all()
    return {"items": [{"id": p.id, "name": p.name, "description": p.description} for p in rows]}


@router.post("")
async def create_project(
    body: ProjectCreate,
    user_id: str = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    item = Project(user_id=user_id, name=body.name, description=body.description)
    db.add(item)
    await db.commit()
    return {"id": item.id, "name": item.name, "description": item.description}


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    user_id: str = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    item = await db.scalar(select(Project).where(Project.id == project_id, Project.user_id == user_id))
    if not item:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(item)
    await db.commit()
    return {"ok": True}
