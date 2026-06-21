"""Free / open-source provider router with hot-swap fallback chain."""

from __future__ import annotations

import logging
import urllib.parse
from typing import Any

import httpx

from app.config import get_settings
from app.services import github_models
from app.services.community_api_sync import community_nodes

logger = logging.getLogger(__name__)

RATE_LIMIT_MARKERS = ("rate limit", "429", "quota", "too many requests")


def _is_rate_or_connection_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    if any(m in msg for m in RATE_LIMIT_MARKERS):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code in (429, 502, 503, 504)
    if isinstance(exc, (httpx.ConnectError, httpx.TimeoutException)):
        return True
    return False


async def _call_openai_compat_node(
    node: dict[str, Any],
    message: str,
    history: list[dict[str, str]],
    system_prompt: str,
) -> str:
    url = str(node.get("url", "")).strip()
    if not url:
        raise RuntimeError("community node missing url")

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    headers: dict[str, str] = {"Content-Type": "application/json"}
    api_key = node.get("api_key") or ""
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    payload: dict[str, Any] = {
        "model": node.get("model") or "auto",
        "messages": messages,
        "max_tokens": 900,
        "temperature": 0.4,
    }

    cfg = get_settings()
    async with httpx.AsyncClient(timeout=cfg.chat_timeout) as client:
        res = await client.post(url, headers=headers, json=payload)
        if res.status_code == 429:
            raise RuntimeError(f"{node['id']} rate limited")
        res.raise_for_status()
        data = res.json()
    return str(data["choices"][0]["message"]["content"])


async def _call_text_get_node(
    node: dict[str, Any],
    message: str,
    system_prompt: str,
) -> str:
    base = str(node.get("url", "")).rstrip("/")
    prompt = f"{system_prompt}\n\nUser: {message}"
    encoded = urllib.parse.quote(prompt[:4000])
    cfg = get_settings()
    async with httpx.AsyncClient(timeout=cfg.chat_timeout) as client:
        res = await client.get(f"{base}/{encoded}")
        res.raise_for_status()
        return res.text.strip()


async def _dispatch_node(
    node: dict[str, Any],
    message: str,
    history: list[dict[str, str]],
    system_prompt: str,
    *,
    coding: bool = False,
) -> dict[str, Any]:
    ntype = node.get("type", "")
    if ntype == "github_models":
        model = github_models.pick_github_model(coding=coding)
        result = await github_models.chat_completion(
            message,
            history=history,
            system_prompt=system_prompt,
            model=model,
        )
        return {**result, "node_id": node.get("id", "github_models")}
    if ntype == "openai_compat":
        text = await _call_openai_compat_node(node, message, history, system_prompt)
        return {"text": text, "provider": "community", "node_id": node.get("id"), "model": node.get("model")}
    if ntype == "text_get":
        text = await _call_text_get_node(node, message, system_prompt)
        return {"text": text, "provider": "community", "node_id": node.get("id"), "model": "text_get"}
    raise RuntimeError(f"unknown community node type: {ntype}")


def free_provider_chain(*, free_only: bool = False) -> list[dict[str, Any]]:
    """Ordered nodes: GitHub Models first, then synced community directory."""
    nodes = community_nodes()
    if free_only:
        return nodes
    return nodes


async def generate_with_fallback(
    message: str,
    *,
    history: list[dict[str, str]] | None = None,
    system_prompt: str = "",
    free_only: bool = False,
    coding: bool = False,
    cloud_chain: list[str] | None = None,
    cloud_dispatch=None,
) -> dict[str, Any]:
    """
    Route generation:
    - free_only=True → GitHub Models + community nodes only
    - else → try cloud_chain first; on rate-limit/connection errors hot-swap to free nodes
    """
    history = history or []
    errors: list[str] = []

    if not free_only and cloud_chain and cloud_dispatch:
        for provider in cloud_chain:
            try:
                text = await cloud_dispatch(provider, message, history, system_prompt)
                if str(text).strip():
                    return {
                        "text": str(text),
                        "provider": provider,
                        "routing": "cloud",
                        "chain": cloud_chain,
                    }
            except Exception as exc:
                errors.append(f"{provider}: {exc}")
                if _is_rate_or_connection_error(exc):
                    logger.warning("cloud provider %s failed — hot-swapping to free chain", provider)
                    break
                logger.warning("cloud provider %s failed: %s", provider, exc)

    nodes = free_provider_chain(free_only=True)
    for node in nodes:
        try:
            result = await _dispatch_node(node, message, history, system_prompt, coding=coding)
            if str(result.get("text", "")).strip():
                return {
                    **result,
                    "routing": "free_pipeline",
                    "chain": [n.get("id") for n in nodes],
                    "fallback_errors": errors,
                }
        except Exception as exc:
            errors.append(f"{node.get('id')}: {exc}")
            logger.warning("free node %s failed: %s", node.get("id"), exc)

    return {
        "text": "All free/open-source providers failed. Check GITHUB_TOKEN and community node health.",
        "provider": "exhausted",
        "routing": "exhausted",
        "error": "; ".join(errors[-6:]),
        "chain": [n.get("id") for n in nodes],
    }


async def provider_status() -> dict[str, Any]:
    from app.services.community_api_sync import sync_status

    gh = await github_models.health_check()
    return {
        "github_models": gh,
        "community": sync_status(),
        "free_chain": [n.get("id") for n in community_nodes()],
        "github_token_configured": get_settings().github_configured(),
    }
