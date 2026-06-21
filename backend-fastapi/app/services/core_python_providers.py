"""Delegate free/open-source generation to core-python provider router."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


async def call_core_python_providers(
    message: str,
    *,
    history: list[dict[str, str]] | None = None,
    system_prompt: str = "",
    free_only: bool = False,
    coding: bool = False,
) -> dict[str, Any]:
    cfg = get_settings()
    base = cfg.core_python_url.rstrip("/")
    timeout = cfg.omniforge_chat_timeout

    headers: dict[str, str] = {"Content-Type": "application/json"}
    if free_only:
        headers["X-OmniForge-Free-Pipeline"] = "1"

    endpoint = f"{base}/api/v1/providers/chat/free" if free_only else f"{base}/api/v1/providers/chat"

    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.post(
            endpoint,
            headers=headers,
            json={
                "message": message,
                "history": history or [],
                "system_prompt": system_prompt,
                "free_only": free_only,
                "coding": coding,
            },
        )
        if res.status_code >= 400:
            raise RuntimeError(f"core-python providers {res.status_code}: {res.text[:200]}")
        return res.json()


async def provider_status() -> dict[str, Any]:
    cfg = get_settings()
    base = cfg.core_python_url.rstrip("/")
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(f"{base}/api/v1/providers/status")
            res.raise_for_status()
            return res.json()
    except Exception as exc:
        logger.warning("core-python provider status unavailable: %s", exc)
        return {"ok": False, "error": str(exc)}
