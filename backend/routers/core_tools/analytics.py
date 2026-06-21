"""POST /api/v1/analytics/* — Tool 8 Business Analytics Server."""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.analytics_tool import compile_analytics, process_analytics

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


class AnalyticsProcessBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    query: str = Field(..., min_length=1, max_length=8000)
    dataset_name: str = Field(default="default", max_length=128)
    export_excel: bool = False
    export_word: bool = False


class AnalyticsCompileBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    query: str = Field(default="", max_length=8000)
    dataset_name: str = Field(default="default", max_length=128)
    spreadsheet_base64: Optional[str] = Field(default=None, max_length=12_000_000)
    log_text: Optional[str] = Field(default=None, max_length=500000)
    video_path: Optional[str] = Field(default=None, max_length=2048)
    export_excel: bool = True
    export_word: bool = True


@router.post("/process")
@isolated_tool_route(tool="business-analytics")
async def analytics_process(body: AnalyticsProcessBody) -> dict[str, Any]:
    return await process_analytics(
        user_id=body.user_id,
        query=body.query,
        dataset_name=body.dataset_name,
        export_excel=body.export_excel,
        export_word=body.export_word,
    )


@router.post("/compile")
@isolated_tool_route(tool="business-analytics")
async def analytics_compile(body: AnalyticsCompileBody) -> dict[str, Any]:
    return await compile_analytics(
        user_id=body.user_id,
        query=body.query,
        dataset_name=body.dataset_name,
        spreadsheet_base64=body.spreadsheet_base64,
        log_text=body.log_text,
        video_path=body.video_path,
        export_excel=body.export_excel,
        export_word=body.export_word,
    )
