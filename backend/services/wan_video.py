"""Alibaba DashScope / WAN video — uses WAN_API_KEY from .env."""

from __future__ import annotations

import base64
import logging

import httpx

logger = logging.getLogger(__name__)

DASHSCOPE_I2V = (
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis"
)


async def try_wan_i2v_clip(prompt: str, api_key: str, image_bytes: bytes) -> bytes | None:
    """Submit image-to-video job; returns MP4 bytes when ready."""
    if not api_key or len(image_bytes) < 500:
        return None

    b64 = base64.b64encode(image_bytes).decode("ascii")
    payload = {
        "model": "wanx-v1",
        "input": {
            "prompt": prompt[:500],
            "img_url": f"data:image/jpeg;base64,{b64}",
        },
        "parameters": {"duration": 5},
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
    }

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            create = await client.post(DASHSCOPE_I2V, json=payload, headers=headers)
            if create.status_code >= 400:
                logger.debug("WAN create %s: %s", create.status_code, create.text[:200])
                return None
            data = create.json()
            task_id = (
                data.get("output", {}).get("task_id")
                or data.get("task_id")
            )
            if not task_id:
                return None

            status_url = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"
            for _ in range(60):
                poll = await client.get(
                    status_url,
                    headers={"Authorization": f"Bearer {api_key}"},
                )
                if poll.status_code >= 400:
                    return None
                body = poll.json()
                st = body.get("output", {}).get("task_status") or body.get("task_status")
                if st == "SUCCEEDED":
                    video_url = body.get("output", {}).get("video_url")
                    if video_url:
                        vid = await client.get(video_url)
                        if vid.status_code == 200 and len(vid.content) > 20_000:
                            return vid.content
                    return None
                if st in ("FAILED", "CANCELED"):
                    return None
                import asyncio

                await asyncio.sleep(3.0)
    except Exception as exc:
        logger.debug("WAN I2V skipped: %s", exc)
    return None
