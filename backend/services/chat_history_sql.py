"""SQLModel-backed chat history store for sidebar sessions and replay."""

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import uuid4

from sqlmodel import Field, Relationship, Session, SQLModel, create_engine, select


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv(
    "CHAT_HISTORY_DATABASE_URL",
    f"sqlite:///{(DATA_DIR / 'chat_history.db').as_posix()}",
)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_sessions"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    title: str = Field(default="New Chat", index=True, max_length=200)
    category: str = Field(default="Recents", index=True, max_length=80)
    created_at: datetime = Field(default_factory=utcnow, index=True)

    messages: list["ChatMessage"] = Relationship(
        back_populates="session",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(foreign_key="chat_sessions.id", index=True)
    role: str = Field(index=True, max_length=32)
    content: str
    created_at: datetime = Field(default_factory=utcnow, index=True)

    session: Optional[ChatSession] = Relationship(back_populates="messages")


class ChatSessionCreate(SQLModel):
    title: str = "New Chat"
    category: str = "Recents"


class ChatSessionRead(SQLModel):
    id: str
    title: str
    category: str
    created_at: datetime
    message_count: int = 0


class ChatMessageRead(SQLModel):
    id: int
    session_id: str
    role: str
    content: str
    created_at: datetime


def init_chat_history_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    return Session(engine)


def create_chat_session(
    *,
    title: str = "New Chat",
    category: str = "Recents",
    session_id: str | None = None,
) -> ChatSession:
    clean_title = (title or "New Chat").strip()[:200] or "New Chat"
    clean_category = (category or "Recents").strip()[:80] or "Recents"
    with get_session() as db:
        row = ChatSession(
            id=session_id or str(uuid4()),
            title=clean_title,
            category=clean_category,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row


def get_or_create_chat_session(
    *,
    session_id: str | None,
    title: str = "New Chat",
    category: str = "Recents",
) -> ChatSession:
    with get_session() as db:
        if session_id:
            existing = db.get(ChatSession, session_id)
            if existing:
                return existing
        row = ChatSession(
            id=session_id or str(uuid4()),
            title=(title or "New Chat").strip()[:200] or "New Chat",
            category=(category or "Recents").strip()[:80] or "Recents",
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row


def list_chat_sessions() -> list[ChatSessionRead]:
    with get_session() as db:
        rows = db.exec(
            select(ChatSession).order_by(ChatSession.created_at.desc())
        ).all()
        return [
            ChatSessionRead(
                id=row.id,
                title=row.title,
                category=row.category,
                created_at=row.created_at,
                message_count=len(row.messages),
            )
            for row in rows
        ]


def append_chat_message(
    *,
    session_id: str,
    role: str,
    content: str,
    title_hint: str | None = None,
) -> ChatMessage | None:
    text = (content or "").strip()
    if not text:
        return None
    clean_role = role if role in {"user", "assistant"} else "assistant"
    with get_session() as db:
        session_row = db.get(ChatSession, session_id)
        if not session_row:
            session_row = ChatSession(
                id=session_id,
                title=(title_hint or "New Chat").strip()[:200] or "New Chat",
            )
            db.add(session_row)
            db.flush()
        elif (
            clean_role == "user"
            and session_row.title == "New Chat"
            and title_hint
        ):
            session_row.title = title_hint.strip()[:80] or session_row.title

        msg = ChatMessage(session_id=session_id, role=clean_role, content=text)
        db.add(msg)
        db.add(session_row)
        db.commit()
        db.refresh(msg)
        return msg


def get_chat_messages(session_id: str) -> list[ChatMessageRead]:
    with get_session() as db:
        rows = db.exec(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        ).all()
        return [
            ChatMessageRead(
                id=row.id or 0,
                session_id=row.session_id,
                role=row.role,
                content=row.content,
                created_at=row.created_at,
            )
            for row in rows
        ]
