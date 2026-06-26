"""
OmniCore AI Gateway API — production AI routing via superapp_ai + Mongo persistence."""



from __future__ import annotations

import logging

import time
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query

from config import get_settings
from lib.enterprise.dependencies import platform_router_dependencies
from lib.omnicore_store import append_list_item, load, load_list, save, status as store_status
from schemas.platform_enterprise import (
    AgentRegisterBody,
    AgentsSaveBody,
    ConversationSaveBody,
    MemoryEntryBody,
    MemorySaveBody,
    PromptBody,
    PromptOptionsBody,
    TaskEnqueueBody,
    WorkflowSaveBody,
)
from services import superapp_ai

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/ai",
    tags=["omnicore-ai"],
    dependencies=platform_router_dependencies(),
)

_DEFAULT_AGENTS: list[dict[str, Any]] = [
    {"id": "forge-agent", "name": "Forge Agent", "toolSlug": "omniforge-engine", "enabled": True},
    {"id": "medical-agent", "name": "Medical Agent", "toolSlug": "medical-diagnostic-suite", "enabled": True},
    {"id": "visionary-agent", "name": "Visionary Agent", "toolSlug": "visionary-studio", "enabled": True},
    {"id": "music-agent", "name": "Music Agent", "toolSlug": "omnimusic", "enabled": True},
    {"id": "developer-agent", "name": "Developer Agent", "toolSlug": "omnimind", "enabled": True},
]


def _provider_catalog() -> list[dict[str, Any]]:
    settings = get_settings()
    has_gemini = bool(settings.gemini_api_key)
    has_openai = bool(getattr(settings, "openai_api_key", None))
    return [
        {"id": "google", "label": "Google Gemini", "status": "online" if has_gemini else "offline"},
        {"id": "openai", "label": "OpenAI", "status": "online" if has_openai else "offline"},
        {"id": "local", "label": "Local LLM", "status": "online"},
    ]


def _agents() -> list[dict[str, Any]]:
    return load("ai_agents", _DEFAULT_AGENTS)


@router.get("/agents")
def list_agents() -> dict[str, Any]:
    return {"ok": True, "agents": _agents()}


@router.put("/agents")
def save_agents(body: AgentsSaveBody) -> dict[str, Any]:
    save("ai_agents", body.agents)
    return {"ok": True}


@router.post("/agents")
def register_agent(body: AgentRegisterBody) -> dict[str, Any]:
    payload = body.model_dump()
    payload.setdefault("id", f"agent-{uuid4().hex[:8]}")
    agents = _agents()
    agents.append(payload)
    save("ai_agents", agents)
    return {"ok": True, "agent": payload}


@router.get("/providers")
def list_providers() -> dict[str, Any]:
    return {"ok": True, "providers": _provider_catalog()}


@router.get("/prompts")
def list_prompts() -> dict[str, Any]:
    return {"ok": True, "prompts": load_list("ai_prompts")}


@router.post("/prompts")
def save_prompt(body: EnterpriseDocument) -> dict[str, Any]:
    body.setdefault("id", f"pt-{uuid4().hex[:8]}")
    append_list_item("ai_prompts", body)
    return {"ok": True, "prompt": body}


@router.post("/complete")
async def ai_complete(body: PromptOptionsBody) -> dict[str, Any]:
    prompt = body.prompt.strip()
    options = body.options or {}
    tool_slug = options.get("toolSlug") or "*"
    agent_id = options.get("agentId") or "developer-agent"

    system = (
        "You are OmniMind Unified Brain — the enterprise AI gateway for all OmniMind tools.\n"
        f"Active tool: {tool_slug}\n"
        f"Active agent: {agent_id}\n"
        "Respond accurately, concisely, and production-ready."
    )

    started = time.perf_counter()
    try:
        text = await superapp_ai.complete_text(message=prompt, system_prompt=system)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"AI completion failed: {exc}") from exc

    latency_ms = int((time.perf_counter() - started) * 1000)
    job_id = f"req-{uuid4().hex[:8]}"
    record = {
        "id": job_id,
        "prompt": prompt[:200],
        "status": "success",
        "latencyMs": latency_ms,
        "toolSlug": tool_slug,
        "agentId": agent_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    append_list_item("ai_request_history", record)

    append_list_item(
        "ai_memory",
        {
            "id": f"mem-{uuid4().hex[:8]}",
            "scope": "session",
            "key": f"complete:{job_id}",
            "value": prompt[:500],
            "toolSlug": tool_slug,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        max_items=1000,
    )

    return {
        "ok": True,
        "result": {
            "text": text,
            "providerId": "google",
            "modelId": "auto",
            "jobId": job_id,
            "latencyMs": latency_ms,
        },
    }


@router.get("/conversations")
def list_conversations(toolSlug: str | None = Query(None)) -> dict[str, Any]:
    conv_map: dict[str, dict[str, Any]] = load("ai_conversations", {})
    convs = list(conv_map.values())
    if toolSlug:
        convs = [c for c in convs if c.get("toolSlug") == toolSlug]
    return {"ok": True, "conversations": convs}


@router.put("/conversations")
def save_conversation(body: ConversationSaveBody) -> dict[str, Any]:
    payload = body.model_dump()
    cid = payload.get("id", f"conv-{uuid4().hex[:8]}")
    payload["id"] = cid
    conv_map: dict[str, dict[str, Any]] = load("ai_conversations", {})
    conv_map[cid] = payload
    save("ai_conversations", conv_map)
    return {"ok": True}


@router.get("/memory")
def list_memory(scope: str | None = Query(None)) -> dict[str, Any]:
    entries = load_list("ai_memory")
    if scope:
        entries = [m for m in entries if m.get("scope") == scope]
    return {"ok": True, "entries": entries}


@router.put("/memory")
def save_memory(body: MemorySaveBody | MemoryEntryBody) -> dict[str, Any]:
    if isinstance(body, MemorySaveBody):
        save("ai_memory", body.entries)
        return {"ok": True}
    payload = body.model_dump()
    payload.setdefault("id", f"mem-{uuid4().hex[:8]}")
    payload.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
    append_list_item("ai_memory", payload)
    return {"ok": True}


@router.get("/workflows")
def list_workflows() -> dict[str, Any]:
    return {"ok": True, "workflows": load_list("ai_workflows")}


@router.post("/workflows")
def save_workflow(body: WorkflowSaveBody) -> dict[str, Any]:
    payload = body.model_dump()
    payload.setdefault("id", f"wf-{uuid4().hex[:8]}")
    append_list_item("ai_workflows", payload)
    return {"ok": True, "workflow": payload}


@router.get("/tasks")
def list_tasks() -> dict[str, Any]:
    return {"ok": True, "tasks": load_list("ai_tasks")}


@router.post("/tasks")
def enqueue_task(body: TaskEnqueueBody) -> dict[str, Any]:
    payload = body.model_dump()
    payload.setdefault("id", f"task-{uuid4().hex[:8]}")
    payload["status"] = "queued"
    append_list_item("ai_tasks", payload)
    return {"ok": True, "task": payload}


@router.get("/gateway/status")
def gateway_status() -> dict[str, Any]:
    history = load_list("ai_request_history")
    latencies = [int(h.get("latencyMs", 0)) for h in history if h.get("latencyMs")]
    p50 = sorted(latencies)[len(latencies) // 2] if latencies else 0
    return {
        "ok": True,
        "providers": _provider_catalog(),
        "store": store_status(),
        "monitoring": {
            "requestCount": len(history),
            "latencyP50Ms": p50,
            "totalCostUsd": 0,
        },
    }
