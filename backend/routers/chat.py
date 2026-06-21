from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import Field, field_validator

from config import get_settings
from schemas.strict import StrictModel
from schemas.validators import validate_chat_role, validate_non_blank_str
from services import conversation_store, embedding_pipeline, memory, router as agent_router
from services.chat_history_sql import append_chat_message, get_or_create_chat_session
from services import connection_controller
from services.agent_system_prompts import resolve_agent_system_prompt_for_message
from services.execution_context import execution_message_for_tool, resolve_execution_tool
from services.live_preview import resolve_preview
from services.omni_tool_handlers import dispatch_tool
from services.proactive import needs_clarification, proactive_prompt
from services.stream_sse import sse, sse_done, sse_meta, sse_preview, sse_token
from services.image_url_utils import normalize_image_asset, public_image_url
from services.tavily import tavily_search
from services.redis_cache import cache_get_json, cache_set_json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])

LM_PROBE_TIMEOUT = 0.35
LLM_STREAM_TIMEOUT = 12.0
GEMINI_STREAM_TIMEOUT = 90.0
LM_STUDIO_STREAM_TIMEOUT = 10.0
TAVILY_TIMEOUT = 2.5
MUSIC_FAST_TIMEOUT = 10.0
MAX_HISTORY_TURNS = 12
MAX_HISTORY_CHARS = 9000
SUMMARY_MAX_ITEMS = 8
SUMMARY_ITEM_CHARS = 220


async def _stream_fast_music(
    *,
    conv_id: str,
    user_id: str,
    message: str,
    song_query: str,
):
    """Audius-first playback — skip LLM probe, Tavily, and Gemini."""
    from services.music_fast import fast_play_music_payload

    yield sse({"status": "Finding track…", "tool": "play_music"})
    try:
        music_payload = await asyncio.wait_for(
            fast_play_music_payload(song_query),
            timeout=MUSIC_FAST_TIMEOUT,
        )
    except asyncio.TimeoutError:
        music_payload = {
            "type": "music_player",
            "song_name": song_query,
            "success": False,
            "error": "Timed out — try again",
        }
    yield sse(music_payload)
    if music_payload.get("success") and music_payload.get("track"):
        yield sse_preview(
            {
                "type": "audio",
                "music_track": music_payload["track"],
                "track": music_payload["track"],
                "active_tab": "live",
            }
        )
    if music_payload.get("success"):
        summary = (
            f"**{music_payload.get('title', music_payload.get('song_name'))}**"
            f" — {music_payload.get('artist', '')}\n\n"
            "Playing now."
        )
    else:
        summary = (
            f"Could not play **{music_payload.get('song_name', 'track')}**: "
            f"{music_payload.get('error', 'unknown error')}"
        )
    yield sse_token(summary)
    asyncio.create_task(
        _persist_assistant_and_embed(
            conversation_id=conv_id,
            user_id=user_id,
            user_message=message,
            assistant_text=summary,
        )
    )
    yield sse_done(conv_id, tool="play_music")

async def _persist_assistant_and_embed(
    *,
    conversation_id: str,
    user_id: str,
    user_message: str,
    assistant_text: str,
) -> None:
    """Persist assistant reply + schedule RAG embedding (non-blocking, best-effort)."""
    if not assistant_text.strip():
        return
    try:
        await conversation_store.append_message(
            conversation_id,
            user_id,
            "assistant",
            assistant_text,
        )
    except Exception as exc:
        logger.error("Failed to persist assistant message: %s", exc)
    try:
        append_chat_message(
            session_id=conversation_id,
            role="assistant",
            content=assistant_text,
        )
    except Exception as exc:
        logger.error("Failed to persist SQL assistant message: %s", exc)

    embedding_pipeline.schedule_turn_embedding(
        user_id=user_id,
        conversation_id=conversation_id,
        user_message=user_message,
        assistant_message=assistant_text,
    )


def _compact_history(
    history: list[dict[str, str]],
    *,
    max_turns: int = MAX_HISTORY_TURNS,
    max_chars: int = MAX_HISTORY_CHARS,
) -> list[dict[str, str]]:
    """
    Keep recent turns only and hard-cap payload size for low-latency streaming.
    Old content is truncated from the head; recent turns are preserved.
    """
    if not history:
        return []
    dropped = history[:-max_turns] if len(history) > max_turns else []
    recent = history[-max_turns:]
    sized = [{"role": h.get("role", "user"), "content": (h.get("content") or "").strip()} for h in recent]
    sized = [h for h in sized if h["content"]]
    if dropped:
        summary = _summarize_history(dropped)
        if summary:
            sized.insert(0, {"role": "system", "content": summary})
    total = sum(len(h["content"]) for h in sized)
    if total <= max_chars:
        return sized
    keep: list[dict[str, str]] = []
    budget = max_chars
    for h in reversed(sized):
        content = h["content"]
        if budget <= 0:
            break
        if len(content) > budget:
            content = content[-budget:]
        keep.append({"role": h["role"], "content": content})
        budget -= len(content)
    return list(reversed(keep))


