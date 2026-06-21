from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from app.config import get_settings, settings
from app.services.language_orchestration import (
    compose_system_prompt,
    strip_leading_language_prefix,
)
from app.services.core_python_providers import call_core_python_providers

logger = logging.getLogger(__name__)


def _provider_chain(provider_hint: str | None = None) -> list[str]:
    cfg = get_settings()
    hint = (provider_hint or "auto").lower().strip()
    configured = cfg.configured_providers()

    if hint == "gemini" and cfg.gemini_key():
        return ["gemini"]
    if hint in ("groq", "grok") and cfg.groq_key():
        return ["groq"]
    if hint == "openai" and cfg.openai_key():
        return ["openai"]
    if hint == "deepseek" and cfg.deepseek_key():
        return ["deepseek"]
    if hint == "anthropic" and cfg.anthropic_key():
        return ["anthropic"]
    if hint in ("local", "lm_studio", "ollama"):
        chain: list[str] = []
        if hint in ("local", "lm_studio") and cfg.local_llm_endpoint():
            chain.append("local")
        if hint == "ollama" and cfg.ollama_endpoint():
            chain.append("ollama")
        return chain or configured
    if hint in ("free", "opensource", "open-source", "github_models"):
        return ["free_pipeline"]

    if not configured:
        return []

    local_first = cfg.omniforge_local_first
    cloud_order = ["gemini", "groq", "openai", "deepseek", "anthropic"]
    local_order = ["local", "ollama"]

    chain: list[str] = []
    if local_first:
        for pid in local_order:
            if pid in configured:
                chain.append(pid)
        for pid in cloud_order:
            if pid in configured:
                chain.append(pid)
    else:
        for pid in cloud_order:
            if pid in configured:
                chain.append(pid)
        for pid in local_order:
            if pid in configured:
                chain.append(pid)

    seen: set[str] = set()
    out: list[str] = []
    for p in chain:
        if p not in seen:
            seen.add(p)
            out.append(p)
    return out


async def _call_local(message: str, history: list[dict[str, str]], system_prompt: str) -> str:
    cfg = get_settings()
    base = cfg.local_llm_endpoint()
    if not base:
        raise RuntimeError("LOCAL_LLM_URL not configured")
    messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": message}]
    headers: dict[str, str] = {}
    if cfg.local_llm_api_key and cfg.local_llm_api_key != "lm-studio":
        headers["Authorization"] = f"Bearer {cfg.local_llm_api_key}"
    timeout = cfg.omniforge_chat_timeout
    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.post(
            f"{base.rstrip('/')}/chat/completions",
            headers=headers,
            json={
                "model": cfg.local_llm_model,
                "messages": messages,
                "temperature": 0.4,
                "max_tokens": 900,
            },
        )
        res.raise_for_status()
        data = res.json()
        return str(data["choices"][0]["message"]["content"])


async def _call_ollama(message: str, history: list[dict[str, str]], system_prompt: str) -> str:
    cfg = get_settings()
    base = cfg.ollama_endpoint() or "http://127.0.0.1:11434"
    prompt = (
        f"system: {system_prompt}\n"
        + "\n".join(f"{m['role']}: {m['content']}" for m in history)
        + f"\nuser: {message}\nassistant:"
    )
    timeout = cfg.omniforge_chat_timeout
    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.post(
            f"{base.rstrip('/')}/api/generate",
            json={"model": cfg.ollama_model, "prompt": prompt, "stream": False},
        )
        res.raise_for_status()
        return str(res.json().get("response", ""))


async def _call_openai_compat(
    *,
    api_url: str,
    api_key: str,
    model: str,
    message: str,
    history: list[dict[str, str]],
    system_prompt: str,
) -> str:
    messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": message}]
    timeout = get_settings().omniforge_chat_timeout
    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.post(
            api_url,
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": model, "messages": messages, "max_tokens": 900, "temperature": 0.4},
        )
        res.raise_for_status()
        return str(res.json()["choices"][0]["message"]["content"])


async def _call_openai(message: str, history: list[dict[str, str]], system_prompt: str) -> str:
    cfg = get_settings()
    key = cfg.openai_key()
    if not key:
        raise RuntimeError("OPENAI_API_KEY missing")
    return await _call_openai_compat(
        api_url="https://api.openai.com/v1/chat/completions",
        api_key=key,
        model=cfg.openai_model,
        message=message,
        history=history,
        system_prompt=system_prompt,
    )


async def _call_groq(message: str, history: list[dict[str, str]], system_prompt: str) -> str:
    cfg = get_settings()
    key = cfg.groq_key()
    if not key:
        raise RuntimeError("GROQ_API_KEY missing")
    return await _call_openai_compat(
        api_url="https://api.groq.com/openai/v1/chat/completions",
        api_key=key,
        model=cfg.groq_model,
        message=message,
        history=history,
        system_prompt=system_prompt,
    )


async def _call_gemini(message: str, history: list[dict[str, str]], system_prompt: str) -> str:
    cfg = get_settings()
    api_key = cfg.gemini_key()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY missing")
    model = cfg.gemini_model
    contents = [
        {"role": "user" if m["role"] == "user" else "model", "parts": [{"text": m["content"]}]}
        for m in history
    ]
    contents.append({"role": "user", "parts": [{"text": message}]})
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    timeout = cfg.omniforge_chat_timeout
    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.post(
            url,
            json={
                "systemInstruction": {"parts": [{"text": system_prompt}]},
                "contents": contents,
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 900},
            },
        )
        res.raise_for_status()
        data = res.json()
        return str(data["candidates"][0]["content"]["parts"][0]["text"])


