"""Business Software Architect — ERP/CRM builds, AI agents, digital clones."""

from __future__ import annotations

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import Field, field_validator

from schemas.strict import StrictModel
from schemas.validators import validate_non_blank_str
from services.prompts import BUSINESS_AGENTS_SYSTEM, BUSINESS_BUILDER_SYSTEM
from services.superapp_ai import complete_text, stream_completion

router = APIRouter(prefix="/business_builder", tags=["business_builder"])

SOFTWARE_TYPES = [
    {"id": "accounting", "label": "Accounting & Finance", "modules": ["GL", "AP/AR", "Tax", "Reports"]},
    {"id": "inventory", "label": "Inventory & Warehouse", "modules": ["SKUs", "Stock", "Suppliers", "Barcode"]},
    {"id": "crm", "label": "CRM & Sales", "modules": ["Leads", "Pipeline", "Contacts", "Email"]},
    {"id": "erp", "label": "Full ERP Suite", "modules": ["HR", "Ops", "Finance", "BI"]},
    {"id": "custom", "label": "Custom Hybrid", "modules": ["User-defined"]},
]


class BusinessPlanRequest(StrictModel):
    business_name: str = Field(..., min_length=1, max_length=200)
    software_type: str = Field(default="crm", min_length=1, max_length=32)
    requirements: str = Field(..., min_length=3, max_length=12000)
    team_size: str = Field(default="1-10", min_length=1, max_length=32)
    history: list[dict] = Field(default_factory=list, max_length=50)

    @field_validator("business_name", "requirements")
    @classmethod
    def non_blank(cls, v: str) -> str:
        return validate_non_blank_str(v)


class BusinessAgentsRequest(StrictModel):
    business_name: str = Field(..., min_length=1, max_length=200)
    use_cases: str = Field(..., min_length=3, max_length=8000)
    clone_founder: bool = True
    founder_persona: str = Field(default="", max_length=4000)
    history: list[dict] = Field(default_factory=list, max_length=50)

    @field_validator("business_name", "use_cases")
    @classmethod
    def non_blank(cls, v: str) -> str:
        return validate_non_blank_str(v)


@router.get("/software-types")
async def list_software_types():
    return {"types": SOFTWARE_TYPES}


@router.post("/plan")
async def build_software_plan(body: BusinessPlanRequest):
    """Generate a full software blueprint (sync)."""
    stype = next((t for t in SOFTWARE_TYPES if t["id"] == body.software_type), SOFTWARE_TYPES[-1])
    prompt = (
        f"Business: {body.business_name}\nSoftware type: {stype['label']}\n"
        f"Suggested modules: {', '.join(stype['modules'])}\nTeam size: {body.team_size}\n\n"
        f"Requirements:\n{body.requirements}"
    )
    blueprint = await complete_text(
        message=prompt,
        system_prompt=BUSINESS_BUILDER_SYSTEM,
        history=body.history[-10:],
        temperature=0.55,
        max_tokens=4096,
    )
    return {
        "tool": "business-software-architect",
        "software_type": body.software_type,
        "blueprint": blueprint,
    }


@router.post("/plan/stream")
async def build_software_plan_stream(body: BusinessPlanRequest):
    stype = next((t for t in SOFTWARE_TYPES if t["id"] == body.software_type), SOFTWARE_TYPES[-1])
    prompt = (
        f"Business: {body.business_name}\nType: {stype['label']}\nTeam: {body.team_size}\n\n"
        f"Requirements:\n{body.requirements}"
    )

    async def generate():
        async for token in stream_completion(
            message=prompt,
            system_prompt=BUSINESS_BUILDER_SYSTEM,
            history=body.history[-10:],
            temperature=0.55,
            max_tokens=4096,
        ):
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/agents")
async def design_agents(body: BusinessAgentsRequest):
    """Design AI agents, chatbots, and optional founder digital clone."""
    clone_note = (
        f"\nInclude a digital clone of the founder with persona:\n{body.founder_persona}"
        if body.clone_founder and body.founder_persona
        else "\nInclude a founder digital clone template (tone, knowledge base, guardrails)."
        if body.clone_founder
        else ""
    )
    prompt = (
        f"Business: {body.business_name}\nUse cases:\n{body.use_cases}{clone_note}\n"
        "Design at least: Support Bot, Sales Assistant, Ops Agent."
    )

    async def generate():
        async for token in stream_completion(
            message=prompt,
            system_prompt=BUSINESS_AGENTS_SYSTEM,
            history=body.history[-8:],
            temperature=0.6,
            max_tokens=4096,
        ):
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/agents/sync")
async def design_agents_sync(body: BusinessAgentsRequest):
    clone_note = (
        f"\nFounder clone persona: {body.founder_persona}" if body.clone_founder else ""
    )
    prompt = f"Business: {body.business_name}\nUse cases:\n{body.use_cases}{clone_note}"
    result = await complete_text(
        message=prompt,
        system_prompt=BUSINESS_AGENTS_SYSTEM,
        history=body.history[-8:],
        temperature=0.6,
        max_tokens=4096,
    )
    return {"tool": "business-software-architect", "agents_blueprint": result}
