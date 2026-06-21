from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.context_compression import truncate_and_compress

router = APIRouter(prefix="/api/v1/core", tags=["core-python"])


class NeuralChatbotRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    prompt: str = Field(..., min_length=1, max_length=50000)
    file_context: str | None = Field(default=None, max_length=2_000_000)


@router.post("/neural-chatbot/prepare-context")
async def prepare_neural_context(body: NeuralChatbotRequest) -> dict:
    merged = f"{body.prompt}\n\n{body.file_context or ''}".strip()
    compressed = truncate_and_compress(merged)
    return {
        "ok": True,
        "user_id": body.user_id,
        "compressed_context": compressed.compressed_text,
        "token_estimate": compressed.token_estimate,
        "chunks": compressed.chunks,
        "engine": "core-python-context-compression",
    }
