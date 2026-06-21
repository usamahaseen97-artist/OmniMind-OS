"""
Automatic prompt enhancement for image & video generation (General Chatbot).
"""

from __future__ import annotations

import re
from typing import Any

STYLE_KEYWORDS: dict[str, str] = {
    "anime": "anime style, cel shading, vibrant colors, studio quality",
    "cinematic": "cinematic lighting, film grain, anamorphic lens, color graded",
    "3d": "3D render, octane render, ray tracing, highly detailed materials",
    "logo": "professional logo design, vector clean edges, brand identity",
    "poster": "movie poster composition, dramatic typography space, print quality",
    "portrait": "portrait photography, 85mm lens, shallow depth of field, skin detail",
    "fantasy": "fantasy art, epic atmosphere, magical lighting, concept art quality",
    "realistic": "ultra photorealistic, natural lighting, 8k detail, DSLR quality",
    "cyberpunk": "cyberpunk neon city, rain reflections, high contrast, futuristic",
}

DEFAULT_NEGATIVE = (
    "blurry, low quality, distorted, deformed, extra limbs, bad anatomy, "
    "watermark, text artifacts, oversaturated, duplicate face, cropped"
)

ASPECT_PRESETS: dict[str, tuple[int, int]] = {
    "square": (1024, 1024),
    "portrait": (768, 1344),
    "landscape": (1344, 768),
}


def detect_style(user_text: str) -> str | None:
    low = user_text.lower()
    for key in STYLE_KEYWORDS:
        if re.search(rf"\b{re.escape(key)}\b", low):
            return key
    return None


def detect_aspect(user_text: str) -> tuple[int, int]:
    low = user_text.lower()
    if re.search(r"\b(portrait|vertical|9:16|9\s*:\s*16)\b", low):
        return ASPECT_PRESETS["portrait"]
    if re.search(r"\b(landscape|horizontal|16:9|16\s*:\s*9|widescreen)\b", low):
        return ASPECT_PRESETS["landscape"]
    if re.search(r"\b(square|1:1)\b", low):
        return ASPECT_PRESETS["square"]
    return ASPECT_PRESETS["square"]


def _strip_slash_prefix(text: str) -> str:
    return re.sub(r"^/(image|video)\s+", "", text.strip(), flags=re.I)


async def enhance_image_prompt_async(user_prompt: str, **kwargs: Any) -> dict[str, Any]:
    """LM Studio analysis + rule-based style/aspect for free image gen."""
    import asyncio

    rule = enhance_image_prompt(user_prompt, **kwargs)
    try:
        from services.media_prompt_llm import analyze_media_prompt

        analyzed = await asyncio.wait_for(
            analyze_media_prompt(
                user_prompt,
                kind="image",
                fallback_prompt=rule["prompt"],
            ),
            timeout=2.0,
        )
        prompt = analyzed["prompt"] if analyzed.get("analyzed") else rule["prompt"]
        neg = analyzed.get("negative_prompt") or rule["negative_prompt"]
        return {
            **rule,
            "prompt": prompt[:2000],
            "negative_prompt": neg[:500] or rule["negative_prompt"],
            "subject": analyzed.get("subject", ""),
            "prompt_source": analyzed.get("source", "rule_based"),
        }
    except Exception:
        return rule


def enhance_image_prompt(
    user_prompt: str,
    *,
    style: str | None = None,
    aspect: str | None = None,
) -> dict[str, Any]:
    core = _strip_slash_prefix(user_prompt) or "detailed artistic scene"
    style_key = style or detect_style(core)
    style_suffix = STYLE_KEYWORDS.get(style_key or "", STYLE_KEYWORDS["realistic"])
    if aspect and aspect in ASPECT_PRESETS:
        w, h = ASPECT_PRESETS[aspect]
    else:
        w, h = detect_aspect(core)
    enhanced = (
        f"{core}. {style_suffix}. "
        "Highly detailed, professional composition, accurate to user intent, 4k quality."
    )
    return {
        "prompt": enhanced[:2000],
        "negative_prompt": DEFAULT_NEGATIVE,
        "width": w,
        "height": h,
        "style": style_key or "realistic",
        "aspect": aspect or ("portrait" if h > w else "landscape" if w > h else "square"),
    }


