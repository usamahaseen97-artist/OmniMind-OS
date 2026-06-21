"""POST /api/v1/marketing/campaign-builder — Tool 11."""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.marketing_tool import build_marketing_campaign

router = APIRouter(prefix="/api/v1/marketing", tags=["marketing"])


class CampaignBuilderBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    brief: str = Field(..., min_length=3, max_length=12000)
    brand_assets: Optional[list[str]] = Field(default=None, max_length=20)
    manual_3d_layout: Optional[dict[str, Any]] = None


@router.post("/campaign-builder")
@isolated_tool_route(tool="digital-marketing-hub")
async def marketing_campaign_builder(body: CampaignBuilderBody) -> dict[str, Any]:
    return await build_marketing_campaign(
        user_id=body.user_id,
        brief=body.brief,
        brand_assets=body.brand_assets,
        manual_3d_layout=body.manual_3d_layout,
    )
