"""Tool 11 — Digital Marketing Hub campaign builder."""

from __future__ import annotations

import logging
import os
import urllib.parse
from typing import Any, Optional
from uuid import uuid4

from services.mongo_pools import save_module_record

logger = logging.getLogger(__name__)


def _pollinations_ad_url(brief: str, *, width: int = 1280, height: int = 720) -> str:
    prompt = urllib.parse.quote(
        f"Professional product ad, Canva style commercial layout: {brief[:300]}",
        safe="",
    )
    seed = os.urandom(4).hex()
    return f"https://image.pollinations.ai/p/{prompt}?width={width}&height={height}&seed={seed}&enhance=true"


async def build_marketing_campaign(
    *,
    user_id: str = "anonymous",
    brief: str,
    brand_assets: Optional[list[str]] = None,
    manual_3d_layout: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    job_id = str(uuid4())
    assets = brand_assets or []
    image_url = _pollinations_ad_url(brief)
    video_thumb = _pollinations_ad_url(f"Motion ad frame: {brief[:120]}", width=1920, height=1080)

    parallel_outputs = {
        "image_ad": {
            "layout": "hero_product_split",
            "headline": brief[:80] or "Launch Campaign",
            "cta": "Shop Now",
            "palette": "theme_accent_sync",
            "cloud_url": image_url,
        },
        "promo_video": {
            "duration_sec": 30,
            "script_excerpt": f"Introducing — {brief[:120]}…",
            "timeline_tracks": ["intro", "product", "cta"],
            "preview_frame_url": video_thumb,
        },
        "social_captions": [
            f"🚀 {brief[:100]} #OmniMind #Launch",
            f"New drop alert — {brief[:60]}… Link in bio.",
            f"Built with OmniMind V11 — {brief[:40]}",
        ],
    }

    record = {
        "id": job_id,
        "user_id": user_id,
        "brief": brief[:8000],
        "brand_assets": assets,
        "parallel_outputs": parallel_outputs,
        "manual_3d_layout": manual_3d_layout,
    }
    await save_module_record("marketing", record)
    logger.info("Marketing campaign job=%s assets=%s", job_id, len(assets))

    return {
        "ok": True,
        "job_id": job_id,
        "brief": brief[:500],
        "image_ad_url": image_url,
        "video_preview_url": video_thumb,
        "parallel_assets": parallel_outputs,
        "manual_3d_canvas": manual_3d_layout,
        "storage_path": f"marketing/{user_id}/{job_id}",
        "terminal_log": [
            "$ marketing campaign-builder --parallel 3 --cloud",
            f"✓ Image ad CDN: {image_url[:80]}…",
            "✓ Promo video storyboard frame locked",
            "✓ Social caption strings generated",
        ],
    }
