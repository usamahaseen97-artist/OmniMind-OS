"""
OmniCore Mission Control API — V2.0 operating center."""



from __future__ import annotations

import logging

from typing import Any

from fastapi import APIRouter

from lib.enterprise.dependencies import platform_router_dependencies
from lib.mission_control import aggregator
from schemas.platform_enterprise import AgentControlBody, LogAppendBody

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/mission-control",
    tags=["omnicore-mission-control"],
    dependencies=platform_router_dependencies(),
)


@router.get("/dashboard")
def mission_dashboard() -> dict[str, Any]:
    return {"ok": True, "dashboard": aggregator.full_dashboard()}


@router.get("/system")
def mission_system() -> dict[str, Any]:
    return {"ok": True, "system": aggregator.system_snapshot()}


@router.get("/logs")
def mission_logs(source: str | None = None) -> dict[str, Any]:
    return {"ok": True, "logs": aggregator.list_logs(source)}


@router.post("/logs")
def mission_append_log(body: LogAppendBody) -> dict[str, Any]:
    entry = aggregator.append_log(body.source, body.message, body.level)
    return {"ok": True, "entry": entry}


@router.get("/terminals")
def mission_terminals() -> dict[str, Any]:
    return {"ok": True, "lines": aggregator.list_terminals()}


@router.get("/analytics")
def mission_analytics() -> dict[str, Any]:
    return {"ok": True, "series": aggregator.analytics_series()}


@router.get("/security")
def mission_security() -> dict[str, Any]:
    return {"ok": True, "security": aggregator.security_snapshot()}


@router.post("/agents/{agent_id}/{action}")
def mission_agent_control(
    agent_id: str, action: str, body: AgentControlBody | None = None
) -> dict[str, Any]:
    aggregator.append_log("ai", f"Agent {agent_id}: {action}", "info")
    return {"ok": True, "agentId": agent_id, "action": action}


@router.post("/actions/{action_id}")
def mission_quick_action(action_id: str) -> dict[str, Any]:
    aggregator.append_log("backend", f"Quick action executed: {action_id}", "info")
    return {"ok": True, "action": action_id}
