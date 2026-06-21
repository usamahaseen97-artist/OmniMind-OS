"""
Resilient AI connection controller — silent local→cloud fallback, no user-facing offline halts.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import urllib.parse
from typing import Any, AsyncGenerator

import httpx

from config import get_settings
from services import gemini_stream, lm_studio
from services.api_keys import get_key, groq_key, openai_cloud_key, openrouter_key
from services.provider_registry import CHAT_PROVIDERS, _slot_active, gemini_available

logger = logging.getLogger(__name__)

# Tokens that must never reach the chat UI (triggers legacy offline screens).
_INSTRUCTION_ERROR = re.compile(
    r"(?i)(no\s+(ai\s+)?response|lm\s+studio|gemini\s+unavailable|cannot\s+reach|"
    r"start\s+\*\*lm|add\s+`gemini|port\s+1234|econnrefused|enonet)"
)

CLOUD_CHAT_ENDPOINTS: list[dict[str, Any]] = [
    {
        "id": "pollinations_openai",
        "base": "https://gen.pollinations.ai/v1",
        "model": "openai-fast",
        "needs_key": False,
    },
    {
        "id": "pollinations_text",
        "base": "https://text.pollinations.ai",
        "model": None,
        "needs_key": False,
    },
]


def is_instruction_error(text: str) -> bool:
    if not text or len(text.strip()) < 12:
        return False
    return bool(_INSTRUCTION_ERROR.search(text))


def _pollinations_key() -> str:
    return get_key("POLLINATIONS_API_KEY") or get_key("POLLINATIONS_SECRET_KEY")


async def probe_local_llm(timeout: float = 0.9) -> dict[str, Any]:
    try:
        return await asyncio.wait_for(lm_studio.check_connection(), timeout=timeout)
    except asyncio.TimeoutError:
        return {"connected": False, "error": "probe timeout"}
    except OSError as exc:
        # ENOENT / ECONNREFUSED — treat as offline without surfacing to user
        return {"connected": False, "error": type(exc).__name__}
    except Exception as exc:
        return {"connected": False, "error": str(exc)[:120]}


def resolve_provider_chain(
    *,
    needs_search: bool,
    lm_online: bool,
    has_gemini: bool,
    provider_pref: str,
) -> list[str]:
    """Build chain from configured .env keys (Settings) — uses all active providers in priority order."""
    pref = (provider_pref or "auto").lower()
    chain: list[str] = []

    if pref == "gemini" and has_gemini:
        chain.append("tavily_gemini" if needs_search else "gemini")
    elif pref in ("lm_studio", "local"):
        if needs_search:
            chain.append("tavily_lm_studio")
        chain.append("lm_studio")
    else:
        if has_gemini:
            chain.append("tavily_gemini" if needs_search else "gemini")
        for slot in CHAT_PROVIDERS:
            if slot.provider_id == "gemini":
                continue
            if not _slot_active(slot, lm_online=lm_online):
                continue
            pid = slot.provider_id
            if pid == "lm_studio":
                chain.append("tavily_lm_studio" if needs_search else "lm_studio")
            elif pid == "groq":
                chain.append("groq")
            elif pid == "openrouter":
                chain.append("openrouter")
            elif pid == "openai_cloud":
                chain.append("openai_cloud")
            elif pid == "pollinations_chat":
                chain.append("pollinations_openai")
            elif pid == "pollinations_free":
                pass

    if not chain:
        if has_gemini:
            chain.append("tavily_gemini" if needs_search else "gemini")

    chain.extend(["pollinations_openai", "cloud_text", "instant"])
    seen: set[str] = set()
    out: list[str] = []
    for p in chain:
        if p not in seen:
            seen.add(p)
            out.append(p)
    return out


async def _stream_openai_compat(
    *,
    api_url: str,
    api_key: str,
    model: str,
    message: str,
    history: list[dict],
    extra_context: str,
    system_prompt: str,
    extra_headers: dict[str, str] | None = None,
) -> AsyncGenerator[str, None]:
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}
    if extra_headers:
        headers.update(extra_headers)

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    for turn in history[-12:]:
        role = turn.get("role", "user")
        if role not in ("user", "assistant", "system"):
            role = "user"
        messages.append({"role": role, "content": str(turn.get("content", ""))})
    user_text = f"{extra_context}\n\nUser:\n{message}" if extra_context else message
    messages.append({"role": "user", "content": user_text})

    body = {
        "model": model,
        "messages": messages,
        "stream": True,
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            async with client.stream("POST", api_url, json=body, headers=headers) as response:
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
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content")
                        if content and not is_instruction_error(content):
                            yield content
                    except Exception:
                        continue
    except Exception as exc:
        logger.debug("openai_compat stream skipped (%s): %s", api_url[:40], exc)


async def _stream_pollinations_openai(
    message: str,
    history: list[dict],
    extra_context: str,
    system_prompt: str,
) -> AsyncGenerator[str, None]:
    settings = get_settings()
    key = _pollinations_key()
    headers: dict[str, str] = {"Content-Type": "application/json"}
    if key:
        headers["Authorization"] = f"Bearer {key}"

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    for turn in history[-12:]:
        role = turn.get("role", "user")
        if role == "assistant":
            role = "assistant"
        elif role not in ("user", "system"):
            role = "user"
        messages.append({"role": role, "content": str(turn.get("content", ""))})
    user_text = message
    if extra_context:
        user_text = f"{extra_context}\n\nUser:\n{message}"
    messages.append({"role": "user", "content": user_text})

    url = "https://gen.pollinations.ai/v1/chat/completions"
    body = {
        "model": os.getenv("POLLINATIONS_CHAT_MODEL", "openai-fast"),
        "messages": messages,
        "stream": True,
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            async with client.stream("POST", url, json=body, headers=headers) as response:
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
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content")
                        if content and not is_instruction_error(content):
                            yield content
                    except Exception:
                        continue
    except Exception as exc:
        logger.debug("pollinations_openai stream skipped: %s", exc)


async def _stream_pollinations_text(
    message: str,
    system_prompt: str,
    extra_context: str,
) -> AsyncGenerator[str, None]:
    prompt = message.strip()
    if extra_context:
        prompt = f"{extra_context[:2000]}\n\n{prompt}"
    prompt = f"{system_prompt[:800]}\n\n{prompt}"[:4000]
    encoded = urllib.parse.quote(prompt, safe="")
    url = f"https://text.pollinations.ai/{encoded}"

    try:
        async with httpx.AsyncClient(timeout=75.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code >= 400:
                return
            text = (response.text or "").strip()
            if not text or is_instruction_error(text):
                return
            for word in text.split():
                yield word + " "
                await asyncio.sleep(0.008)
    except Exception as exc:
        logger.debug("pollinations_text skipped: %s", exc)


async def _stream_provider(
    provider: str,
    *,
    message: str,
    history: list[dict],
    pref_note: str,
    web_context: str,
    system_prompt: str,
    enable_search: bool = False,
) -> AsyncGenerator[str, None]:
    ctx = f"{pref_note}{web_context}".strip()
    gemini_search = enable_search and gemini_available()

    if provider == "tavily_gemini":
        async for t in gemini_stream.stream_gemini(
            message,
            history,
            ctx,
            system_prompt=system_prompt,
            use_google_search=gemini_search,
        ):
            if t and not is_instruction_error(t):
                yield t
        return
    if provider == "tavily_lm_studio":
        async for t in lm_studio.stream_lm_studio(message, history, ctx, system_prompt=system_prompt):
            if t and not is_instruction_error(t):
                yield t
        return
    if provider == "gemini":
        async for t in gemini_stream.stream_gemini(
            message,
            history,
            pref_note,
            system_prompt=system_prompt,
            use_google_search=False,
        ):
            if t and not is_instruction_error(t):
                yield t
        return
    if provider == "lm_studio":
        async for t in lm_studio.stream_lm_studio(message, history, pref_note, system_prompt=system_prompt):
            if t and not is_instruction_error(t):
                yield t
        return
    if provider == "groq":
        gkey = groq_key()
        if gkey:
            async for t in _stream_openai_compat(
                api_url="https://api.groq.com/openai/v1/chat/completions",
                api_key=gkey,
                model=os.getenv("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile"),
                message=message,
                history=history,
                extra_context=ctx,
                system_prompt=system_prompt,
            ):
                yield t
        return
    if provider == "openrouter":
        okey = openrouter_key()
        if okey:
            async for t in _stream_openai_compat(
                api_url="https://openrouter.ai/api/v1/chat/completions",
                api_key=okey,
                model=os.getenv("OPENROUTER_CHAT_MODEL", "google/gemini-2.0-flash-001"),
                message=message,
                history=history,
                extra_context=ctx,
                system_prompt=system_prompt,
                extra_headers={
                    "HTTP-Referer": "https://omnimind.local",
                    "X-Title": "OmniMind V11",
                },
            ):
                yield t
        return
    if provider == "openai_cloud":
        oai = openai_cloud_key()
        if oai:
            async for t in _stream_openai_compat(
                api_url="https://api.openai.com/v1/chat/completions",
                api_key=oai,
                model=os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini"),
                message=message,
                history=history,
                extra_context=ctx,
                system_prompt=system_prompt,
            ):
                yield t
        return
    if provider == "pollinations_openai":
        async for t in _stream_pollinations_openai(message, history, ctx, system_prompt):
            yield t
        return
    if provider == "cloud_text":
        async for t in _stream_pollinations_text(message, system_prompt, ctx):
            yield t
        return
    if provider == "instant":
        from services.local_instant import stream_instant_reply

        async for t in stream_instant_reply(message, system_prompt):
            if t and not is_instruction_error(t):
                yield t


async def stream_resilient_chat(
    *,
    message: str,
    history: list[dict],
    pref_note: str,
    web_context: str,
    system_prompt: str,
    provider_chain: list[str],
    per_provider_timeout: float = 22.0,
    enable_search: bool = False,
) -> AsyncGenerator[str, None]:
    """
    Try each provider until tokens flow. Never yields setup / offline instruction text.
    """
    for provider in provider_chain:
        got = False
        try:
            timeout = 14.0 if provider in ("gemini", "tavily_gemini") else per_provider_timeout
            stream = _stream_provider(
                provider,
                message=message,
                history=history,
                pref_note=pref_note,
                web_context=web_context,
                system_prompt=system_prompt,
                enable_search=enable_search,
            )
            async with asyncio.timeout(timeout):
                async for token in stream:
                    if not token:
                        continue
                    if is_instruction_error(token):
                        got = False
                        break
                    got = True
                    yield token
        except TimeoutError:
            logger.debug("provider %s timed out", provider)
        except Exception as exc:
            logger.debug("provider %s failed: %s", provider, exc)
        if got:
            return

    # Guaranteed non-empty friendly stream
    from services.local_instant import stream_instant_reply

    async for token in stream_instant_reply(message, system_prompt):
        yield token


def engine_status_payload(lm_status: dict[str, Any]) -> dict[str, Any]:
    from services.provider_registry import provider_matrix

    return {
        "secure": True,
        "label": "Live Engine Secure",
        "local_llm": bool(lm_status.get("connected")),
        "gemini_configured": gemini_available(),
        "groq_configured": groq_key() is not None,
        "openrouter_configured": openrouter_key() is not None,
        "replicate_configured": bool(get_key("REPLICATE_API_TOKEN")),
        "tavily_configured": bool(get_key("TAVILY_API_KEY")),
        "cloud_fallback": True,
        "route": "resilient_auto",
        "active_tools": provider_matrix(lm_online=bool(lm_status.get("connected"))),
    }
