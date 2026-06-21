"""POST /api/v1/science/* — Tool 5 NASA Science Solver."""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.science_tool import compute_science, execute_science

router = APIRouter(prefix="/api/v1/science", tags=["science"])


class ScienceComputeBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    formula: str = Field(..., min_length=1, max_length=12000)
    domain: str = Field(default="orbital-mechanics", max_length=64)
    matrix_size: int = Field(default=4, ge=2, le=12)
    validation_steps: int = Field(default=1000, ge=10, le=10000)


class ScienceExecuteBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    formula: str = Field(default="", max_length=12000)
    domain: str = Field(default="orbital-mechanics", max_length=64)
    text_attachment: Optional[str] = Field(default=None, max_length=50000)
    audio_base64: Optional[str] = Field(default=None, max_length=12_000_000)
    validation_steps: int = Field(default=1000, ge=10, le=10000)


@router.post("/compute")
@isolated_tool_route(tool="nasa-solver")
async def science_compute(body: ScienceComputeBody) -> dict[str, Any]:
    return await compute_science(
        user_id=body.user_id,
        formula=body.formula,
        domain=body.domain,
        matrix_size=body.matrix_size,
        validation_steps=body.validation_steps,
    )


@router.post("/execute")
@isolated_tool_route(tool="nasa-solver")
async def science_execute(body: ScienceExecuteBody) -> dict[str, Any]:
    if not body.formula and not body.text_attachment and not body.audio_base64:
        raise ValueError("Provide formula, text_attachment, or audio_base64")
    return await execute_science(
        user_id=body.user_id,
        formula=body.formula,
        domain=body.domain,
        text_attachment=body.text_attachment,
        audio_base64=body.audio_base64,
        validation_steps=body.validation_steps,
    )
