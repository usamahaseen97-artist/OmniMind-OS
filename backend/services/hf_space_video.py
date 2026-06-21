"""
Free neural video via public Hugging Face Gradio Spaces (Wan 2.1, LTX).
Uses the user's HUGGINGFACE_API_KEY for queue priority and ZeroGPU quota (~5 min/day free).
"""

from __future__ import annotations

import asyncio
import logging
import os
import tempfile
import time
from pathlib import Path
from typing import Callable, Optional

import httpx

from config import get_settings
from services.api_keys import get_key

log = logging.getLogger(__name__)

ProgressFn = Callable[[str, int], None]

WAN_SPACE = os.getenv("OMNIMIND_HF_WAN_SPACE", "Wan-AI/Wan2.1")
LTX_SPACE = os.getenv("OMNIMIND_HF_LTX_SPACE", "Lightricks/ltx-video-distilled")


def _hf_token() -> str:
    return (
        get_settings().huggingface_api_key.strip()
        or get_key("HUGGINGFACE_API_KEY")
        or get_key("HF_TOKEN")
    )


def _is_gradio_update(obj: object) -> bool:
    return isinstance(obj, dict) and obj.get("__type__") == "update"


def _extract_video_ref(vid: object) -> object | None:
    if vid is None or _is_gradio_update(vid):
        return None
    if isinstance(vid, dict):
        if vid.get("video"):
            return vid
        if vid.get("path") or vid.get("url"):
            return vid
    return vid


def _poll_wan_status(client: object, status_api: str, token: str, attempt: int) -> object | None:
    """Poll Wan status; reconnect Gradio client after long-queue network drops."""
    from gradio_client import Client

    try:
        return client.predict(api_name=status_api)  # type: ignore[attr-defined]
    except Exception as exc:
        err = str(exc).lower()
        transient = any(
            k in err
            for k in (
                "readerror",
                "10053",
                "cancelled",
                "connection",
                "timeout",
                "reset",
            )
        )
        if transient and attempt < 5:
            log.warning("wan poll reconnect attempt %s: %s", attempt + 1, exc)
            time.sleep(5)
            return Client(WAN_SPACE, token=token).predict(api_name=status_api)
        raise


def _download_video_ref(ref: object, client: object | None = None) -> bytes | None:
    """Download MP4 from Gradio return value (URL, local path, or dict)."""
    if ref is None:
        return None
    if isinstance(ref, dict):
        ref = ref.get("video") or ref.get("path") or ref.get("url")
    if not ref:
        return None
    path = str(ref)
    try:
        if client is not None and hasattr(client, "download_file"):
            local = client.download_file(path)  # type: ignore[attr-defined]
            if local and Path(local).is_file():
                data = Path(local).read_bytes()
                if len(data) > 20_000:
                    return data
    except Exception as exc:
        log.debug("gradio download_file: %s", exc)
    try:
        if path.startswith("http"):
            with httpx.Client(timeout=180.0, follow_redirects=True) as http:
                res = http.get(path)
                if res.status_code == 200 and len(res.content) > 20_000:
                    return res.content
        p = Path(path)
        if p.is_file():
            data = p.read_bytes()
            if len(data) > 20_000:
                return data
    except Exception as exc:
        log.debug("video ref download: %s", exc)
    return None


