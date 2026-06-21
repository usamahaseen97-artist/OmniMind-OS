"""NASA Science Solver — high-reasoning scientific problem solving."""

from __future__ import annotations

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import Field, field_validator

from schemas.strict import StrictModel
from schemas.validators import validate_non_blank_str
from services.prompts import NASA_SCIENCE_SYSTEM
from services.superapp_ai import complete_text, stream_completion

router = APIRouter(prefix="/science", tags=["science"])

SCIENCE_DOMAINS = [
    {"id": "wireless-energy", "label": "Wireless Energy Transfer", "icon": "zap"},
    {"id": "space-data", "label": "Space Data Analysis", "icon": "satellite"},
    {"id": "orbital-mechanics", "label": "Orbital Mechanics", "icon": "orbit"},
    {"id": "plasma-physics", "label": "Plasma & EM Physics", "icon": "atom"},
    {"id": "materials", "label": "Advanced Materials", "icon": "layers"},
    {"id": "mission-planning", "label": "Mission Planning", "icon": "rocket"},
]


class ScienceSolveRequest(StrictModel):
    problem: str = Field(..., min_length=3, max_length=12000)
    domain: str = Field(default="general", min_length=1, max_length=64)
    history: list[dict] = Field(default_factory=list, max_length=50)

    @field_validator("problem")
    @classmethod
    def problem_ok(cls, v: str) -> str:
        return validate_non_blank_str(v)


class ScienceSolveSyncRequest(ScienceSolveRequest):
    pass


@router.get("/domains")
async def list_domains():
    return {"domains": SCIENCE_DOMAINS, "model_hint": "llama-3-high-reasoning"}


@router.post("/solve")
async def solve_science_stream(body: ScienceSolveRequest):
    """Stream a rigorous scientific analysis (Llama-3 via LM Studio)."""
    domain_hint = next((d for d in SCIENCE_DOMAINS if d["id"] == body.domain), None)
    domain_label = domain_hint["label"] if domain_hint else body.domain

    user_message = (
        f"**Domain:** {domain_label}\n\n**Problem:**\n{body.problem.strip()}\n\n"
        "Apply full high-reasoning protocol."
    )

    async def generate():
        async for token in stream_completion(
            message=user_message,
            system_prompt=NASA_SCIENCE_SYSTEM,
            history=body.history[-12:],
            temperature=0.25,
            max_tokens=4096,
        ):
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/solve/sync")
async def solve_science_sync(body: ScienceSolveSyncRequest):
    """Non-streaming scientific solve."""
    domain_hint = next((d for d in SCIENCE_DOMAINS if d["id"] == body.domain), None)
    domain_label = domain_hint["label"] if domain_hint else body.domain
    user_message = f"**Domain:** {domain_label}\n\n**Problem:**\n{body.problem.strip()}"

    result = await complete_text(
        message=user_message,
        system_prompt=NASA_SCIENCE_SYSTEM,
        history=body.history[-12:],
        temperature=0.25,
        max_tokens=4096,
    )
    return {"domain": body.domain, "result": result, "tool": "nasa-science-solver"}
