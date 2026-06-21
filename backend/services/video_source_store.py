"""Persist uploaded source frames for image-to-video conditioning."""

from __future__ import annotations

import base64
import io
import re
import uuid
from pathlib import Path
from typing import Optional

from PIL import Image

SOURCE_FRAME_DIR = (
    Path(__file__).resolve().parent.parent / "data" / "generated" / "source_frames"
)
SOURCE_FRAME_DIR.mkdir(parents=True, exist_ok=True)

_registry: dict[str, tuple[str, Path]] = {}


def _safe_user(user_id: str) -> str:
    return re.sub(r"[^\w\-]", "_", user_id)[:64]


def store_source_frame(
    user_id: str,
    image_bytes: bytes,
    *,
    filename: str = "source.jpg",
) -> dict[str, str]:
    """Save frame; return source_image_id and public API path."""
    sid = str(uuid.uuid4())
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
        w, h = img.size
        if w < 64 or h < 64:
            img = img.resize((max(w, 512), max(h, 512)), Image.Resampling.LANCZOS)
        out = SOURCE_FRAME_DIR / f"{_safe_user(user_id)}_{sid}.jpg"
        img.save(out, format="JPEG", quality=92, optimize=True)
    except Exception:
        out = SOURCE_FRAME_DIR / f"{_safe_user(user_id)}_{sid}.bin"
        out.write_bytes(image_bytes)

    _registry[sid] = (user_id, out)
    url = f"/api/v1/tools/media/source-frame/{sid}"
    return {
        "source_image_id": sid,
        "source_image_url": url,
        "init_image_token": sid,
    }


def store_source_frame_base64(
    user_id: str,
    image_base64: str,
    filename: str = "source.jpg",
) -> dict[str, str]:
    raw = image_base64.strip()
    if "," in raw:
        raw = raw.split(",", 1)[1]
    data = base64.b64decode(raw)
    return store_source_frame(user_id, data, filename=filename)


def load_source_frame_bytes(source_image_id: str, user_id: Optional[str] = None) -> bytes | None:
    entry = _registry.get(source_image_id)
    if entry:
        uid, path = entry
        if user_id and uid != user_id:
            return None
        if path.is_file():
            return path.read_bytes()
    # filesystem fallback
    for path in SOURCE_FRAME_DIR.glob(f"*_{source_image_id}.jpg"):
        return path.read_bytes()
    for path in SOURCE_FRAME_DIR.glob(f"*_{source_image_id}.bin"):
        return path.read_bytes()
    return None


def resolve_path(source_image_id: str) -> Path | None:
    entry = _registry.get(source_image_id)
    if entry and entry[1].is_file():
        return entry[1]
    for path in SOURCE_FRAME_DIR.glob(f"*_{source_image_id}.jpg"):
        return path
    return None


def public_source_frame_url(source_image_id: str, base: str | None = None) -> str:
    if base is None:
        from services.public_api import public_api_base

        base = public_api_base()
    return f"{base.rstrip('/')}/api/v1/tools/media/source-frame/{source_image_id}"


def latest_source_image_id(user_id: str) -> Optional[str]:
    for sid, (uid, path) in reversed(list(_registry.items())):
        if uid == user_id and path.is_file():
            return sid
    paths = sorted(
        SOURCE_FRAME_DIR.glob(f"{_safe_user(user_id)}_*.jpg"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    if paths:
        name = paths[0].stem
        if "_" in name:
            return name.split("_", 1)[1]
    return None
