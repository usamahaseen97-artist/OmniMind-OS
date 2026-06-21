"""
LM Studio prompt intelligence — analyze Urdu/Roman Urdu/English user intent
and produce accurate English prompts for free image/video generation.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Literal

log = logging.getLogger(__name__)

MediaKind = Literal["image", "video"]

_IMAGE_SYSTEM = """You are OmniMind media prompt engineer.
The user writes in Urdu, Roman Urdu, Hindi, or English.
Your job: understand EXACTLY what they want and output ONE detailed English prompt for an AI image generator.

Rules:
- Preserve every subject, action, character, location, and style the user asked for.
- If they name characters (Spider-Man, Iron Man, etc.) include them explicitly.
- Add cinematic/photorealistic quality tags only — do NOT change the scene.
- Output ONLY valid JSON: {"prompt": "...", "negative_prompt": "...", "subject": "short label"}
- prompt max 600 chars, English only."""

_VIDEO_SYSTEM = """You are OmniMind video prompt engineer.
The user writes in Urdu, Roman Urdu, Hindi, or English.
Output ONE detailed English prompt for AI text-to-video that matches their intent 100%.

Rules:
- Describe visible motion, camera movement, characters, environment, lighting.
- Include temporal consistency: smooth motion, no flicker, no morphing.
- If they name characters or a fight/action scene, describe it clearly.
- Output ONLY valid JSON: {"prompt": "...", "negative_prompt": "...", "camera": "...", "subject": "short label"}
- prompt max 800 chars, English only."""


def _extract_json(text: str) -> dict[str, Any] | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        data = json.loads(text)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                return None
    return None


async def analyze_media_prompt(
    user_text: str,
    *,
    kind: MediaKind = "image",
    fallback_prompt: str = "",
) -> dict[str, Any]:
    """
    Use LM Studio to analyze user intent. Falls back to fallback_prompt if LM offline.
    """
    raw = (user_text or "").strip()
    base = fallback_prompt or raw

    try:
        from services.local_llm import LocalLLMOfflineError, chat_completion

        system = _VIDEO_SYSTEM if kind == "video" else _IMAGE_SYSTEM

        result = await chat_completion(
            raw,
            system_prompt=system,
            temperature=0.35,
            max_tokens=900,
        )
        content = (result.get("content") or "").strip()
        parsed = _extract_json(content)
        if parsed and parsed.get("prompt"):
            return {
                "prompt": str(parsed["prompt"])[:2000],
                "negative_prompt": str(parsed.get("negative_prompt") or "")[:500],
                "subject": str(parsed.get("subject") or raw[:80]),
                "camera": str(parsed.get("camera") or ""),
                "source": "lm_studio",
                "analyzed": True,
            }
    except Exception as exc:
        log.info("LM Studio media prompt analysis unavailable: %s", exc)

    return {
        "prompt": base[:2000],
        "negative_prompt": "",
        "subject": raw[:80],
        "camera": "",
        "source": "rule_based",
        "analyzed": False,
    }
