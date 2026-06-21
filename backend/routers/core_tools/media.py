"""POST /api/v1/creative/* — Tool 9 Creative Visionary Video Pipeline."""

from __future__ import annotations

from typing import Any, Literal, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.media_tool import render_creative_job, render_media_pipeline

router = APIRouter(prefix="/api/v1/creative", tags=["creative-visionary"])


class MediaPipelineBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    scene_descriptions: Optional[list[str]] = Field(default=None, max_length=10)
    voice_tone: float = Field(default=0.5, ge=0, le=1)
    script_style: str = Field(default="cinematic", max_length=64)
    convert_to_video: bool = False


class CreativeRenderJobBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    duration: Literal["50s", "1m", "60s", "1min"] = "50s"
    asset_blocks: Optional[list[dict[str, Any]]] = Field(default=None, max_length=5)
    voice_style: str = Field(default="cinematic", max_length=64)
    script_text: str = Field(default="", max_length=16000)
    scene_descriptions: Optional[list[str]] = Field(default=None, max_length=5)


@router.post("/render-pipeline")
@isolated_tool_route(tool="creative-visionary")
async def creative_render_pipeline(body: MediaPipelineBody) -> dict[str, Any]:
    return await render_media_pipeline(
        user_id=body.user_id,
        scene_descriptions=body.scene_descriptions,
        voice_tone=body.voice_tone,
        script_style=body.script_style,
        convert_to_video=body.convert_to_video,
    )


@router.post("/render-job")
@isolated_tool_route(tool="creative-visionary")
async def creative_render_job(body: CreativeRenderJobBody) -> dict[str, Any]:
    return await render_creative_job(
        user_id=body.user_id,
        duration=body.duration,
        asset_blocks=body.asset_blocks,
        voice_style=body.voice_style,
        script_text=body.script_text,
        scene_descriptions=body.scene_descriptions,
    )
