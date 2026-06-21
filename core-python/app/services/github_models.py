"""GitHub Models API provider — free OSS-weight inference via GITHUB_TOKEN."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

GITHUB_MODELS_HEADERS = {
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json",
}


def _auth_headers() -> dict[str, str]:
    cfg = get_settings()
    token = cfg.github_token
    if not token:
        raise RuntimeError("GITHUB_TOKEN not configured")
    return {
        **GITHUB_MODELS_HEADERS,
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": cfg.github_api_version,
    }


def pick_github_model(*, coding: bool = False) -> str:
    cfg = get_settings()
    return cfg.github_models_coder if coding else cfg.github_models_default


async def chat_completion(
    message: str,
    *,
    history: list[dict[str, str]] | None = None,
    system_prompt: str | None = None,
    model: str | None = None,
    max_tokens: int = 900,
) -> dict[str, Any]:
    """Call GitHub Models OpenAI-compatible chat/completions endpoint."""
    cfg = get_settings()
    if not cfg.github_configured():
        raise RuntimeError("GITHUB_TOKEN missing — add models:read PAT to .env")

    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.extend(history or [])
    messages.append({"role": "user", "content": message})

    payload = {
        "model": model or cfg.github_models_default,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.4,
    }

    async with httpx.AsyncClient(timeout=cfg.chat_timeout) as client:
        res = await client.post(
            cfg.github_models_url,
            headers=_auth_headers(),
            json=payload,
        )
        if res.status_code == 429:
            raise RuntimeError("github_models rate limited")
        res.raise_for_status()
        data = res.json()

    try:
        text = str(data["choices"][0]["message"]["content"])
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"github_models malformed response: {data}") from exc

    return {
        "text": text,
        "provider": "github_models",
        "model": payload["model"],
        "usage": data.get("usage"),
    }


async def health_check() -> dict[str, Any]:
    cfg = get_settings()
    if not cfg.github_configured():
        return {"ok": False, "provider": "github_models", "error": "GITHUB_TOKEN not set"}
    try:
        result = await chat_completion(
            "ping",
            system_prompt="Reply with exactly: ok",
            model=cfg.github_models_default,
            max_tokens=8,
        )
        return {"ok": bool(result.get("text")), "provider": "github_models", "model": cfg.github_models_default}
    except Exception as exc:
        logger.warning("github_models health failed: %s", exc)
        return {"ok": False, "provider": "github_models", "error": str(exc)}
