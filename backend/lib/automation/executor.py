"""OmniMind Universal Automation — workflow execution engine."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from lib.omnicore_store import append_list_item, load, load_list, save
from services import superapp_ai

logger = logging.getLogger(__name__)

WORKFLOWS_KEY = "automation_workflows"
EXECUTIONS_KEY = "automation_executions"

ACTION_PROMPTS: dict[str, str] = {
    "generate-code": "Generate production-ready code for: {input}",
    "generate-ui": "Generate UI components for: {input}",
    "generate-backend": "Generate backend services for: {input}",
    "generate-database": "Design database schema for: {input}",
    "generate-api": "Design REST API for: {input}",
    "generate-images": "Describe image generation pipeline for: {input}",
    "generate-videos": "Describe video production steps for: {input}",
    "generate-music": "Describe music production for: {input}",
    "generate-marketing": "Write marketing campaign for: {input}",
    "run-medical-analysis": "Summarize medical analysis workflow for: {input}",
    "run-business-analytics": "Produce business analytics report for: {input}",
    "deploy-project": "Outline deployment steps for: {input}",
    "send-email": "Draft notification email for: {input}",
    "push-notification": "Draft push notification for: {input}",
    "export-files": "List export steps for: {input}",
    "convert-files": "Describe file conversion for: {input}",
    "sync-cloud": "Sync workspace to cloud for: {input}",
    "execute-sdk": "SDK command for: {input}",
    "execute-cli": "CLI steps for: {input}",
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def list_workflows() -> list[dict[str, Any]]:
    return load(WORKFLOWS_KEY, [])


def save_workflow(workflow: dict[str, Any]) -> dict[str, Any]:
    workflows = list_workflows()
    workflow["updatedAt"] = _now()
    idx = next((i for i, w in enumerate(workflows) if w.get("id") == workflow.get("id")), -1)
    if idx >= 0:
        workflows[idx] = workflow
    else:
        workflow.setdefault("createdAt", _now())
        workflows.insert(0, workflow)
    save(WORKFLOWS_KEY, workflows)
    return workflow


def delete_workflow(workflow_id: str) -> bool:
    workflows = [w for w in list_workflows() if w.get("id") != workflow_id]
    save(WORKFLOWS_KEY, workflows)
    return True


def list_executions(workflow_id: str | None = None) -> list[dict[str, Any]]:
    items = load_list(EXECUTIONS_KEY)
    if workflow_id:
        return [e for e in items if e.get("workflowId") == workflow_id]
    return items


def _log_entry(level: str, message: str, node_id: str | None = None, data: dict | None = None) -> dict[str, Any]:
    return {
        "id": f"log-{uuid4().hex[:8]}",
        "at": _now(),
        "level": level,
        "nodeId": node_id,
        "message": message,
        "data": data or {},
    }


async def _run_action(action_id: str, config: dict[str, Any], context: dict[str, Any]) -> str:
    template = ACTION_PROMPTS.get(action_id, "Execute automation action {input}")
    prompt = template.format(input=context.get("input", config.get("prompt", "OmniMind workflow")))
    try:
        from lib.infra.queue_worker import enqueue

        await enqueue("omni:queue:ai", {"action": action_id, "prompt": prompt})
    except Exception as exc:
        logger.warning("Queue enqueue fallback: %s", exc)
    text = await superapp_ai.complete_text(
        message=prompt,
        system_prompt="You are OmniMind Automation Engine. Output concise production steps.",
    )
    return text


async def execute_workflow(
    workflow: dict[str, Any],
    *,
    background: bool = False,
    priority: int = 5,
    context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    execution_id = f"ex-{uuid4().hex[:10]}"
    nodes = workflow.get("nodes", [])
    logs: list[dict[str, Any]] = []
    execution: dict[str, Any] = {
        "id": execution_id,
        "workflowId": workflow.get("id"),
        "status": "running",
        "progress": 0,
        "currentNodeId": None,
        "logs": logs,
        "startedAt": _now(),
        "updatedAt": _now(),
        "finishedAt": None,
        "error": None,
        "priority": priority,
        "background": background,
    }
    append_list_item(EXECUTIONS_KEY, execution, max_items=500)
    ctx = context or {}

    try:
        actionable = [n for n in nodes if n.get("kind") in ("action", "trigger")]
        total = max(len(actionable), 1)
        for i, node in enumerate(actionable):
            nid = node.get("id")
            execution["currentNodeId"] = nid
            execution["progress"] = int((i / total) * 100)
            logs.append(_log_entry("info", f"Running node {node.get('label', nid)}", nid))

            if node.get("kind") == "condition":
                expr = str(node.get("config", {}).get("expression", "true"))
                logs.append(_log_entry("ai", f"Evaluated condition: {expr}", nid))
                continue

            if node.get("kind") == "parallel":
                child_ids = node.get("childIds") or []
                children = [n for n in nodes if n.get("id") in child_ids]
                await asyncio.gather(
                    *[_run_action(c.get("actionId", "execute-sdk"), c.get("config", {}), ctx) for c in children if c.get("actionId")],
                    return_exceptions=True,
                )
                logs.append(_log_entry("info", f"Parallel block completed ({len(children)} branches)", nid))
                continue

            action_id = node.get("actionId")
            if action_id:
                result = await _run_action(action_id, node.get("config", {}), ctx)
                logs.append(_log_entry("ai", result[:500], nid, {"actionId": action_id}))

            execution["updatedAt"] = _now()
            _update_execution(execution_id, execution)

        execution["status"] = "completed"
        execution["progress"] = 100
        execution["finishedAt"] = _now()
        logs.append(_log_entry("info", "Workflow completed"))
    except Exception as exc:
        execution["status"] = "failed"
        execution["error"] = str(exc)
        execution["finishedAt"] = _now()
        logs.append(_log_entry("error", str(exc)))
        logger.exception("Workflow execution failed")

    execution["logs"] = logs
    execution["updatedAt"] = _now()
    _update_execution(execution_id, execution)
    return execution


def _update_execution(execution_id: str, patch: dict[str, Any]) -> None:
    items = load_list(EXECUTIONS_KEY)
    for i, ex in enumerate(items):
        if ex.get("id") == execution_id:
            items[i] = {**ex, **patch}
            save(EXECUTIONS_KEY, items)
            return


def control_execution(execution_id: str, action: str) -> dict[str, Any] | None:
    items = load_list(EXECUTIONS_KEY)
    for ex in items:
        if ex.get("id") != execution_id:
            continue
        status_map = {
            "pause": "paused",
            "resume": "running",
            "retry": "queued",
            "rollback": "rolled-back",
            "cancel": "cancelled",
        }
        if action in status_map:
            ex["status"] = status_map[action]
            ex["updatedAt"] = _now()
            ex.setdefault("logs", []).append(_log_entry("info", f"Control: {action}"))
            save(EXECUTIONS_KEY, items)
            return ex
    return None


def compute_metrics() -> dict[str, Any]:
    items = load_list(EXECUTIONS_KEY)
    total = len(items) or 1
    completed = sum(1 for e in items if e.get("status") == "completed")
    failed = sum(1 for e in items if e.get("status") == "failed")
    durations = []
    for e in items:
        if e.get("finishedAt") and e.get("startedAt"):
            try:
                s = datetime.fromisoformat(e["startedAt"].replace("Z", "+00:00"))
                f = datetime.fromisoformat(e["finishedAt"].replace("Z", "+00:00"))
                durations.append((f - s).total_seconds() * 1000)
            except ValueError:
                pass
    avg_ms = int(sum(durations) / len(durations)) if durations else 0
    ai_logs = sum(1 for e in items for l in e.get("logs", []) if l.get("level") == "ai")
    return {
        "totalExecutions": len(items),
        "successRate": round(completed / total, 3),
        "failureRate": round(failed / total, 3),
        "avgExecutionMs": avg_ms,
        "resourceUsage": {"cpu": None, "queueDepth": 0},
        "aiDecisions": ai_logs,
    }
