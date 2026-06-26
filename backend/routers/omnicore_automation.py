"""
OmniCore Universal Automation API — V2.0 workflows, execution, AI generation."""



from __future__ import annotations

import logging

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query

from lib.automation import executor
from lib.enterprise.dependencies import platform_router_dependencies
from schemas.platform_enterprise import EnterpriseDocument, ContextBody, PromptBody, WorkflowRunBody, WorkflowSaveBody
from services import superapp_ai

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/automation",
    tags=["omnicore-automation"],
    dependencies=platform_router_dependencies(),
)

TEMPLATES: list[dict[str, Any]] = [
    {"id": "tpl-website-launch", "name": "Website Launch", "category": "Development"},
    {"id": "tpl-game-build", "name": "Game Build", "category": "Development"},
    {"id": "tpl-app-deploy", "name": "App Deployment", "category": "DevOps"},
    {"id": "tpl-marketing-campaign", "name": "Marketing Campaign", "category": "Business"},
    {"id": "tpl-medical-analysis", "name": "Medical Analysis", "category": "Medical"},
    {"id": "tpl-brand-creation", "name": "Brand Creation", "category": "Creative"},
    {"id": "tpl-video-production", "name": "Video Production", "category": "Creative"},
    {"id": "tpl-music-production", "name": "Music Production", "category": "Creative"},
    {"id": "tpl-business-reports", "name": "Business Reports", "category": "Business"},
    {"id": "tpl-ai-research", "name": "AI Research", "category": "AI"},
]


@router.get("/workflows")
def list_workflows() -> dict[str, Any]:
    return {"ok": True, "workflows": executor.list_workflows()}


@router.put("/workflows/{workflow_id}")
def save_workflow(workflow_id: str, body: WorkflowSaveBody) -> dict[str, Any]:
    payload = body.model_dump()
    payload["id"] = workflow_id
    wf = executor.save_workflow(payload)
    return {"ok": True, "workflow": wf}


@router.delete("/workflows/{workflow_id}")
def remove_workflow(workflow_id: str) -> dict[str, Any]:
    executor.delete_workflow(workflow_id)
    return {"ok": True}


@router.put("/workflows/{workflow_id}/nodes")
def update_nodes(workflow_id: str, body: EnterpriseDocument) -> dict[str, Any]:
    workflows = executor.list_workflows()
    wf = next((w for w in workflows if w.get("id") == workflow_id), None)
    if not wf:
        raise HTTPException(404, detail="workflow not found")
    wf["nodes"] = body.model_dump().get("nodes", [])
    return {"ok": True, "workflow": executor.save_workflow(wf)}


@router.post("/workflows/{workflow_id}/run")
async def run_workflow(workflow_id: str, body: WorkflowRunBody | None = None) -> dict[str, Any]:
    body = body or WorkflowRunBody()
    wf = next((w for w in executor.list_workflows() if w.get("id") == workflow_id), None)
    if not wf:
        raise HTTPException(404, detail="workflow not found")
    ex = await executor.execute_workflow(
        wf,
        background=body.background,
        priority=body.priority,
        context=body.input,
    )
    return {"ok": True, "execution": ex}


@router.post("/workflows/{workflow_id}/clone")
def clone_workflow(workflow_id: str) -> dict[str, Any]:
    wf = next((w for w in executor.list_workflows() if w.get("id") == workflow_id), None)
    if not wf:
        raise HTTPException(404, detail="workflow not found")
    clone = {**wf, "id": f"wf-{uuid4().hex[:10]}", "name": f"{wf.get('name', 'Workflow')} (copy)"}
    return {"ok": True, "workflow": executor.save_workflow(clone)}


@router.get("/executions")
def list_executions(workflowId: str | None = Query(None)) -> dict[str, Any]:
    return {"ok": True, "executions": executor.list_executions(workflowId)}


@router.post("/executions/{execution_id}/{action}")
def control_execution(execution_id: str, action: str) -> dict[str, Any]:
    if action not in ("pause", "resume", "retry", "rollback", "cancel"):
        raise HTTPException(400, detail="invalid action")
    ex = executor.control_execution(execution_id, action)
    if not ex:
        raise HTTPException(404, detail="execution not found")
    return {"ok": True, "execution": ex}


@router.get("/templates")
def list_templates() -> dict[str, Any]:
    return {"ok": True, "templates": TEMPLATES}


@router.get("/metrics")
def automation_metrics() -> dict[str, Any]:
    return {"ok": True, "metrics": executor.compute_metrics()}


@router.post("/generate")
async def generate_workflow(body: PromptBody) -> dict[str, Any]:
    prompt = body.prompt.strip()
    system = (
        "Generate an OmniMind automation workflow as JSON with keys: name, description, nodes. "
        "Each node: id, kind (trigger|action|condition|parallel|loop), label, config, position {x,y}, "
        "optional triggerId, actionId, nextIds, childIds."
    )
    text = await superapp_ai.complete_text(message=prompt, system_prompt=system)
    try:
        from services.superapp_ai import extract_json_object

        data = extract_json_object(text)
    except Exception:
        data = {"name": prompt[:60], "description": prompt, "nodes": []}
    now = datetime.now(timezone.utc).isoformat()
    wf = {
        "id": f"wf-{uuid4().hex[:10]}",
        "name": data.get("name", "AI Workflow"),
        "description": data.get("description", prompt),
        "version": 1,
        "nodes": data.get("nodes", []),
        "templateId": None,
        "nestedWorkflowIds": [],
        "schedule": None,
        "enabled": True,
        "tags": ["ai-generated"],
        "createdAt": now,
        "updatedAt": now,
    }
    executor.save_workflow(wf)
    return {"ok": True, "workflow": wf}


@router.post("/suggestions")
async def automation_suggestions(body: ContextBody) -> dict[str, Any]:
    context = body.context
    suggestions = [
        {
            "id": "sug-1",
            "title": "Deploy on build success",
            "reason": "Automate staging deploy after CI",
            "templateId": "tpl-app-deploy",
            "confidence": 0.8,
        },
        {
            "id": "sug-2",
            "title": "Weekly business report",
            "reason": "Scheduled analytics export",
            "templateId": "tpl-business-reports",
            "confidence": 0.76,
        },
    ]
    if "marketing" in context.lower():
        suggestions.insert(
            0,
            {
                "id": "sug-mkt",
                "title": "Marketing campaign automation",
                "reason": "Context mentions marketing",
                "templateId": "tpl-marketing-campaign",
                "confidence": 0.9,
            },
        )
    return {"ok": True, "suggestions": suggestions}


@router.get("/triggers")
def list_triggers() -> dict[str, Any]:
    return {
        "ok": True,
        "triggers": [
            {"id": "manual", "label": "Manual"},
            {"id": "schedule", "label": "Schedule"},
            {"id": "webhook", "label": "Webhook"},
            {"id": "chat-message", "label": "Chat Message"},
            {"id": "file-added", "label": "File Added"},
            {"id": "deployment-completed", "label": "Deployment Completed"},
        ],
    }


@router.get("/actions")
def list_actions() -> dict[str, Any]:
    return {
        "ok": True,
        "actions": [
            {"id": "generate-code", "label": "Generate Code"},
            {"id": "deploy-project", "label": "Deploy Project"},
            {"id": "push-notification", "label": "Push Notification"},
            {"id": "sync-cloud", "label": "Sync Cloud"},
            {"id": "execute-sdk", "label": "Execute SDK"},
        ],
    }
