"""
Commercial-grade visual synthesis — text-to-image + context-aware in-painting.
"""

from __future__ import annotations

import asyncio
import os
from typing import Any, Optional

from services.image_generation import generate_image
from services.image_url_utils import normalize_image_asset, public_image_url
from services.prompt_enhancement import enhance_image_prompt_async, enhance_image_prompt
from services.image_inpainting import run_inpaint_edit
from services.image_prompt_intelligence import (
    build_generation_prompt,
    extract_edit_description,
    is_image_edit_instruction,
)
from services.visual_context_manager import VisualContextManager

COMMERCIAL_REALISM_SUFFIX = (
    ", ultra photorealistic commercial photography, Gemini Imagen-class realism, "
    "studio key light, 85mm f/1.4 portrait lens, natural skin texture, sharp eye focus"
)


async def synthesize_visual(
    *,
    user_id: str,
    message: str,
    agent_id: str = "sovereign-core",
    reference_media_id: Optional[str] = None,
    background_description: Optional[str] = None,
    subject_segmentation: Optional[dict[str, Any]] = None,
    force_mode: Optional[str] = None,
    style: Optional[str] = None,
    aspect_ratio: Optional[str] = None,
    negative_prompt: Optional[str] = None,
) -> dict[str, Any]:
    VisualContextManager.set_active_chat_agent(user_id, agent_id)

    ctx_payload = VisualContextManager.build_inpaint_payload(
        user_id,
        message,
        reference_media_id=reference_media_id,
        background_description=background_description,
        subject_segmentation=subject_segmentation,
    )

    is_edit = force_mode == "inpaint" or (
        force_mode != "generate"
        and (
            ctx_payload.get("mode") == "inpaint"
            or (
                is_image_edit_instruction(message)
                and ctx_payload.get("reference_image_url")
            )
        )
    )

    if is_edit and ctx_payload.get("reference_image_url"):
        edit_desc = (
            background_description
            or extract_edit_description(message)
            or message
        )
        subject_hint = ctx_payload.get("subject_hint") or "portrait subject"
        seg = ctx_payload.get("subject_segmentation") or {}

        try:
            inpaint = await asyncio.wait_for(
                run_inpaint_edit(
                    source_url=ctx_payload["reference_image_url"],
                    edit_prompt=edit_desc,
                    subject_hint=subject_hint,
                    subject_segmentation=seg,
                ),
                timeout=8.0,
            )
            url = inpaint["image_url"]
            prompt = (
                f"In-paint: preserve {subject_hint}; background: {edit_desc}"
                + COMMERCIAL_REALISM_SUFFIX
            )
            ref = VisualContextManager.register_media(
                user_id,
                url=url,
                prompt=prompt,
                subject_hint=subject_hint,
                provider=inpaint.get("provider", "composite-inpaint"),
                subject_segmentation=seg,
                background_description=edit_desc,
            )
            return _package_result(
                gen={
                    "image_url": public_image_url(url),
                    "images": [normalize_image_asset({"url": url, "alt": edit_desc, "provider": inpaint.get("provider")})],
                    "prompt": prompt,
                    "provider": inpaint.get("provider"),
                    "mode": "inpaint",
                    "subject_hint": subject_hint,
                },
                media_id=ref.media_id,
                process_state="FINAL",
                status_steps=["WARM-UP", "BUILD", "FINAL"],
                subject_segmentation=seg,
            )
        except (asyncio.TimeoutError, Exception):
            pass

    intel = build_generation_prompt(
        message,
        last_media=VisualContextManager.get_last_media(user_id),
        agent_id=agent_id,
    )
    fast_path = os.getenv("OMNIMIND_IMAGE_FAST_PATH", "1").strip().lower() in (
        "1",
        "true",
        "yes",
    )
    if fast_path:
        enhanced = enhance_image_prompt(message, style=style, aspect=aspect_ratio)
    else:
        enhanced = await enhance_image_prompt_async(
            message,
            style=style,
            aspect=aspect_ratio,
        )
    neg = negative_prompt or enhanced["negative_prompt"]
    enhanced_message = f"{enhanced['prompt']}{COMMERCIAL_REALISM_SUFFIX} [--neg: {neg}]"
    gen = await generate_image(
        enhanced_message,
        user_id=user_id,
        agent_id=agent_id,
        width=int(enhanced["width"]),
        height=int(enhanced["height"]),
    )
    gen["enhanced_prompt"] = enhanced["prompt"]
    gen["style"] = enhanced.get("style")
    gen["aspect_ratio"] = enhanced.get("aspect")
    seg = subject_segmentation or intel.get("subject_segmentation") or {}
    ref = VisualContextManager.register_media(
        user_id,
        url=gen["image_url"],
        prompt=gen.get("prompt", enhanced_message),
        subject_hint=gen.get("subject_hint", ""),
        provider=gen.get("provider", "pollinations"),
        subject_segmentation=seg if seg else None,
    )
    return _package_result(
        gen=gen,
        media_id=ref.media_id,
        process_state=gen.get("process_state", "FINAL"),
        status_steps=["WARM-UP", "BUILD", "FINAL"],
        subject_segmentation=ref.subject_segmentation,
    )


def _package_result(
    *,
    gen: dict[str, Any],
    media_id: str,
    process_state: str,
    status_steps: list[str],
    subject_segmentation: dict[str, Any],
) -> dict[str, Any]:
    abs_url = public_image_url(str(gen.get("image_url") or ""))
    gallery = [
        normalize_image_asset(img)
        for img in (gen.get("images") or [])
        if isinstance(img, dict)
    ]
    if not gallery and abs_url:
        gallery = [normalize_image_asset({"url": abs_url, "alt": "Generated"})]
    return {
        "success": True,
        "tool": "create_image",
        "image_url": abs_url,
        "imageUrl": abs_url,
        "file_url": abs_url,
        "images": gallery,
        "preview": gen.get("preview"),
        "prompt": gen.get("prompt"),
        "provider": gen.get("provider"),
        "mode": gen.get("mode", "generate"),
        "subject_hint": gen.get("subject_hint", ""),
        "media_id": media_id,
        "reference_media_id": media_id,
        "process_state": process_state,
        "status_steps": status_steps,
        "subject_segmentation": subject_segmentation,
        "message": (
            "**High-fidelity image ready.** "
            f"Style: {gen.get('style', 'realistic')} · "
            f"Aspect: {gen.get('aspect_ratio', 'square')}. "
            "Download or regenerate below."
        ),
    }