def _run_wan21(
    prompt: str,
    *,
    image_bytes: bytes | None,
    on_progress: ProgressFn | None,
) -> bytes | None:
    from gradio_client import Client

    token = _hf_token()
    if not token:
        return None

    text = (prompt or "cinematic scene")[:800]
    client = Client(WAN_SPACE, token=token)

    if on_progress:
        on_progress("Free · Wan 2.1 on Hugging Face (real AI video)…", 22)

    if image_bytes and len(image_bytes) > 500:
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp.write(image_bytes)
            img_path = tmp.name
        try:
            client.predict(
                prompt=text,
                image={"path": img_path},
                watermark_wan=False,
                seed=-1,
                api_name="/i2v_generation_async",
            )
            status_api = "/status_refresh_1"
        finally:
            try:
                os.unlink(img_path)
            except OSError:
                pass
    else:
        client.predict(
            prompt=text,
            size="1280*720",
            watermark_wan=False,
            seed=-1,
            api_name="/t2v_generation_async",
        )
        status_api = "/status_refresh"

    if on_progress:
        on_progress("Wan 2.1 · GPU queue (usually 2–12 min)…", 35)

    for i in range(90):
        time.sleep(10)
        try:
            out = _poll_wan_status(client, status_api, token, i // 18)
            client = Client(WAN_SPACE, token=token) if i > 0 and i % 18 == 0 else client
        except Exception as exc:
            log.debug("wan status poll %s: %s", i, exc)
            if i % 18 == 17:
                client = Client(WAN_SPACE, token=token)
            continue
        if not out:
            continue
        vid = out[0] if isinstance(out, (list, tuple)) else out
        vid = _extract_video_ref(vid)
        if not vid:
            continue
        pct = min(88, 35 + i)
        if on_progress and i % 3 == 0:
            on_progress(f"Wan 2.1 · rendering ({pct}%)…", pct)
        data = _download_video_ref(vid, client)
        if data:
            if on_progress:
                on_progress("Wan 2.1 · MP4 ready", 95)
            return data
    return None


def _run_ltx(prompt: str, *, on_progress: ProgressFn | None) -> bytes | None:
    from gradio_client import Client

    token = _hf_token()
    if not token:
        return None

    if on_progress:
        on_progress("Free · LTX Video on Hugging Face…", 40)

    client = Client(LTX_SPACE, token=token)
    text = (prompt or "cinematic scene")[:600]
    try:
        out = client.predict(
            prompt=text,
            negative_prompt="worst quality, blurry, jittery, distorted, watermark",
            input_image_filepath=None,
            input_video_filepath=None,
            height_ui=512,
            width_ui=704,
            mode="text-to-video",
            duration_ui=2,
            ui_frames_to_use=9,
            seed_ui=42,
            randomize_seed=True,
            ui_guidance_scale=1,
            improve_texture_flag=True,
            api_name="/text_to_video",
        )
    except Exception as exc:
        log.warning("ltx space: %s", exc)
        return None

    vid = out[0] if isinstance(out, (list, tuple)) else out
    return _download_video_ref(vid, client)


async def generate_hf_space_video(
    prompt: str,
    *,
    image_bytes: bytes | None = None,
    strict_i2v_lock: bool = False,
    on_progress: ProgressFn | None = None,
) -> tuple[bytes | None, str]:
    """
    Real T2V/I2V via HF Spaces. Returns (mp4_bytes, provider_label).
    """
    if not _hf_token():
        return None, "none"

    timeout = float(os.getenv("OMNIMIND_HF_SPACE_TIMEOUT", "900"))

    try:
        clip = await asyncio.wait_for(
            asyncio.to_thread(
                _run_wan21, prompt, image_bytes=image_bytes, on_progress=on_progress
            ),
            timeout=timeout,
        )
        if clip:
            label = "hf_wan21_i2v" if image_bytes else "hf_wan21_t2v"
            return clip, label
    except asyncio.TimeoutError:
        log.warning("wan21 hf space timed out after %ss", timeout)
    except Exception as exc:
        log.warning("wan21 hf space: %s", exc)

    if strict_i2v_lock and image_bytes:
        # Never fall back to text-to-video when the user demanded a locked first frame.
        return None, "hf_wan21_i2v_strict_failed"

    try:
        clip = await asyncio.wait_for(
            asyncio.to_thread(_run_ltx, prompt, on_progress=on_progress),
            timeout=min(timeout, 300.0),
        )
        if clip:
            return clip, "hf_ltx_t2v"
    except asyncio.TimeoutError:
        log.warning("ltx hf space timed out")
    except Exception as exc:
        log.warning("ltx hf space: %s", exc)

    return None, "none"
