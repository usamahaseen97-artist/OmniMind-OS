"""POST /api/v1/medical/* — Tool 6 Medical Diagnostic Pipeline."""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.medical_tool import analyze_medical_payload, diagnose_medical

router = APIRouter(prefix="/api/v1/medical", tags=["medical"])


class MedicalAnalyzeBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    document_text: Optional[str] = Field(default=None, max_length=50000)
    pdf_base64: Optional[str] = Field(default=None, max_length=12_000_000)
    image_base64: Optional[str] = Field(default=None, max_length=12_000_000)
    mock_values: Optional[dict[str, float]] = None


class MedicalDiagnoseBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    document_text: Optional[str] = Field(default=None, max_length=50000)
    pdf_base64: Optional[str] = Field(default=None, max_length=12_000_000)
    image_base64: Optional[str] = Field(default=None, max_length=12_000_000)
    video_stream_url: Optional[str] = Field(default=None, max_length=2048)
    mock_values: Optional[dict[str, float]] = None


@router.post("/analyze")
@isolated_tool_route(tool="medical-diagnostic")
async def medical_analyze(body: MedicalAnalyzeBody) -> dict[str, Any]:
    return await analyze_medical_payload(
        user_id=body.user_id,
        document_text=body.document_text,
        pdf_base64=body.pdf_base64,
        image_base64=body.image_base64,
        mock_values=body.mock_values,
    )


@router.post("/diagnose")
@isolated_tool_route(tool="medical-diagnostic")
async def medical_diagnose(body: MedicalDiagnoseBody) -> dict[str, Any]:
    return await diagnose_medical(
        user_id=body.user_id,
        document_text=body.document_text,
        pdf_base64=body.pdf_base64,
        image_base64=body.image_base64,
        video_stream_url=body.video_stream_url,
        mock_values=body.mock_values,
    )
