"""Unified API gateway — resilient tool + status endpoints."""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import Field

from schemas.strict import StrictModel
from services import connection_controller
from services.integration_gateway import execute_tool_with_fallback, integration_matrix, resolve_tool_route
from services.event_pipeline import publish_omnimind_event
from services.omni_tool_handlers import dispatch_tool

router = APIRouter(prefix="/api/v1/gateway", tags=["gateway"])


class GatewayEventRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=128)
    event_type: str = Field(min_length=1, max_length=128)
    payload: Dict[str, Any] = Field(default_factory=dict)


class GatewayExecuteRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=16000)
    tool: Optional[str] = Field(default=None, max_length=32)
    agent_id: str = Field(default="sovereign-core", max_length=64)
    image_refs: list[str] = Field(default_factory=list, max_length=16)


@router.get("/status")
async def gateway_status() -> dict[str, Any]:
    from services.model_router import local_first_enabled, probe_local_stack

    stack = await probe_local_stack()
    lm = stack.get("lm_studio") or await connection_controller.probe_local_llm()
    return {
        "secure": True,
        "label": "Live Engine Secure",
        "routing": "cursor_local_first" if local_first_enabled() else "cloud_priority",
        "engine": connection_controller.engine_status_payload(lm),
        "local_stack": stack,
        "integrations": integration_matrix(),
    }


@router.get("/bindings")
async def gateway_bindings() -> dict[str, Any]:
    return {"bindings": integration_matrix()}


@router.get("/providers")
async def gateway_providers() -> dict[str, Any]:
    from services import lm_studio
    from services.api_keys import configured_keys_summary
    from services.model_router import local_first_enabled, resolve_runtime_provider_chain
    from services.provider_registry import provider_matrix

    lm = await lm_studio.check_connection()
    lm_online = bool(lm.get("connected"))
    return {
        "secure": True,
        "routing": "cursor_local_first" if local_first_enabled() else "cloud_priority",
        "keys_configured": configured_keys_summary(),
        "providers": provider_matrix(lm_online=lm_online),
        "runtime_chains": {
            tool: resolve_runtime_provider_chain(tool, lm_online=lm_online)
            for tool in ("chat", "create_image", "video", "deep_research")
        },
        "setup_hint": "Keys load from backend/.env via Settings — restart uvicorn after edits.",
    }


@router.post("/event")
async def gateway_event(body: GatewayEventRequest) -> dict[str, Any]:
    return await publish_omnimind_event(body.user_id, body.event_type, body.payload)


@router.post("/execute")
async def gateway_execute(body: GatewayExecuteRequest) -> dict[str, Any]:
    tool = body.tool or "chat"
    route = resolve_tool_route(tool)
    if tool == "chat":
        raise HTTPException(
            status_code=400,
            detail="Use POST /api/chat/stream for chat; gateway execute is for tools.",
        )

    async def _run(**kwargs: Any) -> dict[str, Any]:
        return await dispatch_tool(
            user_id=body.user_id,
            message=body.message,
            tool=tool,
            image_refs=body.image_refs,
            agent_id=body.agent_id,
        )

    result = await execute_tool_with_fallback(
        tool,
        _run,
        user_id=body.user_id,
        message=body.message,
        image_refs=body.image_refs,
        agent_id=body.agent_id,
    )
    result["route"] = route
    return result
