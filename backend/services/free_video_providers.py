"""
Free neural video — Hugging Face Spaces (Wan 2.1), Pollinations (if keyed), HF inference.
No Runway credits. No Ken-Burns slideshow.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Callable, Optional
from urllib.parse import quote

import httpx

from config import get_settings
from services.api_keys import get_key

log = logging.getLogger(__name__)

ProgressFn = Callable[[str, int], None]

POLLINATIONS_VIDEO_MODELS = (
    "wan-fast",
    "wan",
    "seedance-2.0",
    "ltx-2",
    "seedance-pro",
)


async def try_pollinations_seedance(
    prompt: str,
    *,
    api_key: str = "",
    model: str = "wan-fast",
    on_progress: ProgressFn | None = None,
) -> bytes | None:
    """Pollinations gen.pollinations.ai — requires API key since 2025."""
    if on_progress:
        on_progress(f"Pollinations · {model}…", 28)
    encoded = quote(prompt[:600])
    url = (
        f"https://gen.pollinations.ai/video/{encoded}"
        f"?model={model}&duration=5&aspectRatio=16:9"
    )
    headers: dict[str, str] = {"User-Agent": "OmniMind-V11/1.0"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    else:
        return None
    try:
        async with httpx.AsyncClient(timeout=300.0, follow_redirects=True) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200 and len(res.content) > 25_000:
                return res.content
            log.warning(
                "pollinations video model=%s %s len=%s",
                model,
                res.status_code,
                len(res.content),
            )
    except Exception as exc:
        log.debug("pollinations video: %s", exc)
    return None


async def try_huggingface_video(
    prompt: str,
    *,
    on_progress: ProgressFn | None = None,
) -> bytes | None:
    """HF router inference (limited free credits; many video models unavailable)."""
    token = get_settings().huggingface_api_key.strip() or get_key("HUGGINGFACE_API_KEY")
    if not token:
        return None
    if on_progress:
        on_progress("Hugging Face inference API…", 45)

    endpoints = (
        "https://router.huggingface.co/hf-inference/models/cerspense/zeroscope_v2_576w",
        "https://router.huggingface.co/hf-inference/models/damo-vilab/text-to-video-ms-1.7b",
    )
    payload = {"inputs": prompt[:400]}
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(timeout=300.0) as client:
        for api_url in endpoints:
            for attempt in range(3):
                try:
                    res = await client.post(api_url, headers=headers, json=payload)
                    if res.status_code == 503:
                        wait = 15 * (attempt + 1)
                        if on_progress:
                            on_progress(
                                f"HF model loading · retry in {wait}s…",
                                40 + attempt * 5,
                            )
                        await asyncio.sleep(wait)
                        continue
                    if (
                        res.status_code == 200
                        and res.content[:4] != b"{"
                        and len(res.content) > 20_000
                    ):
                        return res.content
                    log.warning("hf video %s: %s", res.status_code, res.text[:120])
                    break
                except Exception as exc:
                    log.debug("hf video %s: %s", api_url, exc)
                    break
    return None


async def try_huggingface_svd_i2v(
    prompt: str,
    image_bytes: bytes,
    *,
    on_progress: ProgressFn | None = None,
) -> bytes | None:
    """Stable Video Diffusion image-to-video on HF (when supported)."""
    token = get_settings().huggingface_api_key.strip() or get_key("HUGGINGFACE_API_KEY")
    if not token or len(image_bytes) < 500:
        return None
    if on_progress:
        on_progress("HF · image-to-video (Stable Video Diffusion)…", 42)

    api_url = (
        "https://router.huggingface.co/hf-inference/models/"
        "stabilityai/stable-video-diffusion-img2vid-xt"
    )
    headers = {"Authorization": f"Bearer {token}"}
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            res = await client.post(
                api_url,
                headers=headers,
                data={"inputs": prompt[:300]},
                files={"image": ("frame.jpg", image_bytes, "image/jpeg")},
            )
            if res.status_code == 200 and len(res.content) > 20_000 and res.content[:1] != b"{":
                return res.content
            log.warning("hf svd %s: %s", res.status_code, res.text[:120])
    except Exception as exc:
        log.debug("hf svd: %s", exc)
    return None


async def generate_free_neural_video(
    prompt: str,
    *,
    image_bytes: bytes | None = None,
    wan_key: str = "",
    strict_i2v_lock: bool = False,
    on_progress: ProgressFn | None = None,
) -> tuple[bytes | None, str]:
    """
    Free-only chain: HF Spaces (Wan 2.1) → Pollinations (if key) → HF SVD/I2V → WAN.
    """
    from services.hf_space_video import generate_hf_space_video

    if on_progress:
        on_progress("Free engine · Hugging Face Wan 2.1…", 12)

    clip, provider = await generate_hf_space_video(
        prompt,
        image_bytes=image_bytes,
        strict_i2v_lock=strict_i2v_lock,
        on_progress=on_progress,
    )
    if clip:
        return clip, provider

    if strict_i2v_lock and not image_bytes:
        return None, "strict_i2v_missing_source"

    pollinations_key = get_settings().pollinations_api_key.strip() or get_key(
        "POLLINATIONS_API_KEY"
    )
    if pollinations_key and not strict_i2v_lock:
        for model in POLLINATIONS_VIDEO_MODELS:
            clip = await try_pollinations_seedance(
                prompt,
                api_key=pollinations_key,
                model=model,
                on_progress=on_progress,
            )
            if clip:
                return clip, f"pollinations_{model}"

    if image_bytes:
        clip = await try_huggingface_svd_i2v(
            prompt, image_bytes, on_progress=on_progress
        )
        if clip:
            return clip, "huggingface_svd_i2v"

    if strict_i2v_lock:
        if image_bytes and wan_key:
            if on_progress:
                on_progress("Strict I2V · WAN / DashScope image-to-video…", 50)
            try:
                from services.wan_video import try_wan_i2v_clip

                clip = await try_wan_i2v_clip(prompt, wan_key, image_bytes)
                if clip:
                    return clip, "wan_i2v_strict"
            except Exception:
                pass
        return None, "strict_i2v_sources_failed"

    clip = await try_huggingface_video(prompt, on_progress=on_progress)
    if clip:
        return clip, "huggingface_zeroscope"

    if image_bytes and wan_key:
        if on_progress:
            on_progress("WAN / DashScope image-to-video…", 50)
        try:
            from services.wan_video import try_wan_i2v_clip

            clip = await try_wan_i2v_clip(prompt, wan_key, image_bytes)
            if clip:
                return clip, "wan_i2v"
        except Exception:
            pass

    return None, "none"

