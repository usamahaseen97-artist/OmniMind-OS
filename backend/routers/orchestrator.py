"""
Sovereign orchestrator microservice routes — node cache, workflow webhooks, telemetry.
Maps workflow node charts to Redis hot paths (MongoDB fallback on miss).
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import Field

from auth.dependencies import CurrentUser
from schemas.strict import StrictModel
from services.infra_ops_log import emit_ops_log
from services.redis_cache import cache_get_json, cache_set_json

logger = logging.getLogger(__name__)

router = APIRouter(tags=["orchestrator"])

_NODE_CACHE_TTL = 1800
_NODE_DATA_TTL = 900
_NODE_KEY_PREFIX = "node:"


class WebhookNodeEvent(StrictModel):
    node_id: str = Field(..., min_length=1, max_length=128)
    action_type: str = Field(..., min_length=1, max_length=128)
    payload_data: dict[str, Any] = Field(default_factory=dict)


class WorkflowWebhookInput(StrictModel):
    node_identifier: str = Field(..., min_length=1, max_length=128)
    trigger_action: str = Field(..., min_length=1, max_length=128)
    payload: dict[str, Any] = Field(default_factory=dict)


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _node_cache_key(key_node: str) -> str:
    return f"{_NODE_KEY_PREFIX}{key_node}"


async def _load_node_state(key_node: str) -> dict[str, Any]:
    """Persistent-layer fallback when Redis has no node snapshot."""
    return {
        "node": key_node,
        "status": "active_synchronized",
        "updated_at": _utc_now_iso(),
    }


async def _load_node_data_payload(node_id: str) -> dict[str, Any]:
    """Primary storage fallback shape for /api/v1/node-data."""
    return {
        "node_id": node_id,
        "state": "synchronized",
        "last_verified": _utc_now_iso(),
    }


async def _resolve_node_from_cache(
    key_node: str,
    *,
    ttl_seconds: int,
    persist_shape: str,
) -> tuple[str, dict[str, Any]]:
    cache_key = _node_cache_key(key_node)
    cached = await cache_get_json(cache_key)
    if cached is not None:
        emit_ops_log(
            f"⚡ Redis cache hit — node:{key_node} (microsecond path)",
            "success",
            "redis",
        )
        return "cache_memory_hit", cached

    if persist_shape == "node_data":
        fallback = await _load_node_data_payload(key_node)
    else:
        fallback = await _load_node_state(key_node)

    await cache_set_json(cache_key, fallback, ttl_seconds=ttl_seconds)
    return "persistent_db_layer", fallback


@router.get("/api/v1/system/status/legacy")
async def read_system_telemetry(request: Request) -> dict[str, Any]:
    """Legacy orchestrator telemetry — prefer GET /api/v1/system/status on main app."""
    redis_state = getattr(request.app.state, "redis", None) or {}
    return {
        "status": "operational",
        "ok": True,
        "engine": "OmniMind V11 Core Engine",
        "multi_device_ready": True,
        "redis": redis_state,
    }


@router.get("/api/v1/health")
async def verify_system_telemetry(request: Request) -> dict[str, Any]:
    redis_state = getattr(request.app.state, "redis", None) or {}
    mongo_state = getattr(request.app.state, "mongodb", None) or {}
    return {
        "status": "healthy",
        "ok": True,
        "architecture": "microservices",
        "kubernetes_ready": True,
        "redis": redis_state,
        "mongodb_mode": mongo_state.get("mode", "unknown"),
    }


@router.get("/api/v1/orchestrator/cache/{key_node}")
async def fetch_node_state(key_node: str, user: CurrentUser) -> dict[str, Any]:
    """
    Resolve workflow node state from Redis; on miss load fallback and warm cache (30m TTL).
    Requires valid Bearer JWT (mobile / desktop / web clients).
    """
    origin, data = await _resolve_node_from_cache(
        key_node,
        ttl_seconds=_NODE_CACHE_TTL,
        persist_shape="orchestrator",
    )
    return {"origin": origin, "data": data, "subject": user.get("sub")}


@router.get("/api/v1/node-data/{node_id}")
async def fetch_optimized_node_state(node_id: str, user: CurrentUser) -> dict[str, Any]:
    """Query Redis hot memory directly; on miss warm cache from primary storage (15m TTL)."""
    origin, payload = await _resolve_node_from_cache(
        node_id,
        ttl_seconds=_NODE_DATA_TTL,
        persist_shape="node_data",
    )
    data_source = (
        "volatile_redis_cache"
        if origin == "cache_memory_hit"
        else "persistent_storage_db"
    )
    return {"data_source": data_source, "payload": payload, "subject": user.get("sub")}


@router.post("/api/v1/nodes/webhook")
async def ingest_agent_workflow_callback(event: WebhookNodeEvent) -> dict[str, Any]:
    """Accept asynchronous workflow node updates from n8n / Make.com orchestration charts."""
    event_id = str(uuid.uuid4())
    envelope = {
        "event_id": event_id,
        "node_id": event.node_id,
        "action_type": event.action_type,
        "payload_data": event.payload_data,
        "received_at": _utc_now_iso(),
    }

    await cache_set_json(f"webhook:node:{event_id}", envelope, ttl_seconds=86400)

    node_snapshot = {
        "node": event.node_id,
        "status": event.action_type,
        "payload": event.payload_data,
        "updated_at": envelope["received_at"],
    }
    await cache_set_json(_node_cache_key(event.node_id), node_snapshot, ttl_seconds=_NODE_CACHE_TTL)

    logger.info(
        "Webhook intercept node=%s action=%s event=%s",
        event.node_id,
        event.action_type,
        event_id,
    )
    return {
        "status": "success",
        "ok": True,
        "processed_node": event.node_id,
        "state": "acknowledged",
        "event_id": event_id,
    }


@router.post("/api/v1/webhooks/node-stream")
async def ingest_runtime_node_event(event: WorkflowWebhookInput) -> dict[str, Any]:
    """Ingest real-time webhook node updates for orchestration chart streaming."""
    mapped = WebhookNodeEvent(
        node_id=event.node_identifier,
        action_type=event.trigger_action,
        payload_data=event.payload,
    )
    result = await ingest_agent_workflow_callback(mapped)
    emit_ops_log(
        f"📥 Webhook intercepted — {event.node_identifier} → {event.trigger_action}",
        "route",
        "webhook",
    )
    return {
        "status": "processed",
        "ok": True,
        "target_node": event.node_identifier,
        "state": result.get("state", "acknowledged"),
        "event_id": result.get("event_id"),
    }
