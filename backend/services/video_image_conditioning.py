"""
Image-to-video conditioning: identity lock prompts, init_image payloads, anti-randomization.
"""

from __future__ import annotations

import base64
import re
from typing import Any, Optional

IDENTITY_LOCK_TEMPLATE = (
    "FRAME-0 PIXEL LOCK: The uploaded source image is the absolute primary conditioning frame. "
    "init_image_weight={weight:.2f}. The first video frame MUST match the source subject "
    "with 100% structural identity — same face, pose, clothing, and proportions. "
    "Animate ONLY subtle optical-flow motion: gentle hair movement, soft background ambiance, "
    "slow cinematic camera pan or parallax. "
    "FORBIDDEN: new subjects, scene replacement, underwater/ocean hallucination, "
    "random environments, or any identity drift. "
    "Preserve facial geometry and skin tone exactly."
)

BACKGROUND_REPLACE_LOCK_TEMPLATE = (
    "SUBJECT LOCK + BACKGROUND REPLACE: init_image_weight={weight:.2f}. "
    "The person/subject from the source frame MUST remain identical — same face, pose, "
    "clothing, body proportions, and skin tone. "
    "Only the BACKGROUND may change per the scene directive. "
    "Animate with professional cinematic motion: parallax, light shifts, gentle camera move. "
    "FORBIDDEN: new faces, identity drift, duplicate subjects, random scene jumps."
)


def init_image_weight_from_message(message: str) -> float:
    if re.search(r"\b(full|100%|exact|identical)\s*(lock|match)\b", message, re.I):
        return 1.0
    if re.search(r"\b(slight|subtle)\s*motion\b", message, re.I):
        return 0.92
    return 1.0


def apply_source_image_prompt_lock(
    english_prompt: str,
    *,
    init_image_weight: float = 1.0,
    has_source_image: bool,
    allow_background_replace: bool = False,
) -> str:
    if not has_source_image:
        return english_prompt
    if allow_background_replace:
        lock = BACKGROUND_REPLACE_LOCK_TEMPLATE.format(weight=init_image_weight)
    else:
        lock = IDENTITY_LOCK_TEMPLATE.format(weight=init_image_weight)
    return f"{english_prompt.strip()}\n\n{lock}"


def bytes_to_data_uri(image_bytes: bytes) -> str:
    if image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    else:
        mime = "image/jpeg"
    b64 = base64.b64encode(image_bytes).decode("ascii")
    return f"data:{mime};base64,{b64}"


def build_i2v_replicate_payloads(
    prompt: str,
    image_input: str,
    *,
    init_image_weight: float = 1.0,
    duration_hint: int = 6,
) -> list[tuple[str, dict[str, Any]]]:
    """Ordered Replicate model attempts for image-conditioned video."""
    locked_prompt = apply_source_image_prompt_lock(
        prompt,
        init_image_weight=init_image_weight,
        has_source_image=True,
    )
    return [
        (
            "minimax/video-01",
            {
                "prompt": locked_prompt[:800],
                "first_frame_image": image_input,
            },
        ),
        (
            "minimax/video-01-live",
            {
                "prompt": locked_prompt[:800],
                "first_frame_image": image_input,
            },
        ),
        (
            "stability-ai/stable-video-diffusion-img2vid-xt-1-1",
            {
                "input_image": image_input,
                "motion_bucket_id": 40 if init_image_weight >= 0.95 else 80,
                "cond_aug": 0.01,
                "fps": 24,
                "video_length": "25_frames_with_svd_xt",
            },
        ),
    ]


def scene_images_from_source_only(
    source_bytes: bytes,
    scene_count: int,
) -> list[bytes]:
    """All scenes derive from the same source — no random keyframe fetch."""
    n = max(1, min(scene_count, 12))
    return [source_bytes] * n
