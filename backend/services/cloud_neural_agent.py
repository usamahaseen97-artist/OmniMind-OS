"""
Cloud-first neural agent — multimodal chat, file context, image generation routing.
Avoids local LM Studio / heavy GPU workloads when cloud keys are configured.
"""

from __future__ import annotations

import base64
import json
import logging
import re
from typing import Any, Optional

import httpx

from config import get_settings
from services.execution_triggers import detect_execution_tool

logger = logging.getLogger(__name__)

_IMAGE_INTENT = re.compile(
    r"\b(generate|create|make|draw|design|render|banao)\b.*\b(image|picture|photo|logo|poster|art)\b|"
    r"\b(image|picture|photo|logo)\b.*\b(of|for|showing)\b",
    re.I,
)


def _extract_text_context(data: bytes, content_type: str, filename: str) -> str:
    low = (content_type or "").lower()
    name = (filename or "").lower()
    if "text" in low or name.endswith((".txt", ".md", ".csv", ".json", ".log")):
        try:
            return data.decode("utf-8", errors="replace")[:12000]
        except Exception:
            return ""
    if name.endswith(".pdf") or "pdf" in low:
        try:
            import io

            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(data))
            pages = []
            for page in reader.pages[:8]:
                pages.append(page.extract_text() or "")
            return "\n".join(pages)[:12000]
        except Exception:
            return f"[PDF uploaded: {filename}, {len(data)} bytes — install pypdf for full parse]"
    return f"[Binary attachment: {filename}, type={content_type}, size={len(data)}]"


async def _gemini_multimodal_reply(
    prompt: str,
    *,
    text_context: str = "",
    image_b64: Optional[str] = None,
    image_mime: str = "image/jpeg",
) -> str:
    settings = get_settings()
    if not settings.gemini_api_key:
        return (
            f"I received your message: _{prompt[:400]}_. "
            + (f"\n\nFile context:\n{text_context[:800]}" if text_context else "")
            + "\n\nAdd **GEMINI_API_KEY** in backend/.env for full cloud replies."
        )

    parts: list[dict[str, Any]] = []
    if text_context:
        parts.append({"text": f"Uploaded file context:\n{text_context[:10000]}\n\nUser prompt:\n{prompt}"})
    else:
        parts.append({"text": prompt})
    if image_b64:
        parts.insert(0, {"inline_data": {"mime_type": image_mime, "data": image_b64}})

    model = settings.gemini_model.strip() or "gemini-2.0-flash"
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        f"?key={settings.gemini_api_key}"
    )
    body = {
        "systemInstruction": {
            "parts": [
                {
                    "text": (
                        "You are OmniMind V11 Neural Chatbot — warm, human, expert assistant. "
                        "Answer clearly in markdown. For medical topics include disclaimers. "
                        "Founder: USAMA HASEEN."
                    )
                }
            ]
        },
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"temperature": 0.85, "maxOutputTokens": 4096},
    }
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0)) as client:
            res = await client.post(url, json=body)
            res.raise_for_status()
            data = res.json()
            out_parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            text = "".join(p.get("text", "") for p in out_parts if p.get("text"))
            return text.strip() or "I processed your request but received an empty model response."
    except Exception as exc:
        logger.warning("Gemini neural agent failed: %s", exc)
        return f"Cloud chat temporarily unavailable ({exc}). Try again or check GEMINI_API_KEY."


async def process_neural_query(
    *,
    prompt: str,
    subject: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
    file_meta: Optional[dict[str, str]] = None,
) -> dict[str, Any]:
    """Route prompt to cloud image gen or multimodal chat."""
    user_id = subject or "guest"
    meta = file_meta or {}
    content_type = meta.get("content_type", "")
    filename = meta.get("name", "attachment")

    wants_image = (
        detect_execution_tool(prompt, agent_id="sovereign-core") == "create_image"
        or bool(_IMAGE_INTENT.search(prompt))
    )

    if wants_image and not file_bytes:
        from services.image_generation import generate_image

        img = await generate_image(prompt, user_id=user_id, agent_id="sovereign-core")
        url = img.get("image_url") or (img.get("images") or [{}])[0].get("url")
        return {
            "success": True,
            "mode": "image_generation",
            "engine": "cloud_api",
            "provider": img.get("provider", "pollinations"),
            "response_text": img.get("message") or f"Generated image for: {prompt[:200]}",
            "image_url": url,
            "imageUrl": url,
            "file_url": url,
            "preview": img.get("preview"),
            "images": img.get("images", []),
            "file_attached_status": "None",
        }

    text_context = ""
    image_b64: Optional[str] = None
    image_mime = content_type or "image/jpeg"
    if file_bytes:
        text_context = _extract_text_context(file_bytes, content_type, filename)
        if content_type.startswith("image/") or filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            image_b64 = base64.b64encode(file_bytes).decode("ascii")

    reply = await _gemini_multimodal_reply(
        prompt,
        text_context=text_context if not image_b64 else "",
        image_b64=image_b64,
        image_mime=image_mime,
    )

    return {
        "success": True,
        "mode": "multimodal_chat",
        "engine": "gemini_cloud" if get_settings().gemini_api_key else "fallback",
        "response_text": reply,
        "resolution_guideline": reply[:500],
        "file_attached_status": "Parsed successfully" if file_bytes else "None",
        "file_metadata": meta or None,
        "generated_artifacts": {"execution_status": "Verified", "download_node_link": None},
    }
