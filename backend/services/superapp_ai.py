"""
Unified AI service for Super-App routers — resilient local + cloud routing.
"""

from __future__ import annotations

import json
import re
from typing import Any, AsyncGenerator

from config import get_settings
from services import connection_controller


async def stream_completion(
    *,
    message: str,
    system_prompt: str,
    history: list[dict] | None = None,
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> AsyncGenerator[str, None]:
    """Stream tokens via connection controller (silent cloud fallback)."""
    del temperature, max_tokens  # reserved for future provider options
    history = history or []
    settings = get_settings()
    lm_status = await connection_controller.probe_local_llm()
    chain = connection_controller.resolve_provider_chain(
        needs_search=False,
        lm_online=bool(lm_status.get("connected")),
        has_gemini=bool(settings.gemini_api_key),
        provider_pref=settings.llm_provider or "auto",
    )
    async for token in connection_controller.stream_resilient_chat(
        message=message,
        history=history,
        pref_note="",
        web_context="",
        system_prompt=system_prompt,
        provider_chain=chain,
    ):
        yield token


async def complete_text(
    *,
    message: str,
    system_prompt: str,
    history: list[dict] | None = None,
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> str:
    """Collect full non-streaming response."""
    parts: list[str] = []
    async for token in stream_completion(
        message=message,
        system_prompt=system_prompt,
        history=history,
        temperature=temperature,
        max_tokens=max_tokens,
    ):
        parts.append(token)
    return "".join(parts).strip()


def extract_json_object(text: str) -> dict[str, Any]:
    """Parse JSON from LLM output, tolerating markdown fences."""
    cleaned = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", cleaned)
    if fence:
        cleaned = fence.group(1).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start >= 0 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise


async def complete_json(
    *,
    message: str,
    system_prompt: str,
    temperature: float = 0.5,
) -> dict[str, Any]:
    raw = await complete_text(
        message=message,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=4096,
    )
    return extract_json_object(raw)
