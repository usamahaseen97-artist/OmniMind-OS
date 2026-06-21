from __future__ import annotations

from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel

from services.chat_history_sql import (
    ChatMessageRead,
    ChatSessionCreate,
    ChatSessionRead,
    append_chat_message,
    create_chat_session,
    get_chat_messages,
    list_chat_sessions,
)

router = APIRouter(prefix="/api/chat", tags=["chat-history"])


class ChatMessageCreate(SQLModel):
    role: str
    content: str
    title: str = "New Chat"
    category: str = "Recents"


@router.post("/sessions", response_model=ChatSessionRead)
async def create_session(body: ChatSessionCreate | None = None) -> ChatSessionRead:
    payload = body or ChatSessionCreate()
    row = create_chat_session(title=payload.title, category=payload.category)
    return ChatSessionRead(
        id=row.id,
        title=row.title,
        category=row.category,
        created_at=row.created_at,
        message_count=0,
    )


@router.get("/sessions", response_model=list[ChatSessionRead])
async def get_sessions() -> list[ChatSessionRead]:
    return list_chat_sessions()


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageRead])
async def get_session_messages(session_id: str) -> list[ChatMessageRead]:
    messages = get_chat_messages(session_id)
    if not messages:
        # Empty sessions are valid; unknown sessions return 404 so callers can recover.
        if not any(s.id == session_id for s in list_chat_sessions()):
            raise HTTPException(status_code=404, detail="Chat session not found")
    return messages


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageRead)
async def create_session_message(
    session_id: str,
    body: ChatMessageCreate,
) -> ChatMessageRead:
    if body.role not in {"user", "assistant"}:
        raise HTTPException(status_code=422, detail="role must be 'user' or 'assistant'")
    row = append_chat_message(
        session_id=session_id,
        role=body.role,
        content=body.content,
        title_hint=body.title,
    )
    if row is None:
        raise HTTPException(status_code=422, detail="content must not be empty")
    return ChatMessageRead(
        id=row.id or 0,
        session_id=row.session_id,
        role=row.role,
        content=row.content,
        created_at=row.created_at,
    )
