"""
Real image URLs via Pollinations (no key), Replicate Flux, or context-aware inpainting edits.
"""

from __future__ import annotations

import os
import re
from typing import Any, Optional
from urllib.parse import quote

import httpx

from config import get_settings
from services.context_manager import ContextManager
from services.image_inpainting import IMAGE_DIR, run_inpaint_edit
from services.image_prompt_intelligence import build_generation_prompt
from services.image_url_utils import normalize_image_asset, public_image_url
from services.provider_registry import resolve_active_provider

POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"


def _clean_prompt(message: str) -> str:
    text = message.strip()
    text = re.sub(
        r"^(make|create|generate|draw|build|show)\s+(me\s+)?(an?\s+)?(image|picture|photo)\s+(of\s+)?",
        "",
        text,
        flags=re.I,
    )
    text = re.sub(r"^(पिक्चर|तस्वीर)\s*बनाओ\s*", "", text, flags=re.I)
    text = re.sub(r"^(pic|picture|photo)\s*banao\s*", "", text, flags=re.I)
    text = re.sub(r"\bbanao\b", "", text, flags=re.I)
    return text.strip() or message.strip()[:500]


def _enhance_prompt(message: str, cleaned: str) -> str:
    low = message.lower()
    if re.search(r"horse|lion|घोड़|शेर|savanna", low) or (
        re.search(r"horse|lion", low) and re.search(r"banao|make|pic|picture", low)
    ):
        return (
            "Photorealistic detailed photograph, powerful Arabian horse and majestic African lion "
            "standing side by side on textured savanna grassland at golden sunset, cinematic lighting, 8k"
        )
    return cleaned


def pollinations_url(prompt: str, *, width: int = 1024, height: int = 1024) -> str:
    encoded = quote(prompt[:800])
    return f"{POLLINATIONS_BASE}/{encoded}?width={width}&height={height}&nologo=true&seed=42"


async def _openai_dalle(prompt: str) -> str | None:
    """OpenAI DALL-E 3 — cloud image gen when OPENAI_API_KEY is set."""
    settings = get_settings()
    token = (settings.openai_api_key or os.getenv("OPENAI_API_KEY", "")).strip()
    if not token:
        return None
    cleaned = _clean_prompt(prompt)[:4000]
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(
                "https://api.openai.com/v1/images/generations",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"model": "dall-e-3", "prompt": cleaned, "n": 1, "size": "1024x1024"},
            )
            if res.status_code >= 400:
                return None
            data = res.json()
            items = data.get("data") or []
            if items and items[0].get("url"):
                return str(items[0]["url"])
    except Exception:
        return None
    return None


async def _stability_sd3(prompt: str) -> str | None:
    """Stability AI SD3 Core — saves PNG to generated/images when STABILITY_API_KEY is set."""
    settings = get_settings()
    token = settings.stability_api_key.strip()
    if not token:
        return None
    import uuid

    from pathlib import Path

    cleaned = _clean_prompt(prompt)[:900]
    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            res = await client.post(
                "https://api.stability.ai/v2beta/stable-image/generate/core",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "image/*",
                },
                data={"prompt": cleaned, "output_format": "png"},
            )
            if res.status_code >= 400:
                return None
            IMAGE_DIR.mkdir(parents=True, exist_ok=True)
            name = f"{uuid.uuid4()}.png"
            path = Path(IMAGE_DIR) / name
            path.write_bytes(res.content)
            return f"/api/v1/tools/media/generated-image/{name}"
    except Exception:
        return None


async def _huggingface_flux(prompt: str) -> str | None:
    """HF Inference API — FLUX when HUGGINGFACE_API_KEY is set."""
    settings = get_settings()
    token = settings.huggingface_api_key.strip()
    if not token:
        return None
    import uuid

    cleaned = _clean_prompt(prompt)[:800]
    model = os.getenv(
        "HUGGINGFACE_IMAGE_MODEL",
        "black-forest-labs/FLUX.1-schnell",
    )
    api_url = f"https://api-inference.huggingface.co/models/{model}"
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(
                api_url,
                headers={"Authorization": f"Bearer {token}"},
                json={"inputs": cleaned},
            )
            if res.status_code >= 400:
                return None
            IMAGE_DIR.mkdir(parents=True, exist_ok=True)
            name = f"{uuid.uuid4()}.png"
            path = IMAGE_DIR / name
            path.write_bytes(res.content)
            return f"/api/v1/tools/media/generated-image/{name}"
    except Exception:
        return None


async def _replicate_flux(prompt: str) -> str | None:
    """Optional HD render when REPLICATE_API_TOKEN is set (fast poll, max ~12s)."""
    settings = get_settings()
    token = settings.replicate_api_token.strip()
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            create = await client.post(
                "https://api.replicate.com/v1/predictions",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json={
                    "version": "black-forest-labs/flux-schnell",
                    "input": {"prompt": _clean_prompt(prompt), "num_outputs": 1},
                },
            )
            if create.status_code >= 400:
                return None
            pred = create.json()
            poll_url = pred.get("urls", {}).get("get") or pred.get("url")
            if not poll_url:
                return None
            import asyncio

            for _ in range(8):
                res = await client.get(
                    poll_url,
                    headers={"Authorization": f"Bearer {token}"},
                )
                data = res.json()
                status = data.get("status")
                if status == "succeeded":
                    out = data.get("output")
                    if isinstance(out, list) and out:
                        return str(out[0])
                    if isinstance(out, str):
                        return out
                    return None
                if status in ("failed", "canceled"):
                    return None
                await asyncio.sleep(1.5)
    except Exception:
        return None
    return None


