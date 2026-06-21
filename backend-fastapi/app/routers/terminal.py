from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.routers.deps import current_user_id

router = APIRouter(prefix="/api/v1/terminal", tags=["terminal"])


class TerminalExecuteBody(BaseModel):
    command: str = Field(min_length=1, max_length=4000)


@router.post("/execute")
async def execute_terminal(
    body: TerminalExecuteBody,
    _user_id: str = Depends(current_user_id),
) -> dict:
    target = f"{settings.node_service_url.rstrip('/')}/api/v1/terminal/execute"
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(target, json={"command": body.command})
            res.raise_for_status()
            return res.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"terminal upstream unavailable: {exc}") from exc
