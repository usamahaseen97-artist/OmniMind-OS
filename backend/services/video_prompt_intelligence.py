"""
Creative Video prompt analysis — I2V vs T2V, background edits, audio intent.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

BACKGROUND_CHANGE = re.compile(
    r"\b(background|bg|piche|peeche|behind|baghair|"
    r"change\s*krdo|change\s*karo|change\s*karein|replace|swap|"
    r"inpaint|in-paint|modify\s+background|background\s+change)\b",
    re.I,
)

LOCATION_HINTS = re.compile(
    r"\b(dubai|paris|london|new\s*york|tokyo|beach|desert|mountain|"
    r"cityscape|skyline|sunset|night\s*city|studio|office|garden|forest)\b",
    re.I,
)

AUDIO_HINTS = re.compile(
    r"\b(sound|sounds|audio|music|bgm|soundtrack|voice|dialogue|dialog|"
    r"speak|narration|ambient|sfx|effects|awaz|aawaz|gana|song)\b",
    re.I,
)

VIDEO_ACTION = re.compile(
    r"\b(video|clip|animate|animation|motion|cinematic|film|vfx|"
    r"image\s*to\s*video|text\s*to\s*video|iski\s*video|ki\s*video|"
    r"वीडियो|विडियो)\b",
    re.I,
)

MAKE_EDIT = re.compile(
    r"\b(make|create|generate|banao|bana\s*do|bana\s*kar|banado|"
    r"isko|is\s*ko|edit|render|produce|karo|krdo|kardena|kr\s*dena)\b",
    re.I,
)

DEMOISEUR_URDU = re.compile(
    r"\b(isko|is\s*ko|ye|yeh|is\s*pic|is\s*photo|is\s*image)\b",
    re.I,
)


@dataclass
class CreativeVideoPlan:
    mode: str  # image_to_video | text_to_video | video_edit
    english_scene: str
    background_edit: bool
    background_scene: str
    preserve_subject: bool
    wants_audio: bool
    audio_style: str
    init_image_weight: float


def _extract_location(message: str) -> str:
    m = LOCATION_HINTS.search(message)
    if m:
        return m.group(0).strip()
    if re.search(r"\bdubai\b", message, re.I):
        return "Dubai luxury skyline at golden hour, Burj Khalifa vista, photorealistic"
    return "cinematic photorealistic environment matching the user request"


def analyze_creative_video_request(
    message: str,
    *,
    has_image: bool,
    has_video_ref: bool = False,
) -> CreativeVideoPlan:
    text = message.strip()
    low = text.lower()
    background_edit = bool(BACKGROUND_CHANGE.search(text) or LOCATION_HINTS.search(text))
    wants_audio = bool(AUDIO_HINTS.search(text))
    preserve_subject = has_image and (background_edit or DEMOISEUR_URDU.search(text))

    if has_video_ref or "last_generated_video" in low:
        mode = "video_edit"
    elif has_image:
        mode = "image_to_video"
    else:
        mode = "text_to_video"

    location = _extract_location(text)
    if background_edit and has_image:
        english = (
            f"Professional cinematic video. Keep the main subject from the source frame "
            f"identical (face, pose, clothing, proportions). Replace only the background with: "
            f"{location}. Subtle natural motion: hair, fabric, light, slow camera drift. "
            f"User intent: {text}"
        )
        bg_scene = f"{location}, ultra-detailed photorealistic backdrop, 8K look"
        weight = 0.88 if background_edit else 1.0
    elif has_image:
        english = (
            f"Image-to-video: animate the uploaded subject with subtle cinematic motion. "
            f"Preserve identity and composition. Scene: {text}"
        )
        bg_scene = ""
        weight = 1.0
    else:
        english = (
            f"High-end Sora-style cinematic video, photorealistic, professional color grade. "
            f"Scene: {text}"
        )
        bg_scene = ""
        weight = 1.0

    if wants_audio:
        if re.search(r"\b(dialogue|dialog|speak|voice|bol)\b", low):
            audio_style = "subtle dialogue-ready ambient bed, clear mix headroom"
        elif re.search(r"\b(music|song|gana|bgm|soundtrack)\b", low):
            audio_style = "cinematic orchestral underscore, emotional, no vocals"
        else:
            audio_style = "cinematic ambient atmosphere, gentle room tone"
    else:
        audio_style = "soft cinematic ambient pad, very subtle"

    return CreativeVideoPlan(
        mode=mode,
        english_scene=english[:2000],
        background_edit=background_edit and has_image,
        background_scene=bg_scene,
        preserve_subject=preserve_subject,
        wants_audio=wants_audio,
        audio_style=audio_style,
        init_image_weight=weight,
    )


def creative_video_should_run(message: str, *, has_image: bool) -> bool:
    """True when Creative Video route should invoke the video tool (not chat stream)."""
    if has_image:
        return True
    if VIDEO_ACTION.search(message):
        return True
    if MAKE_EDIT.search(message) and len(message.strip()) > 4:
        return True
    if BACKGROUND_CHANGE.search(message) or LOCATION_HINTS.search(message):
        return True
    return False
