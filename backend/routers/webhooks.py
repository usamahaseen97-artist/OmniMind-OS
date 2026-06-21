"""
Webhook ingestion engine — n8n / Make.com / custom automation triggers.
Verifies HMAC signatures on inbound payloads before orchestration dispatch.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, Request, status

from config import get_settings
from schemas.strict import StrictModel
from services.n8n_client import trigger_workflow
from services.redis_cache import cache_set_json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


class WebhookAck(StrictModel):
    ok: bool = True
    event_id: str
    provider: str
    received_at: str


def _utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _verify_hmac_sha256(secret: str, body: bytes, signature: str) -> bool:
    if not secret or not signature:
        return False
    sig = signature.strip()
    if sig.startswith("sha256="):
        sig = sig[7:]
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig)


def _verify_n8n_signature(secret: str, body: bytes, header: Optional[str]) -> bool:
    if not header:
        return False
    return _verify_hmac_sha256(secret, body, header)


def _verify_make_signature(secret: str, body: bytes, header: Optional[str]) -> bool:
    """Make.com commonly sends base64 or hex HMAC — accept sha256= prefix form."""
    if not header:
        return False
    return _verify_hmac_sha256(secret, body, header)


async def _ingest(
    *,
    provider: str,
    body: bytes,
    payload: dict[str, Any],
    signature_ok: bool,
) -> WebhookAck:
    if not signature_ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")

    settings = get_settings()
    event_id = str(uuid.uuid4())
    envelope = {
        "event_id": event_id,
        "provider": provider,
        "received_at": _utc_iso(),
        "payload": payload,
        "source": "omnimind-webhook-ingestion",
    }

    await cache_set_json(f"webhook:event:{event_id}", envelope, ttl_seconds=86400)

    workflow_key = str(payload.get("workflow_key") or payload.get("workflow") or "notifications")
    if settings.n8n_enabled and payload.get("forward_to_n8n", True):
        try:
            await trigger_workflow(workflow_key, {**payload, "omnimind_event_id": event_id})
        except Exception as exc:
            logger.warning("n8n forward failed event=%s: %s", event_id, exc)

    logger.info("Webhook ingested provider=%s event=%s", provider, event_id)
    return WebhookAck(event_id=event_id, provider=provider, received_at=envelope["received_at"])


@router.get("/health")
async def webhooks_health() -> dict[str, Any]:
    settings = get_settings()
    return {
        "ok": True,
        "signature_required": bool(settings.webhook_signing_secret),
        "providers": ["n8n", "make", "generic"],
    }


@router.post("/ingest/n8n", response_model=WebhookAck)
async def ingest_n8n(
    request: Request,
    x_n8n_signature: Optional[str] = Header(default=None, alias="X-N8N-Signature"),
    x_hub_signature_256: Optional[str] = Header(default=None, alias="X-Hub-Signature-256"),
):
    body = await request.body()
    settings = get_settings()
    secret = settings.webhook_signing_secret or settings.n8n_api_key
    sig_header = x_n8n_signature or x_hub_signature_256
    signature_ok = _verify_n8n_signature(secret, body, sig_header) if secret else True

    try:
        payload = json.loads(body.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON body") from exc

    return await _ingest(provider="n8n", body=body, payload=payload, signature_ok=signature_ok)


@router.post("/ingest/make", response_model=WebhookAck)
async def ingest_make(
    request: Request,
    x_make_signature: Optional[str] = Header(default=None, alias="X-Make-Signature"),
    x_signature: Optional[str] = Header(default=None, alias="X-Signature"),
):
    body = await request.body()
    settings = get_settings()
    secret = settings.webhook_signing_secret
    sig_header = x_make_signature or x_signature
    signature_ok = _verify_make_signature(secret, body, sig_header) if secret else True

    try:
        payload = json.loads(body.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON body") from exc

    return await _ingest(provider="make", body=body, payload=payload, signature_ok=signature_ok)


@router.post("/ingest/{provider}", response_model=WebhookAck)
async def ingest_generic(
    provider: str,
    request: Request,
    x_omnimind_signature: Optional[str] = Header(default=None, alias="X-OmniMind-Signature"),
    x_hub_signature_256: Optional[str] = Header(default=None, alias="X-Hub-Signature-256"),
):
    body = await request.body()
    settings = get_settings()
    secret = settings.webhook_signing_secret
    sig_header = x_omnimind_signature or x_hub_signature_256
    signature_ok = _verify_hmac_sha256(secret, body, sig_header or "") if secret else True

    try:
        payload = json.loads(body.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON body") from exc

    return await _ingest(provider=provider[:32], body=body, payload=payload, signature_ok=signature_ok)
