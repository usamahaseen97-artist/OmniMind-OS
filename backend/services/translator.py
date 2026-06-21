"""Universal translation via LLM (Urdu, Roman Urdu, global languages)."""

from __future__ import annotations

import logging
from typing import Any

from services.prompts import TRANSLATE_SYSTEM
from services.superapp_ai import complete_json

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = [
    {"code": "en", "label": "English", "native": "English"},
    {"code": "de", "label": "German", "native": "Deutsch"},
    {"code": "ar", "label": "Arabic", "native": "العربية"},
    {"code": "fr", "label": "French", "native": "Français"},
    {"code": "es", "label": "Spanish", "native": "Español"},
    {"code": "ur", "label": "Urdu", "native": "اردو"},
    {"code": "ur-roman", "label": "Roman Urdu", "native": "Roman Urdu"},
]


def _resolve_direction(source_lang: str, target_lang: str) -> str:
    src = (source_lang or "auto").lower()
    tgt = (target_lang or "en").lower()
    if src == "auto":
        return f"Detect source language and translate to {tgt}."
    if tgt == "ur":
        return f"Translate from {src} to proper Urdu script."
    if src in ("ur", "ur-roman") and tgt not in ("ur", "ur-roman"):
        return f"Translate Urdu/Roman Urdu input to {tgt}."
    return f"Translate from {src} to {tgt}."


async def translate_text(
    text: str,
    *,
    source_lang: str = "auto",
    target_lang: str = "ur",
    mode: str = "text",
) -> dict[str, Any]:
    """Translate text; auto-routes Urdu ↔ foreign per user rules."""
    text = text.strip()
    if not text:
        return {"translated_text": "", "detected_source": source_lang, "mode": mode}

    direction = _resolve_direction(source_lang, target_lang)
    message = f"{direction}\n\nText to translate:\n{text}"

    try:
        data = await complete_json(
            message=message,
            system_prompt=TRANSLATE_SYSTEM,
            temperature=0.2,
        )
    except Exception as exc:
        logger.warning("Translation failed: %s", exc)
        return {
            "translated_text": text,
            "detected_source": source_lang,
            "target_lang": target_lang,
            "error": str(exc),
            "mode": mode,
        }

    return {
        "translated_text": data.get("translated_text", text),
        "detected_source": data.get("detected_source", source_lang),
        "urdu_script": data.get("urdu_script"),
        "roman_urdu": data.get("roman_urdu"),
        "notes": data.get("notes"),
        "source_lang": source_lang,
        "target_lang": target_lang,
        "mode": mode,
    }
