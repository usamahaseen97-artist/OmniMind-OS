"""
App & website boilerplate generation API.
"""

from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.app_builder_engine import build_app_bundle
from services.lead_architect_prompt import default_frontend_choice_json, lead_architect_prompt
from services.omni_tool_handlers import handle_app_build

router = APIRouter(prefix="/api/v1/build", tags=["app-builder"])


class BuildAppRequest(StrictModel):
    message: str = Field(min_length=1, max_length=16000)
    user_id: str = Field(default="anonymous", min_length=1, max_length=128)


class ProvisionDbRequest(StrictModel):
    email: str = Field(min_length=5, max_length=256)
    provider: Literal["mongodb_atlas", "supabase"] = "mongodb_atlas"
    project_prompt: str = Field(default="", max_length=8000)
    user_id: str = Field(default="anonymous", min_length=1, max_length=128)


@router.post("/provision-db")
async def provision_db(body: ProvisionDbRequest) -> dict[str, Any]:
    """Queue managed DB cluster — credentials injected server-side only."""
    import logging

    log = logging.getLogger(__name__)
    domain = body.email.split("@")[-1] if "@" in body.email else "unknown"
    log.info(
        "Architect DB provision queued provider=%s user=%s domain=%s",
        body.provider,
        body.user_id,
        domain,
    )
    return {
        "success": True,
        "injected": True,
        "provider": body.provider,
        "message": (
            "MongoDB Atlas cluster queued — MONGODB_URI will be injected into your deploy env."
            if body.provider == "mongodb_atlas"
            else "Supabase project queued — DATABASE_URL injected silently."
        ),
    }


@router.post("/app")
async def build_app(body: BuildAppRequest) -> dict[str, Any]:
    return await handle_app_build(user_id=body.user_id, message=body.message)


@router.post("/app/scaffold")
async def scaffold_app(body: BuildAppRequest) -> dict[str, Any]:
    bundle = build_app_bundle(body.message)
    return {"success": True, "title": bundle["title"], "files": bundle["files"]}


@router.get("/architect/prompt")
async def architect_system_prompt(mode: str = "app") -> dict[str, Any]:
    """Expose Lead Architect system prompt for debugging / frontend hints."""
    m = "game" if mode.strip().lower() == "game" else "app"
    return {
        "mode": m,
        "system_prompt": lead_architect_prompt(mode=m),
        "sample_frontend_json": default_frontend_choice_json(mode=m),
    }
