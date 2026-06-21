from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import ChatMessage, Project
from app.routers.deps import current_user_id
from app.schemas import ChatBody
from app.services.chat_stream import stream_chat_tokens
from app.services.model_router import generate_chat_reply

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


async def _load_project_messages(db: AsyncSession, project_id: str, user_id: str) -> tuple[Project, list[dict[str, str]]]:
    project = await db.scalar(select(Project).where(Project.id == project_id, Project.user_id == user_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    history_rows = (
        await db.scalars(
            select(ChatMessage)
            .where(ChatMessage.project_id == project.id)
            .order_by(ChatMessage.created_at.asc())
            .limit(40)
        )
    ).all()
    history = [{"role": m.role, "content": m.content} for m in history_rows if m.role in ("user", "assistant")]
    return project, history


async def _persist_user_message(db: AsyncSession, project: Project, message: str) -> None:
    try:
        user_msg = ChatMessage(project_id=project.id, role="user", content=message, provider="client")
        db.add(user_msg)
        await db.flush()
    except Exception:
        await db.rollback()


async def _persist_assistant_message(db: AsyncSession, project: Project, text: str, provider: str) -> None:
    try:
        ai_msg = ChatMessage(project_id=project.id, role="assistant", content=text, provider=provider)
        db.add(ai_msg)
        await db.commit()
    except Exception:
        await db.rollback()


@router.post("")
async def send_chat(
    body: ChatBody,
    user_id: str = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    project, history = await _load_project_messages(db, body.project_id, user_id)
    await _persist_user_message(db, project, body.message)

    routed = await generate_chat_reply(
        body.message,
        history=history,
        provider_hint=body.provider_hint,
        use_free_pipeline=body.use_free_pipeline,
        coding=False,
    )
    ai_text = str(routed.get("text", ""))
    provider = str(routed.get("provider", "router"))
    await _persist_assistant_message(db, project, ai_text, provider)

    return {
        "ok": True,
        "assistant": ai_text,
        "provider": provider,
        "routing": routed.get("routing"),
        "chain": routed.get("chain"),
    }


@router.post("/stream")
async def stream_chat(
    body: ChatBody,
    user_id: str = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """SSE — yields tokens line-by-line as the model generates them."""

    project, history = await _load_project_messages(db, body.project_id, user_id)
    await _persist_user_message(db, project, body.message)

    async def event_stream():
        provider = "router"
        full_text: list[str] = []

        async for evt in stream_chat_tokens(
            body.message,
            history=history,
            provider_hint=body.provider_hint,
            use_free_pipeline=body.use_free_pipeline,
            coding=False,
        ):
            etype = str(evt.get("type", ""))
            if etype == "start":
                provider = str(evt.get("provider", provider))
                yield f"data: {json.dumps({'type': 'start', 'provider': provider})}\n\n"
            elif etype == "token":
                token = str(evt.get("token", ""))
                full_text.append(token)
                yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"
            elif etype == "done":
                provider = str(evt.get("provider", provider))
                text = str(evt.get("text", "")) or "".join(full_text)
                await _persist_assistant_message(db, project, text, provider)
                yield f"data: {json.dumps({'type': 'done', 'provider': provider, 'routing': evt.get('routing')})}\n\n"
                return
            elif etype == "error":
                yield f"data: {json.dumps({'type': 'error', 'error': evt.get('error', 'stream failed')})}\n\n"
                return

        text = "".join(full_text)
        if text:
            await _persist_assistant_message(db, project, text, provider)
        yield f"data: {json.dumps({'type': 'done', 'provider': provider})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


@router.get("/{project_id}")
async def list_chat(
    project_id: str,
    user_id: str = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    project = await db.scalar(select(Project).where(Project.id == project_id, Project.user_id == user_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    rows = (
        await db.scalars(
            select(ChatMessage).where(ChatMessage.project_id == project_id).order_by(ChatMessage.created_at.asc())
        )
    ).all()
    return {"items": [{"role": m.role, "content": m.content, "provider": m.provider} for m in rows]}
