"""True SSE token streaming for OmniForge chat — OpenAI-compatible providers."""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncIterator

import httpx

from app.config import get_settings
from app.services.language_orchestration import compose_system_prompt, strip_leading_language_prefix
from app.services.model_router import _provider_chain, call_core_python_providers

logger = logging.getLogger(__name__)


async def _stream_openai_compat(
    *,
    api_url: str,
    api_key: str,
    model: str,
    message: str,
    history: list[dict[str, str]],
    system_prompt: str,
) -> AsyncIterator[str]:
    messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": message}]
    cfg = get_settings()
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 900,
        "temperature": 0.4,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=cfg.omniforge_chat_timeout) as client:
        async with client.stream("POST", api_url, headers=headers, json=payload) as res:
            res.raise_for_status()
            async for raw_line in res.aiter_lines():
                if not raw_line or not raw_line.startswith("data:"):
                    continue
                data = raw_line[5:].strip()
                if not data or data == "[DONE]":
                    continue
                try:
                    chunk = json.loads(data)
                    delta = chunk["choices"][0].get("delta", {}).get("content")
                    if delta:
                        yield str(delta)
                except (KeyError, IndexError, json.JSONDecodeError):
                    continue


async def _yield_lines(text: str) -> AsyncIterator[str]:
    """Fallback — emit line-by-line immediately (no artificial delay)."""
    if not text:
        yield ""
        return
    for line in text.splitlines(keepends=True):
        yield line


async def stream_chat_tokens(
    message: str,
    *,
    history: list[dict[str, str]] | None = None,
    provider_hint: str | None = None,
    use_free_pipeline: bool = False,
    coding: bool = False,
) -> AsyncIterator[dict[str, Any]]:
    """
    Async generator yielding SSE-ready dict events:
    {type: start|token|done|error, ...}
    """
    history = history or []
    clean = strip_leading_language_prefix(message)
    system_prompt = compose_system_prompt(clean)
    cfg = get_settings()

    free_only = use_free_pipeline or (provider_hint or "").lower().strip() in (
        "free",
        "opensource",
        "open-source",
        "github_models",
    )

    chain = ["free_pipeline"] if free_only else _provider_chain(provider_hint)
    if not chain:
        yield {"type": "error", "error": "no providers configured"}
        return

    last_error: str | None = None
    for provider in chain:
        if provider == "free_pipeline":
            try:
                routed = await call_core_python_providers(
                    clean, history=history, system_prompt=system_prompt, free_only=True, coding=coding,
                )
                text = str(routed.get("text", ""))
                if text.strip():
                    yield {"type": "start", "provider": str(routed.get("provider", "free_pipeline"))}
                    async for line in _yield_lines(text):
                        yield {"type": "token", "token": line}
                    yield {
                        "type": "done",
                        "provider": str(routed.get("provider", "free_pipeline")),
                        "routing": routed.get("routing"),
                        "text": text,
                    }
                    return
            except Exception as exc:
                last_error = str(exc)
                continue

        try:
            yield {"type": "start", "provider": provider}
            streamed = False
            parts: list[str] = []

            if provider == "groq" and cfg.groq_key():
                async for tok in _stream_openai_compat(
                    api_url="https://api.groq.com/openai/v1/chat/completions",
                    api_key=cfg.groq_key() or "",
                    model=cfg.groq_model,
                    message=clean,
                    history=history,
                    system_prompt=system_prompt,
                ):
                    streamed = True
                    parts.append(tok)
                    yield {"type": "token", "token": tok}
            elif provider == "openai" and cfg.openai_key():
                async for tok in _stream_openai_compat(
                    api_url="https://api.openai.com/v1/chat/completions",
                    api_key=cfg.openai_key() or "",
                    model=cfg.openai_model,
                    message=clean,
                    history=history,
                    system_prompt=system_prompt,
                ):
                    streamed = True
                    parts.append(tok)
                    yield {"type": "token", "token": tok}
            elif provider == "local" and cfg.local_llm_endpoint():
                base = cfg.local_llm_endpoint() or ""
                url = base if base.endswith("/chat/completions") else f"{base.rstrip('/')}/chat/completions"
                headers: dict[str, str] = {"Content-Type": "application/json"}
                if cfg.local_llm_api_key and cfg.local_llm_api_key != "lm-studio":
                    headers["Authorization"] = f"Bearer {cfg.local_llm_api_key}"
                async for tok in _stream_openai_compat(
                    api_url=url,
                    api_key=cfg.local_llm_api_key or "local",
                    model=cfg.local_llm_model,
                    message=clean,
                    history=history,
                    system_prompt=system_prompt,
                ):
                    streamed = True
                    parts.append(tok)
                    yield {"type": "token", "token": tok}

            if streamed and parts:
                text = "".join(parts)
                yield {"type": "done", "provider": provider, "routing": "stream", "text": text}
                return

            # Blocking fallback then line-yield
            from app.services.model_router import generate_chat_reply

            routed = await generate_chat_reply(
                message,
                history=history,
                provider_hint=provider,
                use_free_pipeline=False,
                coding=coding,
            )
            text = str(routed.get("text", ""))
            if text.strip():
                async for line in _yield_lines(text):
                    yield {"type": "token", "token": line}
                yield {
                    "type": "done",
                    "provider": str(routed.get("provider", provider)),
                    "routing": routed.get("routing"),
                    "text": text,
                }
                return
        except Exception as exc:
            last_error = str(exc)
            logger.warning("stream provider %s failed: %s", provider, exc)

    yield {"type": "error", "error": last_error or "all providers failed"}
