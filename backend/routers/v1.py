from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query
from pydantic import Field, field_validator

from schemas.strict import StrictModel
from services import conversation_store, memory

router = APIRouter(prefix="/api/v1", tags=["v1"])


class ChatCreateBody(StrictModel):
    user_external_id: str = Field(..., min_length=1, max_length=128)
    title: str = Field(default="New Chat", min_length=1, max_length=200)
    agent_id: str = Field(default="sovereign-core", min_length=1, max_length=64)

    @field_validator("user_external_id", "title", "agent_id")
    @classmethod
    def no_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be empty or whitespace")
        return v.strip()


@router.get("/chats")
async def list_chats(
    user_external_id: Annotated[str, Query(min_length=1, max_length=128)],
):
    conversations = await conversation_store.list_user_conversations(user_external_id)
    return {
        "chats": [
            {
                "id": c["id"],
                "title": c["title"],
                "agent_id": c.get("agent_id", "sovereign-core"),
                "updated_at": c.get("updated_at"),
            }
            for c in conversations
        ]
    }


@router.post("/chats")
async def create_chat(body: ChatCreateBody):
    conv_id = await conversation_store.get_or_create_conversation(
        user_id=body.user_external_id,
        agent_id=body.agent_id,
        title=body.title,
    )
    return {
        "id": conv_id,
        "title": body.title,
        "agent_id": body.agent_id,
        "user_external_id": body.user_external_id,
    }


@router.get("/chats/{chat_id}/messages")
async def chat_messages(chat_id: str):
    messages = await conversation_store.get_conversation_messages(chat_id)
    if not messages:
        return {"messages": memory.get_messages(chat_id), "source": "legacy"}
    return {"messages": messages, "conversation_id": chat_id}
