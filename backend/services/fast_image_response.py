"""Instant image JSON for chat — never block the event loop on slow external APIs."""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Optional

from services.image_generation import pollinations_url
from services.image_prompt_intelligence import build_generation_prompt
from services.image_synthesis import _package_result, synthesize_visual
from services.image_url_utils import normalize_image_asset, public_image_url
from services.prompt_enhancement import enhance_image_prompt
from services.visual_context_manager import VisualContextManager

logger = logging.getLogger(__name__)

DEFAULT_IMAGE_SYNTH_TIMEOUT = float(os.getenv("OMNIMIND_IMAGE_SYNTH_TIMEOUT", "8"))
FAST_SYNTH_BUDGET = float(os.getenv("OMNIMIND_IMAGE_FAST_BUDGET", "3"))


def _preview_from_pollinations(
    *,
    message: str,
    user_id: str,
    agent_id: str,
    width: int = 1024,
    height: int = 1024,
) -> dict[str, Any]:
    """Build a complete tool payload using Pollinations CDN (no network wait)."""
    from services.image_generation import _preview_payload

    intel = build_generation_prompt(
        message,
        last_media=VisualContextManager.get_last_media(user_id),
        agent_id=agent_id,
    )
    rule = enhance_image_prompt(message)
    prompt = rule.get("prompt") or intel.get("prompt") or message
    w = int(rule.get("width") or width)
    h = int(rule.get("height") or height)
    url = pollinations_url(prompt, width=w, height=h)
    gen = _preview_payload(
        url=url,
        prompt=prompt,
        provider="pollinations_fast",
        mode=intel.get("mode", "generate"),
        subject_hint=intel.get("subject_hint") or "",
    )
    gen["style"] = rule.get("style", "realistic")
    gen["aspect_ratio"] = rule.get("aspect", "square")
    seg = intel.get("subject_segmentation") or {}
    ref = VisualContextManager.register_media(
        user_id,
        url=gen["image_url"],
        prompt=prompt,
        subject_hint=gen.get("subject_hint", ""),
        provider="pollinations_fast",
        subject_segmentation=seg if seg else None,
    )
    packaged = _package_result(
        gen=gen,
        media_id=ref.media_id,
        process_state="FINAL",
        status_steps=["WARM-UP", "BUILD", "FINAL"],
        subject_segmentation=ref.subject_segmentation,
    )
    packaged["message"] = (
        "**Image ready.** Rendered via Pollinations fast path.\n\n"
        f"![Generated]({public_image_url(gen['image_url'])})\n\n"
        f"_{prompt[:160]}_"
    )
    packaged["fast_path"] = True
    return packaged


async def synthesize_with_timeout(
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
    timeout: float | None = None,
) -> dict[str, Any]:
    """Run full synthesis with a hard cap; fall back to instant Pollinations JSON."""
    budget = timeout if timeout is not None else DEFAULT_IMAGE_SYNTH_TIMEOUT
    attempt_budget = min(FAST_SYNTH_BUDGET, budget)
    try:
        return await asyncio.wait_for(
            synthesize_visual(
                user_id=user_id,
                message=message,
                agent_id=agent_id,
                reference_media_id=reference_media_id,
                background_description=background_description,
                subject_segmentation=subject_segmentation,
                force_mode=force_mode,
                style=style,
                aspect_ratio=aspect_ratio,
                negative_prompt=negative_prompt,
            ),
            timeout=attempt_budget,
        )
    except asyncio.TimeoutError:
        logger.warning(
            "Image synthesis timed out after %.1fs — fast Pollinations fallback",
            attempt_budget,
        )
        return _preview_from_pollinations(
            message=message,
            user_id=user_id,
            agent_id=agent_id,
        )
    except Exception as exc:
        logger.warning("Image synthesis failed (%s) — fast Pollinations fallback", exc)
        return _preview_from_pollinations(
            message=message,
            user_id=user_id,
            agent_id=agent_id,
        )
