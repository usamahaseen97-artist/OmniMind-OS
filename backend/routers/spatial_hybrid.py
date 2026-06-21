"""
OmniMind V11 Hybrid Spatial Engineering Core — unified AI + manual coordination.
"""

from __future__ import annotations

import logging
from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from pydantic import Field

from schemas.strict import StrictModel
from services.spatial_runtime_engine import (
    get_or_create_session,
    process_directive_hybrid,
)

from routers.spatial_engine import broadcast_spatial_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/spatial", tags=["spatial-hybrid"])

SpatialModule = Literal["external", "interior"]
ExecutionType = Literal["ai_agent", "manual"]


class ProcessDirectiveParameters(StrictModel):
    prompt: str | None = Field(default=None, max_length=16000)
    adjustments: dict[str, Any] | None = None
    render_settings: dict[str, Any] = Field(default_factory=dict)
    session_id: str = Field(default="", max_length=64)


class ProcessDirectiveBody(StrictModel):
    execution_type: ExecutionType
    module: SpatialModule
    parameters: ProcessDirectiveParameters


@router.post("/process-directive")
async def process_directive(body: ProcessDirectiveBody) -> dict[str, Any]:
    """
    Hybrid spatial pipeline — AI natural-language directives or manual canvas/form edits.
    Returns unified sync schema for matrix coordinates, cinematic bundle, and render dialog.
    """
    get_or_create_session(body.module, body.parameters.session_id or None)
    try:
        payload = await process_directive_hybrid(
            execution_type=body.execution_type,
            module=body.module,
            parameters=body.parameters.model_dump(),
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    sid = str(payload.get("session_id") or "")
    if sid:
        await broadcast_spatial_session(
            sid,
            {"type": "hybrid_sync", "payload": payload},
        )
    return payload