def _summarize_history(history: list[dict[str, str]]) -> str:
    """
    Fast local summary for dropped turns (no LLM call).
    Preserves key user/assistant intents while keeping token cost low.
    """
    if not history:
        return ""
    items: list[str] = []
    for msg in history[-SUMMARY_MAX_ITEMS:]:
        role = (msg.get("role") or "user").strip().lower()
        content = (msg.get("content") or "").strip().replace("\n", " ")
        if not content:
            continue
        if len(content) > SUMMARY_ITEM_CHARS:
            content = content[: SUMMARY_ITEM_CHARS - 1].rstrip() + "…"
        tag = "User" if role == "user" else "Assistant"
        items.append(f"- {tag}: {content}")
    if not items:
        return ""
    return "Earlier conversation summary:\n" + "\n".join(items)


class ChatMessage(StrictModel):
    role: str = Field(..., min_length=1, max_length=32)
    content: str = Field(..., min_length=1, max_length=32000)

    @field_validator("role")
    @classmethod
    def role_ok(cls, v: str) -> str:
        return validate_chat_role(v)

    @field_validator("content")
    @classmethod
    def content_ok(cls, v: str) -> str:
        return validate_non_blank_str(v)


class ChatStreamRequest(StrictModel):
    message: str = Field(..., min_length=1, max_length=8000)
    user_id: str = Field(default="anonymous", min_length=1, max_length=128)
    conversation_id: Optional[str] = Field(default=None, max_length=64)
    agent_id: str = Field(default="sovereign-core", min_length=1, max_length=64)
    history: list[ChatMessage] = Field(default_factory=list, max_length=200)
    skip_proactive: bool = False
    image_context: Optional[str] = Field(default=None, max_length=4096)
    attachment_text: Optional[str] = Field(default=None, max_length=50000)

    @field_validator("message", "user_id", "agent_id")
    @classmethod
    def strip_required(cls, v: str) -> str:
        return validate_non_blank_str(v)

    @field_validator("image_context")
    @classmethod
    def image_ok(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        s = v.strip()
        return s if s else None


class ConversationCreate(StrictModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    title: str = Field(default="New chat", min_length=1, max_length=200)
    agent_id: str = Field(default="sovereign-core", min_length=1, max_length=64)

    @field_validator("user_id", "title", "agent_id")
    @classmethod
    def non_blank(cls, v: str) -> str:
        return validate_non_blank_str(v)


@router.get("/conversations/{user_id}")
async def get_conversations(user_id: str):
    conversations = await conversation_store.list_user_conversations(user_id)
    return {"conversations": conversations}


@router.post("/conversations")
async def post_conversation(body: ConversationCreate):
    conv_id = await conversation_store.get_or_create_conversation(
        user_id=body.user_id,
        agent_id=body.agent_id,
        title=body.title,
    )
    return {
        "id": conv_id,
        "conversation_id": conv_id,
        "title": body.title,
        "agent_id": body.agent_id,
    }


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str):
    messages = await conversation_store.get_conversation_messages(conversation_id)
    if not messages:
        legacy = memory.get_messages(conversation_id)
        if legacy:
            return {"messages": legacy, "source": "legacy"}
    return {"messages": messages, "conversation_id": conversation_id}


async def _stream_llm_tokens(stream, timeout: float = LLM_STREAM_TIMEOUT):
    async with asyncio.timeout(timeout):
        async for token in stream:
            if token:
                yield token


@router.post("/chat/stream")
async def chat_stream(body: ChatStreamRequest):
    settings = get_settings()
    from services.message_normalize import normalize_user_message

    message = normalize_user_message(body.message)
    if body.image_context:
        message = f"[Image context: {body.image_context}]\n{message}"
    if body.attachment_text:
        message = f"[Uploaded file content:\n{body.attachment_text[:12000]}]\n\n{message}"
    history = _compact_history([{"role": m.role, "content": m.content} for m in body.history])

    conv_id = body.conversation_id
    if not conv_id:
        conv_cache_key = f"chat:active:{body.user_id}:{body.agent_id}"
        cached_conv = await cache_get_json(conv_cache_key)
        if isinstance(cached_conv, dict):
            conv_id = cached_conv.get("conversation_id")

    conv_id = await conversation_store.get_or_create_conversation(
        user_id=body.user_id,
        agent_id=body.agent_id,
        title=message[:48],
        conversation_id=conv_id,
    )
    await cache_set_json(
        f"chat:active:{body.user_id}:{body.agent_id}",
        {"conversation_id": conv_id},
        ttl_seconds=3600,
    )
    get_or_create_chat_session(
        session_id=conv_id,
        title=message[:48] or "New Chat",
        category="Recents",
    )

    async def generate():
        meta = {"conversation_id": conv_id, "agent_id": body.agent_id}
        yield sse_meta(meta)

        try:
            await conversation_store.append_message(conv_id, body.user_id, "user", message)
        except Exception as exc:
            logger.warning("User message persist failed (stream continues): %s", exc)
        try:
            append_chat_message(
                session_id=conv_id,
                role="user",
                content=message,
                title_hint=message[:80],
            )
        except Exception as exc:
            logger.warning("SQL user message persist failed (stream continues): %s", exc)

        from services.context_manager import ContextManager

        ContextManager.set_active_chat_agent(body.user_id, body.agent_id)
        execution_tool = resolve_execution_tool(message, history, agent_id=body.agent_id)
        if execution_tool != "chat":
            exec_msg = execution_message_for_tool(message, history, execution_tool)
            meta["execution_tool"] = execution_tool
            yield sse_meta(meta)
            yield sse_token("⚡ ")
            yield sse({"status": "Executing tool…", "tool": execution_tool})

            try:
                result = await dispatch_tool(
                    user_id=body.user_id,
                    message=exec_msg,
                    tool=execution_tool,
                    history=history,
                    agent_id=body.agent_id,
                )
            except Exception as exc:
                err = str(exc)[:500]
                yield sse({"error": err})
                yield sse_token(f"**Error:** {err}")
                yield sse_done(conv_id)
                return

            preview = result.get("preview")
            if preview:
                norm_images = [
                    normalize_image_asset(img)
                    for img in (result.get("images") or [])
                    if isinstance(img, dict)
                ]
                if isinstance(preview, dict):
                    preview = dict(preview)
                    if preview.get("image_url"):
                        preview["image_url"] = public_image_url(str(preview["image_url"]))
                    if preview.get("images"):
                        preview["images"] = [
                            normalize_image_asset(img)
                            for img in preview["images"]
                            if isinstance(img, dict)
                        ]
                yield sse_preview(
                    preview,
                    assets=norm_images or result.get("images"),
                    files=result.get("files"),
                    execution=True,
                    tool=execution_tool,
                )

            summary = {
                "create_image": "**Image ready** — displayed in Live Render Workspace.",
                "app_build": "**App scaffold ready** — see Code / Live tabs.",
                "architecture": "**Blueprint ready** — see Blueprint tab.",
                "video": "**Video pipeline ready** — see Live Preview.",
            }.get(execution_tool, "Done.")

            if execution_tool == "create_image" and result.get("message"):
                summary = str(result["message"])
            elif execution_tool == "create_image" and result.get("images"):
                imgs = result.get("images") or []
                if imgs:
                    url = public_image_url(
                        str(imgs[0].get("url") or result.get("image_url", "")),
                    )
                    summary = f"**Image ready**\n\n![Generated]({url})\n\n_{result.get('prompt', message[:120])}_"

            if not result.get("success"):
                summary = result.get("error") or summary

            yield sse_token(summary)
            asyncio.create_task(
                _persist_assistant_and_embed(
                    conversation_id=conv_id,
                    user_id=body.user_id,
                    user_message=message,
                    assistant_text=summary,
                )
            )
            yield sse_done(conv_id, execution=True, tool=execution_tool)
            return

        if (
            not body.skip_proactive
            and body.agent_id not in ("sovereign-core", "dashboard")
            and needs_clarification(body.agent_id, message)
        ):
            text = proactive_prompt(body.agent_id)
            yield sse_token(text)
            asyncio.create_task(
                _persist_assistant_and_embed(
                    conversation_id=conv_id,
                    user_id=body.user_id,
                    user_message=message,
                    assistant_text=text,
                )
            )
            try:
                preview = await resolve_preview(body.agent_id, message, text)
                yield sse_preview(preview)
            except Exception:
                pass
            yield sse_done(conv_id, proactive=True)
            return

        from services.music_intent import extract_song_query

        song_query_fast = extract_song_query(message)
        if song_query_fast:
            async for chunk in _stream_fast_music(
                conv_id=conv_id,
                user_id=body.user_id,
                message=message,
                song_query=song_query_fast,
            ):
                yield chunk
            return

        needs_search = agent_router.AgentRouter.needs_web_search(message)
        from services.model_router import resolve_chat_provider_chain

        provider_chain, lm_status = await resolve_chat_provider_chain(
            needs_search=needs_search,
            provider_pref=settings.llm_provider or "auto",
        )
        lm_online = bool(lm_status.get("connected"))
        from services.provider_registry import gemini_available

        has_gemini = gemini_available()
        meta["provider_chain"] = provider_chain
        meta["needs_search"] = needs_search
        meta["engine"] = connection_controller.engine_status_payload(lm_status)
        meta["lm_studio"] = lm_status
        yield sse_meta(meta)
        yield sse({"status": "Thinking…", "tool": "chat"})

        from services.event_pipeline import publish_omnimind_event

        asyncio.create_task(
            publish_omnimind_event(
                body.user_id,
                "chat.stream.start",
                {"agent_id": body.agent_id, "provider_chain": provider_chain},
            )
        )

        web_context = ""
        if needs_search:
            yield sse({"status": "Searching…", "tool": "web_search"})
            if settings.tavily_api_key:
                try:
                    web_context = await asyncio.wait_for(
                        tavily_search(message),
                        timeout=TAVILY_TIMEOUT,
                    )
                except Exception as exc:
                    logger.debug("Tavily skipped: %s", exc)
                    web_context = ""
            if not web_context.strip() and has_gemini:
                web_context = "(Using Gemini live search grounding.)"

        prefs = memory.get_user_memory(body.user_id)
        pref_note = f"User preferences: {json.dumps(prefs)}\n" if prefs else ""
        system_prompt = resolve_agent_system_prompt_for_message(body.agent_id, message)

        gemini_primary = provider_chain[0] if provider_chain else ""
        song_probe_gemini = extract_song_query(message)
        if (
            settings.music_use_gemini_tool
            and song_probe_gemini
            and gemini_primary in ("gemini", "tavily_gemini")
            and has_gemini
        ):
            from services.gemini_tools import gemini_try_play_music_tool

            ctx = f"{pref_note}{web_context}".strip()
            try:
                music_payload = await asyncio.wait_for(
                    gemini_try_play_music_tool(
                        message=message,
                        history=history,
                        extra_context=ctx,
                        system_prompt=system_prompt,
                    ),
                    timeout=12.0,
                )
            except asyncio.TimeoutError:
                music_payload = None
            if music_payload and music_payload.get("type") == "music_player":
                yield sse(music_payload)
                if music_payload.get("success") and music_payload.get("track"):
                    yield sse_preview(
                        {
                            "type": "audio",
                            "music_track": music_payload["track"],
                            "track": music_payload["track"],
                            "active_tab": "live",
                        }
                    )
                if music_payload.get("success"):
                    summary = (
                        f"**{music_payload.get('title', music_payload.get('song_name'))}**"
                        f" — {music_payload.get('artist', '')}\n\n"
                        "Playing now."
                    )
                else:
                    summary = (
                        f"Could not play **{music_payload.get('song_name', 'track')}**: "
                        f"{music_payload.get('error', 'unknown error')}"
                    )
                yield sse_token(summary)
                asyncio.create_task(
                    _persist_assistant_and_embed(
                        conversation_id=conv_id,
                        user_id=body.user_id,
                        user_message=message,
                        assistant_text=summary,
                    )
                )
                yield sse_done(conv_id, tool="play_music")
                return

        full_response: list[str] = []
        got_any = False
        try:
            resilient = connection_controller.stream_resilient_chat(
                message=message,
                history=history,
                pref_note=pref_note,
                web_context=web_context,
                system_prompt=system_prompt,
                provider_chain=provider_chain,
                per_provider_timeout=LM_STUDIO_STREAM_TIMEOUT,
                enable_search=needs_search,
            )
            stream_cap = (
                GEMINI_STREAM_TIMEOUT
                if provider_chain and provider_chain[0] in ("gemini", "tavily_gemini")
                else LM_STUDIO_STREAM_TIMEOUT + 8.0
            )
            async for token in _stream_llm_tokens(resilient, timeout=stream_cap):
                if connection_controller.is_instruction_error(token):
                    continue
                got_any = True
                full_response.append(token)
                yield sse_token(token)
        except TimeoutError:
            pass
        except Exception as exc:
            meta["stream_error"] = str(exc)[:200]
            yield sse_meta(meta)

        if not got_any:
            from services.local_instant import stream_instant_reply

            async for token in stream_instant_reply(message, system_prompt):
                got_any = True
                full_response.append(token)
                yield sse_token(token)

        assistant_text = "".join(full_response)
        asyncio.create_task(
            _persist_assistant_and_embed(
                conversation_id=conv_id,
                user_id=body.user_id,
                user_message=message,
                assistant_text=assistant_text,
            )
        )

        try:
            preview = await resolve_preview(body.agent_id, message, assistant_text)
            yield sse_preview(preview)
        except Exception as preview_exc:
            yield sse({"error": f"Preview: {preview_exc}"})

        yield sse_done(conv_id)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat")
async def chat_stream_compat(body: ChatStreamRequest):
    """Compatibility alias for clients posting to /api/chat."""
    return await chat_stream(body)