async def _call_deepseek(message: str, history: list[dict[str, str]], system_prompt: str) -> str:
    cfg = get_settings()
    key = cfg.deepseek_key()
    if not key:
        raise RuntimeError("DEEPSEEK_API_KEY missing")
    return await _call_openai_compat(
        api_url="https://api.deepseek.com/chat/completions",
        api_key=key,
        model=cfg.deepseek_model,
        message=message,
        history=history,
        system_prompt=system_prompt,
    )


async def _call_anthropic(message: str, history: list[dict[str, str]], system_prompt: str) -> str:
    cfg = get_settings()
    api_key = cfg.anthropic_key()
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY missing")
    messages = history + [{"role": "user", "content": message}]
    timeout = cfg.omniforge_chat_timeout
    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": cfg.anthropic_model,
                "max_tokens": 900,
                "system": system_prompt,
                "messages": messages,
            },
        )
        res.raise_for_status()
        data = res.json()
        return str(data["content"][0]["text"])


async def _dispatch(provider: str, message: str, history: list[dict[str, str]], system_prompt: str) -> str:
    if provider == "local":
        return await _call_local(message, history, system_prompt)
    if provider == "ollama":
        return await _call_ollama(message, history, system_prompt)
    if provider == "openai":
        return await _call_openai(message, history, system_prompt)
    if provider == "groq":
        return await _call_groq(message, history, system_prompt)
    if provider == "gemini":
        return await _call_gemini(message, history, system_prompt)
    if provider == "deepseek":
        return await _call_deepseek(message, history, system_prompt)
    if provider == "anthropic":
        return await _call_anthropic(message, history, system_prompt)
    raise RuntimeError(f"unknown provider: {provider}")


async def generate_chat_reply(
    message: str,
    *,
    history: list[dict[str, str]] | None = None,
    provider_hint: str | None = None,
    use_free_pipeline: bool = False,
    coding: bool = False,
) -> dict[str, Any]:
    history = history or []
    clean_message = strip_leading_language_prefix(message)
    system_prompt = compose_system_prompt(clean_message)
    free_only = use_free_pipeline or (provider_hint or "").lower().strip() in (
        "free",
        "opensource",
        "open-source",
        "github_models",
    )

    if free_only:
        try:
            routed = await call_core_python_providers(
                clean_message,
                history=history,
                system_prompt=system_prompt,
                free_only=True,
                coding=coding,
            )
            text = str(routed.get("text", ""))
            if text.strip():
                return {
                    "text": text,
                    "provider": str(routed.get("provider", "free_pipeline")),
                    "chain": routed.get("chain", []),
                    "routing": str(routed.get("routing", "free_pipeline")),
                    "node_id": routed.get("node_id"),
                }
        except Exception as exc:
            logger.warning("free pipeline via core-python failed: %s", exc)

    chain = _provider_chain(provider_hint if not free_only else "free")
    timeout = get_settings().omniforge_chat_timeout
    last_error: str | None = None

    if not chain and not free_only:
        return {
            "text": (
                "No AI provider keys were loaded. Ensure backend/.env contains GEMINI_API_KEY, "
                "GROQ_API_KEY, LOCAL_LLM_URL, or similar, then restart backend-fastapi on port 8003."
            ),
            "provider": "unconfigured",
            "chain": [],
            "routing": "unconfigured",
        }

    rate_limited = False
    for provider in chain:
        if provider == "free_pipeline":
            continue
        try:
            text = await asyncio.wait_for(
                _dispatch(provider, clean_message, history, system_prompt),
                timeout=timeout,
            )
            if not str(text).strip():
                raise RuntimeError("empty model response")
            return {"text": text, "provider": provider, "chain": chain, "routing": "primary"}
        except asyncio.TimeoutError:
            last_error = f"{provider} timeout"
            rate_limited = True
            logger.warning("Provider %s timed out", provider)
        except Exception as exc:
            last_error = f"{provider}: {exc}"
            err = str(exc).lower()
            if "429" in err or "rate" in err or "quota" in err:
                rate_limited = True
            logger.warning("Provider %s failed: %s", provider, exc)

    if rate_limited or free_only or last_error:
        try:
            routed = await call_core_python_providers(
                clean_message,
                history=history,
                system_prompt=system_prompt,
                free_only=True,
                coding=coding,
            )
            text = str(routed.get("text", ""))
            if text.strip():
                return {
                    "text": text,
                    "provider": str(routed.get("provider", "free_pipeline")),
                    "chain": routed.get("chain", []),
                    "routing": "free_fallback",
                    "node_id": routed.get("node_id"),
                    "fallback_from": last_error,
                }
        except Exception as exc:
            last_error = f"free_fallback: {exc}"
            logger.warning("free fallback failed: %s", exc)

    return {
        "text": (
            "All configured AI providers failed for this request. "
            f"Last error: {last_error or 'unknown'}"
        ),
        "provider": "exhausted",
        "chain": chain,
        "routing": "exhausted",
        "error": last_error,
    }


def provider_status() -> dict[str, Any]:
    cfg = get_settings()
    return {
        "configured": cfg.configured_providers(),
        "chain_default": _provider_chain("auto"),
        "local_first": cfg.omniforge_local_first,
    }
