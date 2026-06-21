"""POST /api/v1/business/generate-suite — Tool 4."""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.business_tool import generate_business_suite

router = APIRouter(prefix="/api/v1/business", tags=["business-suite"])


class BusinessSuiteBody(StrictModel):
    prompt: str = Field(..., min_length=3, max_length=12000)
    suite_type: str = Field(default="erp", max_length=32)
    business_name: str = Field(default="OmniMind Corp", max_length=200)
    user_id: str = Field(default="anonymous", max_length=128)
    team_size: Optional[str] = Field(default=None, max_length=32)


@router.post("/generate-suite")
@isolated_tool_route(tool="business-suite")
async def business_generate_suite(body: BusinessSuiteBody) -> dict[str, Any]:
    return await generate_business_suite(
        prompt=body.prompt,
        suite_type=body.suite_type,
        business_name=body.business_name,
        user_id=body.user_id,
        team_size=body.team_size,
    )
