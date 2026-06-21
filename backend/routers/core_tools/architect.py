"""POST /api/v1/architect/* — Tool 4 Architectural Spatial Engine."""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.architect_tool import parse_blueprint, save_architect_project

router = APIRouter(prefix="/api/v1/architect", tags=["architect"])


class BlueprintBody(StrictModel):
    prompt: str = Field(..., min_length=3, max_length=12000)
    mode: str = Field(default="exterior", max_length=32)
    yard_area: Optional[float] = Field(default=None, ge=1)
    room_dimensions: Optional[dict[str, Any]] = None
    features: Optional[list[str]] = Field(default=None, max_length=20)
    user_id: str = Field(default="anonymous", max_length=128)


class SaveProjectBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    project_name: str = Field(..., min_length=1, max_length=256)
    scene_tree: dict[str, Any]
    folder_path: Optional[str] = Field(default=None, max_length=512)


@router.post("/blueprint")
@isolated_tool_route(tool="architectural-designer")
async def architect_blueprint(body: BlueprintBody) -> dict[str, Any]:
    return await parse_blueprint(
        prompt=body.prompt,
        mode=body.mode,
        yard_area=body.yard_area,
        room_dimensions=body.room_dimensions,
        features=body.features,
        user_id=body.user_id,
    )


@router.post("/save-project")
@isolated_tool_route(tool="architectural-designer")
async def architect_save_project(body: SaveProjectBody) -> dict[str, Any]:
    return await save_architect_project(
        user_id=body.user_id,
        project_name=body.project_name,
        scene_tree=body.scene_tree,
        folder_path=body.folder_path,
    )
