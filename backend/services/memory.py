from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from database import Collections, get_database, init_collections, save_chat_turn

# Re-export for callers that used ensure_indexes
ensure_indexes = init_collections


def _db():
    return get_database()


def create_conversation(user_id: str, title: str, agent_id: str = "sovereign-core") -> dict:
    db = _db()
    conv = {
        "_id": str(uuid4()),
        "user_id": user_id,
        "title": title[:80] or "New chat",
        "agent_id": agent_id,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    if db is not None:
        db[Collections.CONVERSATIONS].insert_one(conv)
    return conv


def list_conversations(user_id: str, limit: int = 30) -> list[dict]:
    db = _db()
    if db is None:
        return []
    cursor = (
        db[Collections.CONVERSATIONS]
        .find({"user_id": user_id})
        .sort("updated_at", -1)
        .limit(limit)
    )
    return [
        {
            "id": str(c["_id"]),
            "title": c.get("title", "Chat"),
            "agent_id": c.get("agent_id", "sovereign-core"),
            "updated_at": c.get("updated_at"),
        }
        for c in cursor
    ]


def get_messages(conversation_id: str, limit: int = 50) -> list[dict]:
    db = _db()
    if db is None:
        return []
    cursor = (
        db[Collections.MESSAGES]
        .find({"conversation_id": conversation_id})
        .sort("created_at", 1)
        .limit(limit)
    )
    return [
        {"role": m.get("role"), "content": m.get("content", "")}
        for m in cursor
    ]


def save_message(conversation_id: str, user_id: str, role: str, content: str) -> None:
    db = _db()
    if db is None:
        return
    db[Collections.MESSAGES].insert_one(
        {
            "_id": str(uuid4()),
            "conversation_id": conversation_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "created_at": datetime.now(timezone.utc),
        }
    )
    db[Collections.CONVERSATIONS].update_one(
        {"_id": conversation_id},
        {"$set": {"updated_at": datetime.now(timezone.utc)}},
    )


def save_assistant_turn(
    conversation_id: str,
    user_id: str,
    user_message: str,
    assistant_reply: str,
) -> None:
    """Persist assistant reply to messages + flat chat_logs."""
    save_message(conversation_id, user_id, "assistant", assistant_reply)
    save_chat_turn(user_id, user_message, assistant_reply, conversation_id)


def get_user_memory(user_id: str) -> dict[str, Any]:
    db = _db()
    if db is None:
        return {}
    doc = db[Collections.USER_MEMORY].find_one({"user_id": user_id})
    if doc:
        return doc.get("preferences", {})
    # Fallback: legacy users collection
    legacy = db[Collections.USERS].find_one({"user_id": user_id})
    return legacy.get("preferences", {}) if legacy else {}
