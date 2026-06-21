"""
Subject-preserving background edits via PIL compositing (Replicate inpaint optional).
"""

from __future__ import annotations

import io
import uuid
from pathlib import Path

from urllib.parse import quote

import httpx
from PIL import Image, ImageDraw, ImageFilter

POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"


def pollinations_url(prompt: str, *, width: int = 1024, height: int = 1024) -> str:
    encoded = quote(prompt[:800])
    return f"{POLLINATIONS_BASE}/{encoded}?width={width}&height={height}&nologo=true&seed=42"

IMAGE_DIR = Path(__file__).resolve().parent.parent / "data" / "generated" / "images"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)


def _ellipse_pixels(
    size: tuple[int, int],
    seg: dict | None,
) -> tuple[int, int, int, int]:
    w, h = size
    s = seg or {}
    cx = float(s.get("cx", 0.5))
    cy = float(s.get("cy", 0.44))
    rx = float(s.get("rx", 0.36))
    ry = float(s.get("ry", 0.4))
    left = int(max(0, (cx - rx) * w))
    right = int(min(w, (cx + rx) * w))
    top = int(max(0, (cy - ry) * h))
    bottom = int(min(h, (cy + ry) * h))
    return left, top, right, bottom


def _subject_mask(size: tuple[int, int], seg: dict | None = None) -> Image.Image:
    w, h = size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    left, top, right, bottom = _ellipse_pixels(size, seg)
    draw.ellipse((left, top, right, bottom), fill=255)
    return mask


def _inpaint_mask(size: tuple[int, int], seg: dict | None = None) -> Image.Image:
    subj = _subject_mask(size, seg)
    return Image.eval(subj, lambda p: 255 - p)


async def _download_image(url: str) -> Image.Image:
    if "/generated-image/" in url:
        name = url.rsplit("/", 1)[-1].split("?")[0]
        path = IMAGE_DIR / name
        if path.is_file():
            return Image.open(path).convert("RGB")

    from services.public_api import resolve_local_url

    fetch_url = resolve_local_url(url)

    async with httpx.AsyncClient(timeout=90.0, follow_redirects=True) as client:
        res = await client.get(fetch_url)
        res.raise_for_status()
        return Image.open(io.BytesIO(res.content)).convert("RGB")


async def _composite_background_edit(
    source: Image.Image,
    background_prompt: str,
    seg: dict | None = None,
) -> str:
    w, h = source.size
    subj_mask = _subject_mask((w, h), seg)

    async with httpx.AsyncClient(timeout=90.0, follow_redirects=True) as client:
        bg_url = pollinations_url(background_prompt, width=w, height=h)
        res = await client.get(bg_url)
        res.raise_for_status()
        background = Image.open(io.BytesIO(res.content)).convert("RGB").resize((w, h))

    blurred = source.filter(ImageFilter.GaussianBlur(radius=14))
    background = Image.composite(blurred, background, _inpaint_mask((w, h), seg))
    out = background.copy()
    out.paste(source, (0, 0), subj_mask)

    name = f"{uuid.uuid4()}.png"
    path = IMAGE_DIR / name
    out.save(path, format="PNG", optimize=True)
    return f"/api/v1/tools/media/generated-image/{name}"


async def run_inpaint_from_bytes(
    source_bytes: bytes,
    edit_prompt: str,
    *,
    subject_segmentation: dict | None = None,
) -> dict:
    """Subject-preserving background swap from raw image bytes (I2V prep)."""
    source = Image.open(io.BytesIO(source_bytes)).convert("RGB")
    full_prompt = (
        f"{edit_prompt}. Luxury scene, photorealistic environment, no duplicate faces, "
        "Imagen-class realism."
    )
    local_url = await _composite_background_edit(
        source,
        f"Background scene: {full_prompt}",
        seg=subject_segmentation,
    )
    path = IMAGE_DIR / local_url.rsplit("/", 1)[-1]
    out_bytes = path.read_bytes() if path.is_file() else source_bytes
    return {
        "image_url": local_url,
        "image_bytes": out_bytes,
        "provider": "composite-inpaint",
        "mode": "inpaint",
    }


async def run_inpaint_edit(
    *,
    source_url: str,
    edit_prompt: str,
    subject_hint: str,
    subject_segmentation: dict | None = None,
) -> dict:
    source = await _download_image(source_url)
    full_prompt = (
        f"{edit_prompt}. Luxury scene, photorealistic environment, no duplicate faces, "
        "Imagen-class realism."
    )
    local_url = await _composite_background_edit(
        source,
        f"Background scene: {full_prompt}",
        seg=subject_segmentation,
    )
    return {
        "image_url": local_url,
        "provider": "composite-inpaint",
        "mode": "inpaint",
        "subject_hint": subject_hint,
    }
