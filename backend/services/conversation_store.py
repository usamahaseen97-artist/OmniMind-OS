"""
Algorithmic conversation persistence — Motor async + embedded message threads.

Schema (conversations collection):
  user_id, conversation_id, agent_id, messages[{role, content, timestamp}], title, timestamps

Schema (vector_memory collection):
  user_id, conversation_id, text_content, embedding[], model, created_at
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from database import Collections
from services.mongo_async import get_async_database
from services.redis_cache import (
    cache_get_conversation_messages,
    cache_invalidate_conversation,
    cache_set_conversation_messages,
    fast_cache_get_or_load,
)

logger = logging.getLogger(__name__)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _message_doc(role: str, content: str) -> dict[str, Any]:
    return {
        "role": role,
        "content": content,
        "timestamp": _utcnow(),
    }


async def ensure_async_indexes() -> None:
    """Create indexes for conversations + vector_memory (idempotent)."""
    db = await get_async_database()
    if db is None:
        return
    try:
        await db[Collections.CONVERSATIONS].create_index(
            [("user_id", 1), ("updated_at", -1)],
            name="idx_conv_user_updated",
        )
        await db[Collections.CONVERSATIONS].create_index(
            [("conversation_id", 1)],
            unique=True,
            name="idx_conv_id",
        )
        await db[Collections.VECTOR_MEMORY].create_index(
            [("user_id", 1), ("created_at", -1)],
            name="idx_vec_user_created",
        )
        await db[Collections.VECTOR_MEMORY].create_index(
            [("conversation_id", 1), ("created_at", -1)],
            name="idx_vec_conv_created",
        )
    except Exception as exc:
        logger.warning("Async index creation skipped or partial: %s", exc)


async def get_or_create_conversation(
    *,
    user_id: str,
    agent_id: str,
    title: str,
    conversation_id: Optional[str] = None,
) -> str:
    """
    Return conversation_id (creates document with empty messages[] if new).
    Never raises — returns a transient local id if Atlas is unavailable.
    """
    db = await get_async_database()
    if db is None:
        return conversation_id or str(uuid4())

    coll = db[Collections.CONVERSATIONS]
    cid = conversation_id

    try:
        if cid:
            existing = await coll.find_one(
                {"conversation_id": cid},
                projection={"conversation_id": 1},
            )
            if existing:
                return cid

        cid = cid or str(uuid4())
        now = _utcnow()
        await coll.insert_one(
            {
                "_id": cid,
                "conversation_id": cid,
                "user_id": user_id,
                "agent_id": agent_id,
                "title": (title[:80] or "New chat"),
                "messages": [],
                "created_at": now,
                "updated_at": now,
            }
        )
        await cache_invalidate_conversation(cid, user_id)
        return cid
    except Exception as exc:
        logger.error("get_or_create_conversation failed: %s", exc)
        return cid or str(uuid4())


async def append_message(
    conversation_id: str,
    user_id: str,
    role: str,
    content: str,
) -> bool:
    """Push one message onto the conversation thread."""
    db = await get_async_database()
    if db is None:
        return False

    try:
        result = await db[Collections.CONVERSATIONS].update_one(
            {"conversation_id": conversation_id, "user_id": user_id},
            {
                "$push": {"messages": _message_doc(role, content)},
                "$set": {"updated_at": _utcnow()},
            },
        )
        if result.matched_count == 0:
            logger.warning(
                "append_message: conversation %s not found for user %s",
                conversation_id,
                user_id,
            )
            return False
        await cache_invalidate_conversation(conversation_id, user_id)
        return True
    except Exception as exc:
        logger.error(
            "append_message failed conv=%s role=%s: %s",
            conversation_id,
            role,
            exc,
        )
        return False


async def append_turn(
    conversation_id: str,
    user_id: str,
    user_message: str,
    assistant_message: str,
) -> bool:
    """Append user + assistant messages in one round-trip."""
    db = await get_async_database()
    if db is None:
        return False

    now = _utcnow()
    try:
        result = await db[Collections.CONVERSATIONS].update_one(
            {"conversation_id": conversation_id, "user_id": user_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {
                                "role": "user",
                                "content": user_message,
                                "timestamp": now,
                            },
                            {
                                "role": "assistant",
                                "content": assistant_message,
                                "timestamp": _utcnow(),
                            },
                        ]
                    }
                },
                "$set": {"updated_at": _utcnow()},
            },
        )
        ok = result.matched_count > 0
        if ok:
            await cache_invalidate_conversation(conversation_id, user_id)
        return ok
    except Exception as exc:
        logger.error("append_turn failed conv=%s: %s", conversation_id, exc)
        return False


async def get_conversation_messages(
    conversation_id: str,
    *,
    limit: int = 200,
) -> list[dict[str, Any]]:
    """Return messages for algorithmic history reload — Redis before MongoDB."""
    cached = await cache_get_conversation_messages(conversation_id)
    if cached is not None:
        return cached[-limit:] if limit else cached

    async def _load_from_mongo() -> list[dict[str, Any]]:
        db = await get_async_database()
        if db is None:
            return []

        try:
            doc = await db[Collections.CONVERSATIONS].find_one(
                {"conversation_id": conversation_id},
                projection={"messages": 1},
            )
            if not doc:
                return []

            messages = doc.get("messages") or []
            if not isinstance(messages, list):
                logger.warning("conversation %s has invalid messages field", conversation_id)
                return []

            out: list[dict[str, Any]] = []
            for m in messages:
                if not isinstance(m, dict):
                    continue
                ts = m.get("timestamp")
                out.append(
                    {
                        "role": m.get("role", "user"),
                        "content": m.get("content", ""),
                        "timestamp": ts.isoformat() if isinstance(ts, datetime) else ts,
                    }
                )
            return out
        except Exception as exc:
            logger.error("get_conversation_messages failed conv=%s: %s", conversation_id, exc)
            return []

    messages, hit = await fast_cache_get_or_load(
        f"msgs:{conversation_id}",
        _load_from_mongo,
        ttl_seconds=900,
    )
    if messages and not hit:
        await cache_set_conversation_messages(conversation_id, messages)
    return messages[-limit:] if limit and messages else messages


async def list_user_conversations(
    user_id: str,
    *,
    limit: int = 30,
) -> list[dict[str, Any]]:
    async def _load() -> list[dict[str, Any]]:
        db = await get_async_database()
        if db is None:
            return []

        try:
            cursor = (
                db[Collections.CONVERSATIONS]
                .find({"user_id": user_id})
                .sort("updated_at", -1)
                .limit(limit)
            )
            results: list[dict[str, Any]] = []
            async for doc in cursor:
                results.append(
                    {
                        "id": doc.get("conversation_id") or str(doc.get("_id", "")),
                        "title": doc.get("title", "Chat"),
                        "agent_id": doc.get("agent_id", "sovereign-core"),
                        "updated_at": doc.get("updated_at"),
                        "message_count": len(doc.get("messages") or []),
                    }
                )
            return results
        except Exception as exc:
            logger.error("list_user_conversations failed user=%s: %s", user_id, exc)
            return []

    rows, _hit = await fast_cache_get_or_load(
        f"list:{user_id}:{limit}",
        _load,
        ttl_seconds=300,
    )
    return rows if isinstance(rows, list) else []


async def save_vector_memory(
    *,
    user_id: str,
    conversation_id: str,
    text_content: str,
    embedding: list[float],
    model: str,
) -> Optional[str]:
    db = await get_async_database()
    if db is None:
        return None

    try:
        doc = {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "text_content": text_content,
            "embedding": embedding,
            "dimensions": len(embedding),
            "model": model,
            "created_at": _utcnow(),
        }
        result = await db[Collections.VECTOR_MEMORY].insert_one(doc)
        return str(result.inserted_id)
    except Exception as exc:
        logger.error("save_vector_memory failed conv=%s: %s", conversation_id, exc)
        return None
