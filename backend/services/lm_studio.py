"""
LM Studio — OpenAI-compatible local API (default http://127.0.0.1:1234/v1).
Load a model in LM Studio and enable the local server before chatting.
"""

from __future__ import annotations

import json
import logging
from typing import AsyncGenerator, Optional

import httpx

from config import get_settings
from services.lm_auth import auth_headers, lm_studio_auth_hint, resolve_lm_api_key

# Re-export for legacy imports (gemini_stream, etc.)
__all__ = ["auth_headers", "check_connection", "stream_lm_studio", "is_enabled", "resolve_model_id"]

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are OmniMind V11 running on local Llama via LM Studio.
Respond clearly in markdown. Be helpful and accurate.

**POLYGLOT RULE:** Match the user's language AND script. Roman Latin input → Roman Latin output only.
Never auto-switch to Devanagari or Nastaliq unless explicitly requested.

Keep replies concise (1–4 short paragraphs). If web search context is provided below, use it in your answer. Founder: USAMA HASEEN."""

_cached_model_id: Optional[str] = None


def base_url() -> str:
    return get_settings().effective_local_llm_base_url


def is_enabled() -> bool:
    settings = get_settings()
    if settings.llm_provider == "gemini":
        return False
    return settings.llm_provider in ("lm_studio", "local", "auto", "") or bool(
        settings.lm_studio_url or settings.local_llm_url
    )


async def check_connection() -> dict:
    """Ping LM Studio and list loaded models."""
    if not is_enabled():
        return {"connected": False, "enabled": False, "reason": "LLM_PROVIDER=gemini"}

    url = f"{base_url()}/models"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url, headers=auth_headers())
            if res.status_code == 401 and not resolve_lm_api_key():
                return {
                    "connected": False,
                    "enabled": True,
                    "base_url": base_url(),
                    "error": res.text[:400],
                    "hint": lm_studio_auth_hint(),
                    "auth_required": True,
                }
            res.raise_for_status()
            data = res.json()
        models = data.get("data", [])
        ids = [m.get("id") for m in models if m.get("id")]
        return {
            "connected": True,
            "enabled": True,
            "base_url": base_url(),
            "models": ids,
            "model_count": len(ids),
            "chat_model": get_settings().effective_local_llm_model,
        }
    except httpx.HTTPStatusError as exc:
        hint = lm_studio_auth_hint()
        if exc.response.status_code == 401:
            hint = (
                "401 Unauthorized — set LOCAL_LLM_API_KEY to your sk-lm-* token from "
                "LM Studio → Server → Manage Tokens, or disable server API auth."
            )
        return {
            "connected": False,
            "enabled": True,
            "base_url": base_url(),
            "error": str(exc),
            "hint": hint,
            "status_code": exc.response.status_code,
        }
    except Exception as exc:
        return {
            "connected": False,
            "enabled": True,
            "base_url": base_url(),
            "error": str(exc),
            "hint": "Open LM Studio → load meta-llama-3.1-8b-instruct → Start Server (port 1234)",
        }


async def resolve_model_id() -> str:
    """Use LM_STUDIO_MODEL env or first model from /v1/models."""
    global _cached_model_id
    settings = get_settings()

    if settings.effective_local_llm_model:
        return settings.effective_local_llm_model

    if _cached_model_id:
        return _cached_model_id

    status = await check_connection()
    models = status.get("models") or []
    if models:
        _cached_model_id = models[0]
        return _cached_model_id

    return "local-model"


async def stream_lm_studio(
    message: str,
    history: list[dict],
    extra_context: str = "",
    *,
    system_prompt: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> AsyncGenerator[str, None]:
    model = await resolve_model_id()
    url = f"{base_url()}/chat/completions"
    sys_content = system_prompt or SYSTEM_PROMPT

    messages: list[dict] = [{"role": "system", "content": sys_content}]
    for turn in history[-16:]:
        role = turn.get("role", "user")
        if role == "assistant":
            role = "assistant"
        elif role not in ("user", "system"):
            role = "user"
        messages.append({"role": role, "content": turn.get("content", "")})

    user_content = message
    if extra_context:
        user_content = f"{extra_context}\n\n---\n\nUser: {message}"
    messages.append({"role": "user", "content": user_content})

    body = {
        "model": model,
        "messages": messages,
        "stream": True,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            async with client.stream(
                "POST", url, json=body, headers=auth_headers()
            ) as response:
                if response.status_code >= 400:
                    return
                async for line in response.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = line[5:].strip() if line.startswith("data: ") else line.strip()
                    if not data or data == "[DONE]":
                        continue
                    try:
                        chunk = json.loads(data)
                        choice = chunk.get("choices", [{}])[0]
                        delta = choice.get("delta", {})
                        content = delta.get("content")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue
    except (httpx.ConnectError, httpx.TimeoutException, OSError):
        return
    except Exception as exc:
        logger.debug("LM Studio stream ended: %s", exc)
        return
