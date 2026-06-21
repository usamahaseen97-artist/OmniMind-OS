"""
OmniMind local LLM + MongoDB integration API.
LM Studio (OpenAI-compatible) chat; Google Gemini embeddings; Motor Atlas health.
"""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import Field, field_validator

from schemas.strict import StrictModel
from schemas.validators import validate_chat_role, validate_non_blank_str
from services import local_llm
from services.local_llm import LocalLLMOfflineError
from services.mongo_async import ping_async
from services.stream_sse import sse_token

router = APIRouter(prefix="/api/llm", tags=["llm-integration"])


class ChatMessageIn(StrictModel):
    role: str = Field(..., min_length=1, max_length=32)
    content: str = Field(..., min_length=1, max_length=32000)

    @field_validator("role")
    @classmethod
    def role_ok(cls, v: str) -> str:
        return validate_chat_role(v)


class ChatCompletionRequest(StrictModel):
    message: str = Field(..., min_length=1, max_length=8000)
    history: list[ChatMessageIn] = Field(default_factory=list, max_length=200)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, ge=1, le=8192)
    model: Optional[str] = Field(default=None, max_length=128)

    @field_validator("message")
    @classmethod
    def message_ok(cls, v: str) -> str:
        return validate_non_blank_str(v)


class EmbeddingRequest(StrictModel):
    text: str = Field(..., min_length=1, max_length=16000)
    model: Optional[str] = Field(default=None, max_length=128)
    store_in_mongodb: bool = Field(default=False)
    metadata: Optional[dict[str, Any]] = None

    @field_validator("text")
    @classmethod
    def text_ok(cls, v: str) -> str:
        return validate_non_blank_str(v)


@router.get("/health")
async def llm_health():
    """LM Studio + async MongoDB status."""
    lm = await local_llm.check_connection()
    mongo = await ping_async()
    return {
        "lm_studio": lm,
        "mongodb_async": mongo,
        "ok": lm.get("connected", False),
    }


@router.get("/health/lmstudio")
async def lmstudio_health():
    return await local_llm.check_connection()


@router.get("/health/mongodb")
async def mongodb_async_health():
    return await ping_async()


@router.post("/chat")
async def chat_completion(body: ChatCompletionRequest):
    """Non-streaming chat via LOCAL_LLM_MODEL (meta-llama-3.1-8b-instruct)."""
    history = [{"role": m.role, "content": m.content} for m in body.history]
    try:
        result = await local_llm.chat_completion(
            body.message,
            history,
            temperature=body.temperature,
            max_tokens=body.max_tokens,
            model=body.model,
        )
        return {"success": True, **result}
    except LocalLLMOfflineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/chat/stream")
async def chat_completion_stream(body: ChatCompletionRequest):
    """SSE stream from LM Studio."""
    history = [{"role": m.role, "content": m.content} for m in body.history]

    async def generate():
        async for token in local_llm.stream_chat_completion(
            body.message,
            history,
            temperature=body.temperature,
            max_tokens=body.max_tokens,
            model=body.model,
        ):
            yield sse_token(token)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/embeddings")
async def create_embedding(body: EmbeddingRequest):
    """Generate text embedding via Google text-embedding-004; optionally store in Atlas."""
    try:
        result = await local_llm.create_embedding(body.text, model=body.model)
    except LocalLLMOfflineError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    stored_id = None
    if body.store_in_mongodb:
        stored_id = await local_llm.store_embedding_document(
            body.text,
            result["embedding"],
            metadata=body.metadata,
        )

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "model": result["model"],
            "dimensions": result["dimensions"],
            "embedding": result["embedding"],
            "stored_id": stored_id,
        },
    )
