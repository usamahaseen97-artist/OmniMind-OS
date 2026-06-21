"""n8n workflow orchestration — POST /api/v1/workflows/*"""

from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import Field

from schemas.strict import StrictModel
from services.n8n_client import health_check, trigger_workflow

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/workflows", tags=["workflows"])


class WorkflowTriggerBody(StrictModel):
    workflow_key: str = Field(..., min_length=1, max_length=64)
    payload: dict[str, Any] = Field(default_factory=dict)
    webhook_path: Optional[str] = Field(default=None, max_length=256)


@router.get("/health")
async def workflows_health():
    """Check connectivity to self-hosted n8n instance."""
    return await health_check()


@router.post("/trigger")
async def trigger_n8n_workflow(body: WorkflowTriggerBody) -> dict[str, Any]:
    """
    Trigger a targeted n8n workflow node via secure backend-to-backend REST POST.
    Payload is wrapped with event_id and source metadata for audit trails.
    """
    result = await trigger_workflow(
        body.workflow_key,
        body.payload,
        webhook_path=body.webhook_path,
    )
    if not result.get("ok") and not result.get("mock"):
        logger.error("Workflow trigger failed key=%s", body.workflow_key)
        raise HTTPException(status_code=502, detail=result)
    return result


@router.post("/deploy-staging")
async def deploy_staging_pipeline(body: WorkflowTriggerBody) -> dict[str, Any]:
    """Shortcut — routes builder deploy payloads to n8n staging pipeline."""
    return await trigger_workflow("deploy_staging", body.payload)


@router.post("/notify")
async def notify_pipeline(body: WorkflowTriggerBody) -> dict[str, Any]:
    """Shortcut — third-party notification delivery via n8n."""
    return await trigger_workflow("notifications", body.payload)
