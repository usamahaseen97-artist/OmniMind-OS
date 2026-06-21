"""
Diffusion gateway — clamp guidance when init_image is present (Frame 0 identity lock).
"""

from __future__ import annotations

from typing import Any, Optional


def has_init_image_payload(init_image: Optional[str]) -> bool:
    if not init_image:
        return False
    raw = init_image.strip()
    return len(raw) >= 32 and (
        raw.startswith("data:image/") or len(raw) > 100
    )


def resolve_diffusion_overrides(
    init_image: Optional[str],
    *,
    init_image_weight: float = 1.0,
    denoising_strength: Optional[float] = None,
    image_guidance_scale: Optional[float] = None,
    init_image_locked: bool = False,
    init_image_token: Optional[str] = None,
    clip_guidance_scale: Optional[float] = None,
) -> dict[str, Any]:
    """
    When init_image is set, clamp denoising / image guidance to 0.1–0.25
    so the model cannot drift from the uploaded frame.
    """
    has_image = has_init_image_payload(init_image)
    if not has_image:
        return {
            "has_init_image": False,
            "denoising_strength": denoising_strength if denoising_strength is not None else 0.75,
            "image_guidance_scale": image_guidance_scale
            if image_guidance_scale is not None
            else 1.0,
            "init_image_weight": init_image_weight,
            "init_image_locked": False,
            "clip_guidance_scale": clip_guidance_scale if clip_guidance_scale is not None else 0.0,
        }

    # Strict lock: lower denoise preserves frame-0 structure; clip_guidance is
    # an explicit contract for downstream I2V adapters/progress UI.
    strict = init_image_locked or init_image_weight >= 0.95
    auto = 0.05 if strict else max(0.1, min(0.25, 0.25 - (max(init_image_weight, 0.5) - 1.0) * 0.05))
    ds = denoising_strength if denoising_strength is not None else auto
    igs = image_guidance_scale if image_guidance_scale is not None else auto
    if strict:
        ds = max(0.03, min(0.08, ds))
        igs = max(0.03, min(0.12, igs))
    else:
        ds = max(0.1, min(0.25, ds))
        igs = max(0.1, min(0.25, igs))
    clip = clip_guidance_scale if clip_guidance_scale is not None else (0.95 if strict else 0.75)
    clip = max(0.5, min(0.99, clip))

    return {
        "has_init_image": True,
        "denoising_strength": ds,
        "image_guidance_scale": igs,
        "init_image_weight": 1.0 if strict else max(0.5, min(1.0, init_image_weight)),
        "source_image_weights": 1.0,
        "frame_zero_lock": True,
        "init_image_locked": strict,
        "init_image_token": init_image_token,
        "init_image_base64": init_image,
        "clip_guidance_scale": clip,
        "pixel_consistency_target": 0.95 if strict else 0.75,
    }
