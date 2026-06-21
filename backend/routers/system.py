"""System theme + authorized tool registry endpoints."""

from __future__ import annotations

import logging
from typing import Any, Literal, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.system_registry import get_user_theme, save_user_theme, sync_authorized_tool_registry

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/system", tags=["system"])


class ThemePutBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    preset_id: Literal["deep-purple", "gold-accent", "auto", "custom"] = "deep-purple"
    custom_color: Optional[str] = Field(default=None, max_length=32)
    auto_seed: Optional[str] = Field(default=None, max_length=64)


@router.put("/theme")
@isolated_tool_route(tool="system-theme")
async def put_user_theme(body: ThemePutBody) -> dict[str, Any]:
    """Save and apply user custom hex or auto-randomized seed globally to profile collection."""
    logger.info(
        "PUT /system/theme user=%s preset=%s custom=%s",
        body.user_id,
        body.preset_id,
        body.custom_color,
    )
    return await save_user_theme(
        user_id=body.user_id,
        preset_id=body.preset_id,
        custom_color=body.custom_color,
        auto_seed=body.auto_seed,
    )


@router.get("/theme")
@isolated_tool_route(tool="system-theme")
async def read_user_theme(user_id: str = "anonymous") -> dict[str, Any]:
    return await get_user_theme(user_id)


@router.post("/sync-registry")
@isolated_tool_route(tool="system-registry")
async def sync_tool_registry() -> dict[str, Any]:
    """Purge duplicate strings and enforce single-instance 11-tool enum mapping."""
    return await sync_authorized_tool_registry()
