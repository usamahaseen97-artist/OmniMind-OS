"""Universal Voice Translator API."""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import Field, field_validator

from schemas.strict import StrictModel
from schemas.validators import validate_non_blank_str
from services.translator import SUPPORTED_LANGUAGES, translate_text

router = APIRouter(prefix="/translate", tags=["translate"])


class TranslateRequest(StrictModel):
    text: str = Field(..., min_length=1, max_length=8000)
    source_lang: str = Field(default="auto", min_length=2, max_length=16)
    target_lang: str = Field(default="ur", min_length=2, max_length=16)
    mode: str = Field(default="text", pattern="^(text|speech)$")

    @field_validator("text")
    @classmethod
    def text_ok(cls, v: str) -> str:
        return validate_non_blank_str(v)


@router.get("/languages")
async def list_languages():
    return {"languages": SUPPORTED_LANGUAGES}


@router.post("")
async def translate(body: TranslateRequest):
    """
    Text translation across global languages + Urdu + Roman Urdu.
  Foreign → Urdu, or Urdu/Roman → selected foreign language.
    """
    result = await translate_text(
        body.text,
        source_lang=body.source_lang,
        target_lang=body.target_lang,
        mode=body.mode,
    )
    return {"tool": "universal-voice-translator", **result}


@router.post("/stream")
async def translate_stream(body: TranslateRequest):
    """
    Incremental translation stream for live audio/text UX.
    Emits SSE chunks so frontend can render progressively.
    """

    async def _gen():
        result = await translate_text(
            body.text,
            source_lang=body.source_lang,
            target_lang=body.target_lang,
            mode=body.mode,
        )
        translated = str(result.get("translated_text") or result.get("translated_result") or "")
        if not translated:
            translated = str(result)
        # lightweight chunking for low-latency UI updates
        step = 24
        for i in range(0, len(translated), step):
            chunk = translated[i : i + step]
            yield f"data: {chunk}\n\n"
        yield "event: done\ndata: [DONE]\n\n"

    return StreamingResponse(
        _gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