def _detect_camera_motion(text: str) -> str:
    low = text.lower()
    if re.search(r"\b(dolly\s*zoom|vertigo)\b", low):
        return "dolly zoom vertigo effect, smooth optical compression"
    if re.search(r"\b(tracking|follow)\s*shot\b", low) or "tracking" in low:
        return "dynamic camera tracking shot, stabilized gimbal motion"
    if re.search(r"\b(pan|panning)\b", low):
        return "smooth cinematic pan, parallax depth"
    if re.search(r"\b(slow\s*motion|slow-mo)\b", low):
        return "slow motion 120fps feel, crisp motion blur on action"
    if re.search(r"\b(aerial|drone)\b", low):
        return "aerial drone shot, sweeping movement"
    if re.search(r"\b(close[- ]?up)\b", low):
        return "slow push-in close-up, shallow depth of field"
    return "dynamic cinematic camera movement, professional film blocking"


async def enhance_cinematic_video_prompt_async(user_prompt: str) -> dict[str, Any]:
    """LM Studio analysis + rule-based cinematic tags for free T2V."""
    rule = enhance_cinematic_video_prompt(user_prompt)
    from services.media_prompt_llm import analyze_media_prompt

    analyzed = await analyze_media_prompt(
        user_prompt,
        kind="video",
        fallback_prompt=rule["prompt"],
    )
    camera = analyzed.get("camera") or _detect_camera_motion(user_prompt)
    neg = analyzed.get("negative_prompt") or ""
    merged_neg = rule["negative_constraints"]
    if neg:
        merged_neg = f"{neg}. {merged_neg}"

    if analyzed.get("analyzed"):
        prompt = (
            f"{analyzed['prompt']}. {camera}. "
            "Ultra realistic motion, temporal consistency, smooth transitions, "
            "no flickering, no watermark, film quality."
        )
    else:
        prompt = rule["prompt"]

    return {
        **rule,
        "prompt": prompt[:2000],
        "negative_constraints": merged_neg[:800],
        "subject": analyzed.get("subject", ""),
        "prompt_source": analyzed.get("source", "rule_based"),
    }


def enhance_cinematic_video_prompt(user_prompt: str) -> dict[str, Any]:
    """Professional T2V prompt — temporal consistency, physics, anti-artifact."""
    core = _strip_slash_prefix(user_prompt) or "cinematic scene"
    style_key = detect_style(core) or "cinematic"
    camera = _detect_camera_motion(core)

    w, h = detect_aspect(core)
    ratio = "1280:720"
    if h > w:
        ratio = "768:1280"
    elif w > h:
        ratio = "1280:720"

    # Short user prompts expanded (e.g. "sports car drifting")
    if len(core.split()) <= 6:
        expanded = (
            f"A cinematic ultra-realistic scene: {core}. "
            f"{camera}. Natural motion, realistic physics, "
            "consistent subjects across frames, smooth temporal coherence, "
            "no flicker, no morphing faces, no random scene cuts, "
            "film grain, anamorphic lens, HDR color grade, 4K film quality."
        )
    else:
        expanded = (
            f"{core}. {camera}. "
            "Ultra realistic, natural movement, temporal consistency, "
            "smooth transitions, realistic lighting and reflections, "
            "no distorted anatomy, no flickering, no watermark, film quality."
        )

    duration = 10
    if re.search(r"\b(5\s*s|5\s*sec)\b", core, re.I):
        duration = 5
    elif re.search(r"\b(30\s*s|30\s*sec)\b", core, re.I):
        duration = 10
    elif re.search(r"\b(60\s*s|1\s*min)\b", core, re.I):
        duration = 10

    return {
        "prompt": expanded[:2000],
        "negative_constraints": (
            "Avoid: flickering, jitter, warping, extra limbs, broken faces, "
            "random scene changes, slideshow effect, still image animation."
        ),
        "duration_seconds": duration,
        "ratio": ratio,
        "style": style_key,
    }


def enhance_video_prompt(user_prompt: str) -> dict[str, Any]:
    return enhance_cinematic_video_prompt(user_prompt)