def _preview_payload(
    *,
    url: str,
    prompt: str,
    provider: str,
    mode: str,
    subject_hint: str = "",
) -> dict[str, Any]:
    abs_url = public_image_url(url)
    alt = prompt[:120]
    gallery = [
        normalize_image_asset(
            {"url": abs_url, "alt": alt, "provider": provider},
        )
    ]
    html = f"""
    <div style="padding:12px;background:#0a0a0f;color:#e4e4e7;border-radius:12px">
      <p style="color:#00ff88;font-weight:700;margin:0 0 8px">{'In-Painted' if mode == 'inpaint' else 'Generated'} Image</p>
      <img src="{abs_url}" alt="{alt}" style="max-width:100%;border-radius:8px;border:1px solid rgba(0,255,136,0.35)" />
      <p style="font-size:10px;color:#71717a;margin-top:8px">Provider: {provider} · Mode: {mode}</p>
    </div>
    """
    return {
        "image_url": abs_url,
        "images": gallery,
        "prompt": prompt,
        "provider": provider,
        "mode": mode,
        "subject_hint": subject_hint,
        "preview": {
            "html": html,
            "type": "image",
            "image_url": abs_url,
            "images": gallery,
            "active_tab": "live",
        },
    }


async def generate_image(
    message: str,
    *,
    user_id: str = "guest",
    agent_id: str = "sovereign-core",
    width: int = 1024,
    height: int = 1024,
) -> dict[str, Any]:
    """Context-aware generation or inpainting using last_generated_media_reference."""
    import asyncio

    ContextManager.set_active_chat_agent(user_id, agent_id)
    last_media = ContextManager.get_last_generated_media(user_id)
    intel = build_generation_prompt(
        message,
        last_media=last_media,
        agent_id=agent_id,
    )
    prompt = intel["prompt"]
    mode = intel["mode"]
    subject_hint = intel.get("subject_hint") or ""

    if intel.get("is_edit") and intel.get("source_url"):
        try:
            inpaint = await run_inpaint_edit(
                source_url=intel["source_url"],
                edit_prompt=intel.get("edit_description") or message,
                subject_hint=subject_hint,
                subject_segmentation=intel.get("subject_segmentation"),
            )
            url = inpaint["image_url"]
            provider = inpaint.get("provider", "inpaint")
            result = _preview_payload(
                url=url,
                prompt=prompt,
                provider=provider,
                mode="inpaint",
                subject_hint=subject_hint,
            )
            ContextManager.set_last_generated_media(
                user_id,
                url=url,
                prompt=prompt,
                subject_hint=subject_hint,
                provider=provider,
            )
            result["process_state"] = "FINAL"
            return result
        except Exception:
            pass

    route = resolve_active_provider("create_image")
    provider_id = route.get("provider_id", "pollinations_free")
    provider = "pollinations"
    url = pollinations_url(prompt, width=width, height=height)

    import time

    cloud_budget = float(os.getenv("OMNIMIND_IMAGE_CLOUD_BUDGET_SEC", "0"))

    if cloud_budget > 0:
        deadline = time.monotonic() + cloud_budget

        # Optional cloud upgrade — Pollinations URL already set as instant fallback
        for attempt, label in (
            (_openai_dalle, "openai_dalle"),
            (_stability_sd3, "stability"),
            (_replicate_flux, "replicate_flux"),
            (_huggingface_flux, "huggingface"),
        ):
            remaining = deadline - time.monotonic()
            if remaining <= 0.3:
                break
            try:
                out = await asyncio.wait_for(attempt(prompt), timeout=min(5.0, remaining))
                if out:
                    url = out
                    provider = label
                    break
            except (asyncio.TimeoutError, Exception):
                continue

        if provider_id == "replicate_flux" and provider == "pollinations":
            remaining = deadline - time.monotonic()
            if remaining > 0.3:
                try:
                    replicate_url = await asyncio.wait_for(
                        _replicate_flux(prompt),
                        timeout=min(5.0, remaining),
                    )
                    if replicate_url:
                        url = replicate_url
                        provider = "replicate_flux"
                except (asyncio.TimeoutError, Exception):
                    pass
        elif provider_id == "stability" and provider == "pollinations":
            remaining = deadline - time.monotonic()
            if remaining > 0.3:
                try:
                    stability_url = await asyncio.wait_for(
                        _stability_sd3(prompt),
                        timeout=min(5.0, remaining),
                    )
                    if stability_url:
                        url = stability_url
                        provider = "stability"
                except (asyncio.TimeoutError, Exception):
                    pass
        elif provider_id == "huggingface" and provider == "pollinations":
            remaining = deadline - time.monotonic()
            if remaining > 0.3:
                try:
                    hf_url = await asyncio.wait_for(
                        _huggingface_flux(prompt),
                        timeout=min(5.0, remaining),
                    )
                    if hf_url:
                        url = hf_url
                        provider = "huggingface"
                except (asyncio.TimeoutError, Exception):
                    pass

    get_settings()
    result = _preview_payload(
        url=url,
        prompt=prompt,
        provider=provider,
        mode=mode,
        subject_hint=subject_hint,
    )
    ContextManager.set_last_generated_media(
        user_id,
        url=url,
        prompt=prompt,
        subject_hint=subject_hint,
        provider=provider,
    )
    result["process_state"] = "FINAL"
    return result
