"""
Google AI Studio embeddings — replaces OpenAI/LM Studio vectors for RAG memory.
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Optional

from config import get_settings
from services.api_keys import get_key

logger = logging.getLogger(__name__)

DEFAULT_GEMINI_EMBED_MODEL = "models/text-embedding-004"
# Fallbacks when a Google AI Studio key does not expose text-embedding-004 yet.
EMBEDDING_MODEL_FALLBACKS = (
    "models/text-embedding-004",
    "text-embedding-004",
    "gemini-embedding-001",
    "models/gemini-embedding-001",
)


class GeminiEmbeddingError(Exception):
    """Gemini embedding request failed or GEMINI_API_KEY missing."""


def _gemini_api_key() -> str:
    key = get_key("GEMINI_API_KEY") or get_key("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY", "")
    if not key.strip():
        raise GeminiEmbeddingError(
            "GEMINI_API_KEY is required for embeddings. Set it in backend/.env."
        )
    os.environ.setdefault("GOOGLE_API_KEY", key.strip())
    os.environ.setdefault("GEMINI_API_KEY", key.strip())
    return key.strip()


def _normalize_embed_model(name: str) -> str:
    """Map legacy LM Studio / OpenAI-style names to Google embedding model."""
    n = (name or "").strip()
    if not n:
        return ""
    low = n.lower()
    if "nomic" in low or (low.startswith("text-embedding-") and not low.startswith("models/")):
        return ""
    return n


def resolve_embedding_model(model: Optional[str] = None) -> str:
    settings = get_settings()
    return (
        _normalize_embed_model(model or "")
        or settings.gemini_embedding_model.strip()
        or _normalize_embed_model(settings.mongodb_embedding_model)
        or DEFAULT_GEMINI_EMBED_MODEL
    )


def get_google_embeddings(model: Optional[str] = None):
    """LangChain Google embeddings bound to GEMINI_API_KEY."""
    try:
        from langchain_google_genai import GoogleGenAIEmbeddings
    except ImportError:
        from langchain_google_genai import (
            GoogleGenerativeAIEmbeddings as GoogleGenAIEmbeddings,
        )

    embed_model = resolve_embedding_model(model)
    return GoogleGenAIEmbeddings(
        model=embed_model,
        google_api_key=_gemini_api_key(),
    )


def _embedding_model_candidates(preferred: Optional[str] = None) -> list[str]:
    primary = resolve_embedding_model(preferred)
    seen: set[str] = set()
    out: list[str] = []
    for name in (primary, *EMBEDDING_MODEL_FALLBACKS):
        n = (name or "").strip()
        if not n or n in seen:
            continue
        seen.add(n)
        out.append(n)
    return out


def embed_text_sync(text: str, *, model: Optional[str] = None) -> dict[str, Any]:
    """Synchronous embed_query — run via asyncio.to_thread in async callers."""
    cleaned = text.strip()
    if not cleaned:
        raise ValueError("text must not be empty")

    api_key = _gemini_api_key()
    try:
        from langchain_google_genai import GoogleGenAIEmbeddings
    except ImportError:
        from langchain_google_genai import (
            GoogleGenerativeAIEmbeddings as GoogleGenAIEmbeddings,
        )

    last_exc: Exception | None = None
    for embed_model in _embedding_model_candidates(model):
        try:
            embeddings = GoogleGenAIEmbeddings(
                model=embed_model,
                google_api_key=api_key,
            )
            vector = embeddings.embed_query(cleaned)
            return {
                "model": embed_model,
                "dimensions": len(vector),
                "embedding": list(vector),
                "provider": "google_genai",
            }
        except Exception as exc:
            last_exc = exc
            logger.debug("Embedding model %s unavailable: %s", embed_model, exc)

    raise GeminiEmbeddingError(str(last_exc) if last_exc else "No embedding model available")


async def create_text_embedding(
    text: str,
    *,
    model: Optional[str] = None,
) -> dict[str, Any]:
    """Async wrapper for GoogleGenAIEmbeddings."""
    return await asyncio.to_thread(embed_text_sync, text, model=model)
