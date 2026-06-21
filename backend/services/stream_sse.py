"""Instant Server-Sent Event helpers — no buffering."""

from __future__ import annotations

import json
from typing import Any


def sse(payload: dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def sse_token(text: str) -> str:
    if not text:
        return ""
    return sse({"token": text})


def sse_meta(meta: dict[str, Any]) -> str:
    return sse({"meta": meta})


def sse_preview(preview: dict[str, Any], **extra: Any) -> str:
    return sse({"preview": preview, **extra})


def sse_done(conversation_id: str, **extra: Any) -> str:
    return sse({"done": True, "conversation_id": conversation_id, **extra})
