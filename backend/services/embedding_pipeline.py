"""
Background embedding pipeline — Google text-embedding-004 → vector_memory (RAG prep).
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

from config import get_settings
from services import conversation_store
from services.gemini_embeddings import GeminiEmbeddingError, create_text_embedding

logger = logging.getLogger(__name__)


def _format_turn_for_embedding(user_message: str, assistant_message: str) -> str:
    user = user_message.strip()
    assistant = assistant_message.strip()
    return f"User: {user}\n\nAssistant: {assistant}"


async def embed_and_store_turn(
    *,
    user_id: str,
    conversation_id: str,
    user_message: str,
    assistant_message: str,
) -> Optional[str]:
    """
    Generate embedding for the latest exchange and persist to vector_memory.
    Returns inserted document id, or None on failure (non-fatal).
    """
    text = _format_turn_for_embedding(user_message, assistant_message)
    if not text.strip():
        return None

    settings = get_settings()
    try:
        result = await create_text_embedding(text, model=settings.mongodb_embedding_model)
        vector = result.get("embedding") or []
        if not vector:
            logger.warning("Empty embedding vector for conv=%s", conversation_id)
            return None

        return await conversation_store.save_vector_memory(
            user_id=user_id,
            conversation_id=conversation_id,
            text_content=text,
            embedding=vector,
            model=result.get("model") or settings.mongodb_embedding_model,
        )
    except GeminiEmbeddingError as exc:
        logger.warning("Embedding skipped (Gemini not configured): %s", exc)
        return None
    except Exception as exc:
        logger.error("embed_and_store_turn failed conv=%s: %s", conversation_id, exc)
        return None


def schedule_turn_embedding(
    *,
    user_id: str,
    conversation_id: str,
    user_message: str,
    assistant_message: str,
) -> None:
    """
    Fire-and-forget background task after a chat turn completes.
    Does not block the SSE stream or crash the server on failure.
    """

    async def _runner() -> None:
        try:
            doc_id = await embed_and_store_turn(
                user_id=user_id,
                conversation_id=conversation_id,
                user_message=user_message,
                assistant_message=assistant_message,
            )
            if doc_id:
                logger.info(
                    "vector_memory stored conv=%s doc=%s",
                    conversation_id,
                    doc_id,
                )
        except Exception as exc:
            logger.exception("Background embedding task failed: %s", exc)

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_runner())
    except RuntimeError:
        logger.warning("No event loop — embedding task not scheduled")
