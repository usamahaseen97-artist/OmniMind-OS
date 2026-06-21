"""POST /api/v1/vfx/render-timeline — Tool 10 VFX Timeline Master."""

from __future__ import annotations

from typing import Any, Literal, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.vfx_tool import render_vfx_timeline

router = APIRouter(prefix="/api/v1/vfx", tags=["vfx"])


class VfxTimelineBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    tracks: Optional[list[dict[str, Any]]] = None
    edit_command: str = Field(default="", max_length=4000)
    upload_paths: Optional[list[str]] = Field(default=None, max_length=20)
    distribution_targets: Optional[list[Literal["youtube", "tiktok", "linkedin", "facebook"]]] = None
    trigger_assembly: bool = True


@router.post("/render-timeline")
@isolated_tool_route(tool="vfx-master")
async def vfx_render_timeline(body: VfxTimelineBody) -> dict[str, Any]:
    return await render_vfx_timeline(
        user_id=body.user_id,
        tracks=body.tracks,
        edit_command=body.edit_command,
        upload_paths=body.upload_paths,
        distribution_targets=body.distribution_targets,
        trigger_assembly=body.trigger_assembly,
    )
