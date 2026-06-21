"""
Self-hosted n8n workflow orchestration client.
Triggers workflows via REST webhook / API endpoints configured in .env.
"""

from __future__ import annotations

import logging
from typing import Any, Optional
from uuid import uuid4

import httpx

from config import get_settings

logger = logging.getLogger(__name__)


def _headers() -> dict[str, str]:
    settings = get_settings()
    headers = {"Content-Type": "application/json", "User-Agent": "OmniMind-V11/1.0"}
    if settings.n8n_api_key:
        headers["X-N8N-API-KEY"] = settings.n8n_api_key
    return headers


async def trigger_workflow(
    workflow_key: str,
    payload: dict[str, Any],
    *,
    webhook_path: Optional[str] = None,
) -> dict[str, Any]:
    """
    POST payload to n8n workflow webhook.
    workflow_key maps to N8N_WEBHOOK_{KEY} env vars or explicit webhook_path.
    """
    settings = get_settings()
    base = settings.n8n_base_url.rstrip("/")
    path = webhook_path or settings.n8n_webhook_paths.get(workflow_key, f"/webhook/{workflow_key}")
    if not path.startswith("/"):
        path = f"/{path}"
    url = f"{base}{path}"

    envelope = {
        "event_id": str(uuid4()),
        "source": "omnimind-v11",
        "workflow_key": workflow_key,
        "payload": payload,
    }

    if not settings.n8n_enabled:
        logger.info("n8n disabled — mock trigger workflow=%s", workflow_key)
        return {
            "ok": True,
            "mock": True,
            "workflow_key": workflow_key,
            "event_id": envelope["event_id"],
            "message": "n8n integration disabled (N8N_ENABLED=false)",
        }

    try:
        async with httpx.AsyncClient(timeout=settings.n8n_timeout_seconds) as client:
            response = await client.post(url, json=envelope, headers=_headers())
            response.raise_for_status()
            body: Any = response.json() if response.content else {}
            logger.info("n8n workflow triggered key=%s status=%s", workflow_key, response.status_code)
            return {
                "ok": True,
                "workflow_key": workflow_key,
                "event_id": envelope["event_id"],
                "n8n_status": response.status_code,
                "n8n_response": body,
            }
    except httpx.HTTPError as exc:
        logger.error("n8n trigger failed key=%s url=%s err=%s", workflow_key, url, exc)
        return {
            "ok": False,
            "workflow_key": workflow_key,
            "event_id": envelope["event_id"],
            "error": str(exc),
            "url": url,
            "hint": "Ensure n8n is running and N8N_BASE_URL / webhook paths are set in .env",
        }


async def health_check() -> dict[str, Any]:
    settings = get_settings()
    if not settings.n8n_enabled:
        return {"enabled": False, "connected": False, "base_url": settings.n8n_base_url}
    url = f"{settings.n8n_base_url.rstrip('/')}/healthz"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(url, headers=_headers())
            return {
                "enabled": True,
                "connected": r.status_code < 500,
                "status_code": r.status_code,
                "base_url": settings.n8n_base_url,
            }
    except httpx.HTTPError as exc:
        return {"enabled": True, "connected": False, "base_url": settings.n8n_base_url, "error": str(exc)}
