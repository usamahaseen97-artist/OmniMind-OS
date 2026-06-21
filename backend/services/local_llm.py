"""
Local LM Studio integration via OpenAI-compatible API (AsyncOpenAI).
Chat completions + embeddings with safe offline handling.
"""

from __future__ import annotations

import logging
from typing import Any, AsyncGenerator, Optional

import httpx
from openai import APIConnectionError, APIStatusError, APITimeoutError, AsyncOpenAI

from config import get_settings
from services.lm_auth import auth_headers, lm_studio_auth_hint, resolve_lm_api_key

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are OmniMind, a sovereign AI meta-agent engineered for USAMA HASEEN.
Respond clearly in markdown. Be accurate and helpful.

**POLYGLOT RULE:** Match the user's language AND script. Roman Latin input → Roman Latin output only.
Never auto-switch to Devanagari or Nastaliq unless explicitly requested. Keep replies concise."""


class LocalLLMOfflineError(Exception):
    """LM Studio server is unreachable or returned an error."""


def _build_client() -> AsyncOpenAI:
    """
    OpenAI SDK always attaches Authorization when api_key is a placeholder string.
    Use a custom httpx client so we only send Bearer for real sk-lm-* tokens.
    """
    settings = get_settings()
    token = resolve_lm_api_key()
    http_client = httpx.AsyncClient(
        headers=auth_headers(),
        timeout=httpx.Timeout(120.0),
    )
    kwargs: dict = {
        "base_url": settings.effective_local_llm_base_url,
        "http_client": http_client,
    }
    # Never pass placeholder keys — SDK would send Bearer lm-studio → 401 Malformed token
    if token:
        kwargs["api_key"] = token
    else:
        kwargs["api_key"] = None
    return AsyncOpenAI(**kwargs)


async def check_connection() -> dict[str, Any]:
    """Ping LM Studio /v1/models without sending malformed Bearer tokens."""
    settings = get_settings()
    base = settings.effective_local_llm_base_url
    url = f"{base}/models"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url, headers=auth_headers())
            if res.status_code == 401 and not resolve_lm_api_key():
                return {
                    "connected": False,
                    "base_url": base,
                    "error": res.text[:400],
                    "hint": lm_studio_auth_hint(),
                    "auth_required": True,
                }
            res.raise_for_status()
            data = res.json()
        ids = [m.get("id") for m in data.get("data", []) if m.get("id")]
        return {
            "connected": True,
            "base_url": base,
            "chat_model": settings.effective_local_llm_model,
            "embedding_model": settings.mongodb_embedding_model,
            "embedding_provider": "google_genai",
            "models": ids,
            "model_count": len(ids),
            "auth": "token" if resolve_lm_api_key() else "none",
        }
    except httpx.HTTPStatusError as exc:
        logger.warning("LM Studio health HTTP %s: %s", exc.response.status_code, exc)
        hint = lm_studio_auth_hint()
        if exc.response.status_code == 401:
            hint = (
                "401 Unauthorized — use a valid sk-lm-* token in LOCAL_LLM_API_KEY, "
                "or disable API auth in LM Studio Server settings."
            )
        return {
            "connected": False,
            "base_url": base,
            "error": str(exc),
            "hint": hint,
            "status_code": exc.response.status_code,
        }
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        logger.warning("LM Studio offline at %s: %s", base, exc)
        return {
            "connected": False,
            "base_url": base,
            "error": str(exc),
            "hint": "Open LM Studio → load meta-llama-3.1-8b-instruct → Start Server (port 1234)",
        }
    except Exception as exc:
        logger.exception("LM Studio health check failed")
        return {"connected": False, "base_url": base, "error": str(exc)}


def _normalize_messages(
    message: str,
    history: list[dict[str, str]],
    *,
    system_prompt: Optional[str] = None,
) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = [
        {"role": "system", "content": system_prompt or SYSTEM_PROMPT},
    ]
    for turn in history[-16:]:
        role = turn.get("role", "user")
        if role not in ("user", "assistant", "system"):
            role = "user"
        content = turn.get("content", "")
        if content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})
    return messages


async def chat_completion(
    message: str,
    history: Optional[list[dict[str, str]]] = None,
    *,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 2048,
    model: Optional[str] = None,
) -> dict[str, Any]:
    """
    Non-streaming chat completion via meta-llama-3.1-8b-instruct (or LOCAL_LLM_MODEL).
    Raises LocalLLMOfflineError when the local server is down.
    """
    settings = get_settings()
    chat_model = model or settings.effective_local_llm_model
    messages = _normalize_messages(
        message,
        history or [],
        system_prompt=system_prompt,
    )

    try:
        client = _build_client()
        response = await client.chat.completions.create(
            model=chat_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        text = ""
        if response.choices:
            text = response.choices[0].message.content or ""
        return {
            "model": chat_model,
            "content": text,
            "usage": response.usage.model_dump() if response.usage else None,
        }
    except (APIConnectionError, APITimeoutError) as exc:
        logger.error("LM Studio unreachable for chat: %s", exc)
        raise LocalLLMOfflineError(
            f"LM Studio is offline at {settings.effective_local_llm_base_url}. "
            "Start the local server on port 1234."
        ) from exc
    except APIStatusError as exc:
        logger.error("LM Studio chat HTTP %s: %s", exc.status_code, exc.message)
        detail = exc.message
        if exc.status_code == 401:
            detail = lm_studio_auth_hint()
        raise LocalLLMOfflineError(f"LM Studio error: {detail}") from exc


async def stream_chat_completion(
    message: str,
    history: Optional[list[dict[str, str]]] = None,
    *,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 2048,
    model: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    """Streaming tokens from LM Studio; yields user-friendly errors instead of raising."""
    settings = get_settings()
    chat_model = model or settings.effective_local_llm_model
    messages = _normalize_messages(
        message,
        history or [],
        system_prompt=system_prompt,
    )

    try:
        client = _build_client()
        stream = await client.chat.completions.create(
            model=chat_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content
    except (APIConnectionError, APITimeoutError, OSError):
        logger.warning("LM Studio stream offline at %s", settings.effective_local_llm_base_url)
        return
    except APIStatusError as exc:
        logger.warning("LM Studio stream error: %s", exc.message)
        return
    except Exception as exc:
        logger.debug("LM Studio stream ended: %s", exc)
        return


async def create_embedding(
    text: str,
    *,
    model: Optional[str] = None,
) -> dict[str, Any]:
    """
    Generate a vector embedding via Google AI Studio (text-embedding-004).
    Delegates to services.gemini_embeddings — no OPENAI_API_KEY required.
    """
    if not text.strip():
        raise ValueError("text must not be empty")

    from services.gemini_embeddings import GeminiEmbeddingError, create_text_embedding

    try:
        return await create_text_embedding(text, model=model)
    except GeminiEmbeddingError as exc:
        raise LocalLLMOfflineError(str(exc)) from exc


async def store_embedding_document(
    text: str,
    embedding: list[float],
    *,
    metadata: Optional[dict[str, Any]] = None,
    collection: str = "embeddings",
) -> Optional[str]:
    """
    Persist an embedding document to MongoDB Atlas (async).
    Returns inserted id or None if Atlas is unavailable.
    """
    from datetime import datetime, timezone

    from services.mongo_async import get_async_database

    db = await get_async_database()
    if db is None:
        logger.warning("Skipping embedding storage — MongoDB async client unavailable")
        return None

    doc = {
        "text": text,
        "embedding": embedding,
        "dimensions": len(embedding),
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[collection].insert_one(doc)
    return str(result.inserted_id)
