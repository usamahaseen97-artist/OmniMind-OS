"""
OmniMind V11 — professional 60s video generation.

Priority when REPLICATE_API_TOKEN is set:
  1. Replicate Flux HD keyframes (photoreal) → 60s cinematic Ken-Burns MP4 (H.264)
  2. Optional Replicate Minimax motion clip when it finishes in time

Fallback: Pollinations/picsum keyframes → cinematic MP4.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import re
import shutil
import subprocess
import uuid
from pathlib import Path
from typing import Any, Callable, Optional
from urllib.parse import quote

import httpx
import numpy as np

from config import get_settings
from services.image_generation import pollinations_url
from services.video_image_conditioning import (
    apply_source_image_prompt_lock,
    build_i2v_replicate_payloads,
    bytes_to_data_uri,
    init_image_weight_from_message,
    scene_images_from_source_only,
)
from services.video_source_store import load_source_frame_bytes, public_source_frame_url

log = logging.getLogger(__name__)

VIDEO_DIR = Path(__file__).resolve().parent.parent / "data" / "generated" / "videos"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

FPS = 24
FRAME_W = 1280
FRAME_H = 720


def target_duration_seconds(message: str) -> int:
    m = re.search(r"output\s*length:\s*(\d+)\s*seconds", message, re.I)
    if m:
        n = int(m.group(1))
        if n in (10, 30, 60):
            return n
        return min(120, max(10, n))
    m = re.search(r"(\d+)\s*(?:sec(?:ond)?s?|s)\b", message, re.I)
    if m:
        n = int(m.group(1))
        if n in (10, 30, 60):
            return n
        return min(120, max(10, n))
    if re.search(r"\b(10\s*sec|10\s*s|10-?second)\b", message, re.I):
        return 10
    if re.search(r"\b(30\s*sec|30\s*s|30-?second)\b", message, re.I):
        return 30
    if re.search(r"\b(1\s*min|one\s*min|60\s*sec|60\s*s|minute)\b", message, re.I):
        return 60
    return 10


def scene_prompts(base_prompt: str, count: int) -> list[str]:
    core = base_prompt.strip()[:400] or "cinematic photorealistic scene"
    angles = [
        "ultra wide establishing shot, golden hour, photorealistic 8k, ARRI camera",
        "slow cinematic dolly in, shallow depth of field, anamorphic bokeh",
        "dramatic low angle hero shot, volumetric god rays, hyperreal",
        "intimate close-up, skin texture detail, natural lighting",
        "aerial drone sweep, epic landscape scale, cinematic grade",
        "tracking side shot, subtle motion blur, film grain",
        "silhouette against sunset, HDR, professional color science",
        "medium composition, realistic materials, studio quality",
        "slow push-in, atmospheric particles, IMAX clarity",
        "wide pan left to right, blockbuster framing",
        "magic hour rim light, premium commercial look",
        "final hero frame, razor sharp, no watermark no text",
    ]
    return [f"{core}. {angles[i % len(angles)]}" for i in range(count)]


def _bytes_to_bgr(data: bytes) -> np.ndarray | None:
    try:
        import cv2  # type: ignore

        arr = np.frombuffer(data, dtype=np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)
    except Exception as exc:
        log.warning("decode image failed: %s", exc)
        return None


def _ken_burns_frame(
    bgr: np.ndarray,
    t: float,
    out_w: int,
    out_h: int,
    variant: int,
    *,
    subtle_motion: bool = False,
) -> np.ndarray:
    import cv2  # type: ignore

    h, w = bgr.shape[:2]
    if subtle_motion:
        scale = 1.0 + 0.02 * t
        pan_mult_x = 0.08
        pan_mult_y = 0.04
    else:
        scale = (1.0 + (variant % 3) * 0.02) + (0.10 + (variant % 2) * 0.04) * t
        pan_mult_x = 0.58
        pan_mult_y = 0.15
    nw, nh = max(out_w, int(w * scale)), max(out_h, int(h * scale))
    resized = cv2.resize(bgr, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    if subtle_motion:
        pan_x = int((nw - out_w) * (0.45 + pan_mult_x * t))
        pan_y = int((nh - out_h) * pan_mult_y * t)
    else:
        pan_x = int((nw - out_w) * (0.12 + pan_mult_x * t if variant % 2 else pan_mult_x - 0.38 * t))
        pan_y = int((nh - out_h) * (pan_mult_y * t if variant % 3 == 0 else 0.08))
    pan_x = max(0, min(pan_x, nw - out_w))
    pan_y = max(0, min(pan_y, nh - out_h))
    crop = resized[pan_y : pan_y + out_h, pan_x : pan_x + out_w]
    if crop.shape[0] != out_h or crop.shape[1] != out_w:
        crop = cv2.resize(crop, (out_w, out_h))
    return crop


def _ffmpeg_exe() -> str | None:
    from services.process_utils import ffmpeg_executable

    return ffmpeg_executable()


def transcode_h264(src: Path, dst: Path, *, keep_audio: bool = False) -> bool:
    """Browser-compatible H.264 + faststart for HTML5 video."""
    ffmpeg = _ffmpeg_exe()
    if not ffmpeg:
        return False
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(src),
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
    ]
    if keep_audio:
        cmd.extend(["-c:a", "aac", "-b:a", "128k"])
    else:
        cmd.append("-an")
    cmd.append(str(dst))
    try:
        from services.process_utils import run_subprocess_safe

        proc, err = run_subprocess_safe(cmd, timeout=300)
        if proc is None or proc.returncode != 0:
            log.warning("h264 transcode failed: %s", err or (proc.stderr if proc else "unknown"))
            return False
        return dst.is_file() and dst.stat().st_size > 10_000
    except Exception as exc:
        log.warning("h264 transcode failed: %s", exc)
        return False


async def fetch_ambient_audio_bytes(prompt: str, *, api_key: str = "") -> bytes | None:
    """Best-effort cinematic audio via Pollinations (or silent pad fallback)."""
    encoded = quote(prompt[:400])
    headers: dict[str, str] = {}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    urls = [
        f"https://gen.pollinations.ai/audio/{encoded}",
        f"https://text.pollinations.ai/audio/{encoded}",
    ]
    async with httpx.AsyncClient(timeout=90.0, follow_redirects=True) as client:
        for url in urls:
            try:
                res = await client.get(url, headers=headers)
                if res.status_code == 200 and len(res.content) > 8_000:
                    return res.content
            except Exception:
                continue
    return None


def mux_audio_into_video(video_path: Path, audio_bytes: bytes, *, duration_hint: int = 10) -> bool:
    """Mux AAC audio into an existing MP4 (re-encode for browser compatibility)."""
    ffmpeg = _ffmpeg_exe()
    if not ffmpeg or not video_path.is_file():
        return False
    audio_tmp = video_path.with_suffix(".audio.bin")
    out_tmp = video_path.with_suffix(".mux.mp4")
    try:
        audio_tmp.write_bytes(audio_bytes)
        dur = max(4, min(120, duration_hint))
        from services.process_utils import run_subprocess_safe

        proc, err = run_subprocess_safe(
            [
                ffmpeg,
                "-y",
                "-i",
                str(video_path),
                "-i",
                str(audio_tmp),
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-crf",
                "20",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-shortest",
                "-t",
                str(dur),
                "-movflags",
                "+faststart",
                str(out_tmp),
            ],
            timeout=300,
        )
        if proc is None or proc.returncode != 0:
            raise RuntimeError(err or "ffmpeg mux failed")
        if out_tmp.is_file() and out_tmp.stat().st_size > 10_000:
            shutil.move(str(out_tmp), str(video_path))
            return True
    except Exception as exc:
        log.warning("audio mux failed: %s", exc)
    finally:
        audio_tmp.unlink(missing_ok=True)
        out_tmp.unlink(missing_ok=True)
    return False


async def attach_cinematic_audio(
    video_path: Path,
    *,
    style: str,
    duration: int,
    pollinations_key: str = "",
) -> bool:
    try:
        audio = await asyncio.wait_for(
            fetch_ambient_audio_bytes(style, api_key=pollinations_key),
            timeout=18.0,
        )
    except asyncio.TimeoutError:
        audio = None
    if audio:
        return mux_audio_into_video(video_path, audio, duration_hint=duration)
    return await asyncio.to_thread(_mux_lavfi_ambient, video_path, duration)


def _mux_lavfi_ambient(video_path: Path, duration: int) -> bool:
    ffmpeg = _ffmpeg_exe()
    if not ffmpeg or not video_path.is_file():
        return False
    out_tmp = video_path.with_suffix(".amb.mp4")
    try:
        from services.process_utils import run_subprocess_safe

        proc, err = run_subprocess_safe(
            [
                ffmpeg,
                "-y",
                "-i",
                str(video_path),
                "-f",
                "lavfi",
                "-i",
                f"anoisesrc=d={max(4, min(duration, 15))}:c=pink:a=0.012",
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                "-b:a",
                "96k",
                "-shortest",
                "-movflags",
                "+faststart",
                str(out_tmp),
            ],
            timeout=25,
        )
        if proc is None or proc.returncode != 0:
            raise RuntimeError(err or "ffmpeg ambient mux failed")
        if out_tmp.is_file() and out_tmp.stat().st_size > 10_000:
            shutil.move(str(out_tmp), str(video_path))
            return True
    except Exception:
        pass
    finally:
        out_tmp.unlink(missing_ok=True)
    return False


def compose_cinematic_mp4(
    scene_images: list[bytes],
    output_path: Path,
    *,
    duration_seconds: int,
    source_locked: bool = False,
    fast_mode: bool = False,
) -> bool:
    import cv2  # type: ignore

    if not scene_images:
        return False

    fps_use = 12 if fast_mode else FPS
    if fast_mode:
        scene_images = scene_images[:1]
    scenes = len(scene_images)
    if fast_mode:
        frames_per_scene = min(120, max(48, duration_seconds * fps_use))
    else:
        frames_per_scene = max(1, int((duration_seconds / scenes) * fps_use))
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer: Any = None
    tmp = output_path.with_suffix(".raw.mp4")

    try:
        for idx, img_bytes in enumerate(scene_images):
            bgr = _bytes_to_bgr(img_bytes)
            if bgr is None:
                continue
            for fi in range(frames_per_scene):
                t = fi / max(frames_per_scene - 1, 1)
                frame = _ken_burns_frame(bgr, t, FRAME_W, FRAME_H, idx)
                if writer is None:
                    writer = cv2.VideoWriter(
                        str(tmp), fourcc, fps_use, (FRAME_W, FRAME_H)
                    )
                writer.write(frame)
        if writer is not None:
            writer.release()
        if not tmp.is_file() or tmp.stat().st_size < 10_000:
            return False
        if transcode_h264(tmp, output_path):
            tmp.unlink(missing_ok=True)
            return True
        shutil.copyfile(tmp, output_path)
        tmp.unlink(missing_ok=True)
        return output_path.is_file()
    except Exception as exc:
        log.exception("compose cinematic mp4 failed: %s", exc)
        if writer is not None:
            writer.release()
        tmp.unlink(missing_ok=True)
    return False


async def _download_url(client: httpx.AsyncClient, url: str) -> bytes | None:
    try:
        r = await client.get(url, timeout=120.0, follow_redirects=True)
        if r.status_code == 200 and r.content:
            return r.content
    except Exception as exc:
        log.debug("download %s: %s", url[:60], exc)
    return None


async def _replicate_prediction_bytes(
    client: httpx.AsyncClient,
    token: str,
    model_path: str,
    payload: dict,
    *,
    max_polls: int = 90,
    poll_sec: float = 2.0,
) -> bytes | None:
    create = await client.post(
        f"https://api.replicate.com/v1/models/{model_path}/predictions",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"input": payload},
    )
    if create.status_code >= 400:
        log.warning("replicate %s create %s", model_path, create.status_code)
        return None
    pred = create.json()
    poll_url = pred.get("urls", {}).get("get") or pred.get("url")
    if not poll_url:
        return None
    for _ in range(max_polls):
        res = await client.get(poll_url, headers={"Authorization": f"Bearer {token}"})
        data = res.json()
        status = data.get("status")
        if status == "succeeded":
            out = data.get("output")
            if isinstance(out, str):
                return await _download_url(client, out)
            if isinstance(out, list) and out:
                first = out[0]
                if isinstance(first, str):
                    return await _download_url(client, first)
            return None
        if status in ("failed", "canceled"):
            log.warning("replicate %s %s", model_path, data.get("error"))
            return None
        await asyncio.sleep(poll_sec)
    return None


async def _fetch_image_http(prompt: str, client: httpx.AsyncClient) -> bytes | None:
    seed = hashlib.sha256(prompt.encode()).hexdigest()[:10]
    for url in (
        pollinations_url(prompt),
        f"https://picsum.photos/seed/{seed}/{FRAME_W}/{FRAME_H}",
    ):
        try:
            r = await client.get(
                url,
                headers={"User-Agent": "OmniMind-V11/1.0", "Accept": "image/*"},
                timeout=30.0 if "pollinations" in url else 45.0,
            )
            if r.status_code == 200 and len(r.content) > 5000:
                return r.content
        except Exception:
            pass
    return None


async def _fetch_scene_images(
    prompts: list[str],
    *,
    replicate_token: str = "",
    on_progress: Optional[Callable[[str], None]] = None,
) -> list[bytes]:
    flux_ok = True
    sem = asyncio.Semaphore(2)
    results: list[bytes | None] = [None] * len(prompts)

    async def one(i: int, prompt: str) -> None:
        nonlocal flux_ok
        async with sem:
            if on_progress:
                label = "Flux HD" if replicate_token and flux_ok else "Scene"
                on_progress(f"{label} {i + 1}/{len(prompts)}…")
            async with httpx.AsyncClient(follow_redirects=True) as client:
                if replicate_token and flux_ok:
                    img = await _replicate_prediction_bytes(
                        client,
                        replicate_token,
                        "black-forest-labs/flux-schnell",
                        {"prompt": prompt[:800], "num_outputs": 1},
                        max_polls=25,
                        poll_sec=1.5,
                    )
                    if img:
                        results[i] = img
                        return
                    flux_ok = False
                results[i] = await _fetch_image_http(prompt, client)

    await asyncio.gather(*(one(i, p) for i, p in enumerate(prompts)))
    return [b for b in results if b]


async def _try_replicate_motion_clip(
    prompt: str,
    token: str,
    *,
    image_input: str | None = None,
    init_image_weight: float = 1.0,
    denoising_strength: float | None = None,
    image_guidance_scale: float | None = None,
    max_polls: int = 90,
    i2v_model_limit: int = 3,
) -> bytes | None:
    ds = denoising_strength if denoising_strength is not None else 0.2
    igs = image_guidance_scale if image_guidance_scale is not None else ds
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        if image_input:
            payloads = build_i2v_replicate_payloads(
                prompt,
                image_input,
                init_image_weight=init_image_weight,
            )[: max(1, i2v_model_limit)]
            for model_path, payload in payloads:
                payload["denoising_strength"] = max(0.1, min(0.25, ds))
                if "cond_aug" in payload:
                    payload["cond_aug"] = min(0.05, float(igs) * 0.15)
                if "motion_bucket_id" in payload:
                    payload["motion_bucket_id"] = min(64, int(40 + ds * 80))
                clip = await _replicate_prediction_bytes(
                    client,
                    token,
                    model_path,
                    payload,
                    max_polls=max_polls,
                    poll_sec=2.0,
                )
                if clip and len(clip) > 20_000:
                    return clip
        return await _replicate_prediction_bytes(
            client,
            token,
            "minimax/video-01",
            {"prompt": prompt[:800]},
            max_polls=max_polls,
            poll_sec=2.0,
        )


async def _try_pollinations_video(prompt: str, api_key: str) -> bytes | None:
    encoded = quote(prompt[:500])
    url = f"https://gen.pollinations.ai/video/{encoded}?model=seedance"
    try:
        async with httpx.AsyncClient(timeout=240.0, follow_redirects=True) as client:
            r = await client.get(url, headers={"Authorization": f"Bearer {api_key}"})
            if r.status_code == 200 and len(r.content) > 20_000:
                return r.content
    except Exception as exc:
        log.debug("pollinations video: %s", exc)
    return None


def public_video_url(filename: str) -> str:
    return f"/api/v1/tools/media/generated/{filename}"


def _finalize_video(raw_path: Path, final_path: Path) -> bool:
    if transcode_h264(raw_path, final_path):
        if raw_path != final_path:
            raw_path.unlink(missing_ok=True)
        return True
    if raw_path != final_path:
        shutil.move(str(raw_path), str(final_path))
    return final_path.is_file() and final_path.stat().st_size > 10_000


async def generate_video(
    message: str,
    *,
    english_prompt: str,
    image_refs: Optional[list[str]] = None,
    user_id: str = "guest",
    source_image_id: Optional[str] = None,
    init_image_weight: Optional[float] = None,
    init_image: Optional[str] = None,
    diffusion_overrides: Optional[dict] = None,
    on_progress: Optional[Callable[[str], None]] = None,
    job_id: Optional[str] = None,
) -> dict[str, Any]:
    """
    Free cinematic video — LM Studio prompt analysis + Hugging Face Wan 2.1 Space.
    No RunwayML. Images via Pollinations (free).
    """
    from services.api_keys import get_key
    from services.free_video_providers import generate_free_neural_video
    from services.prompt_enhancement import enhance_cinematic_video_prompt_async
    from services.video_job_queue import progress_callback_for_job

    overrides = dict(diffusion_overrides or {})
    overrides.pop("audio_style", None)
    overrides.pop("mux_audio", None)
    strict_i2v_lock = bool(overrides.get("init_image_locked") or overrides.get("frame_zero_lock"))

    video_id = str(uuid.uuid4())
    filename = f"{video_id}.mp4"
    output_path = VIDEO_DIR / filename

    job_cb = progress_callback_for_job(job_id)

    def push(msg: str, pct: int = 0) -> None:
        if job_cb:
            job_cb(msg, pct)
        if on_progress:
            on_progress(msg)

    push("LM Studio · prompt samajh kar enhance ho raha hai…", 2)
    cinematic = await enhance_cinematic_video_prompt_async(message or english_prompt)
    duration = cinematic["duration_seconds"]
    full_prompt = (
        f"{cinematic['prompt']}\n\n{cinematic['negative_constraints']}"
    )

    init_bytes: bytes | None = None
    if source_image_id:
        init_bytes = load_source_frame_bytes(source_image_id, user_id=user_id)
    if not init_bytes and init_image:
        from services.video_source_store import store_source_frame_base64

        try:
            meta = store_source_frame_base64(
                user_id,
                init_image,
                filename=image_refs[0] if image_refs else "init_frame.jpg",
            )
            source_image_id = source_image_id or meta.get("source_image_id")
            init_bytes = load_source_frame_bytes(source_image_id, user_id=user_id)
        except Exception:
            pass

    has_source = init_bytes is not None and len(init_bytes) > 500
    if strict_i2v_lock and not has_source:
        return {
            "error": (
                "INIT_IMAGE LOCKED was requested, but no valid Frame 0 image token "
                "reached the conditioning layer. Upload the source image again."
            ),
            "video_url": None,
            "provider": "none",
        }
    poster_url = (
        f"/api/v1/tools/media/source-frame/{source_image_id}"
        if has_source and source_image_id
        else pollinations_url(cinematic["prompt"][:400])
    )

    hf_ok = bool(
        get_settings().huggingface_api_key.strip()
        or get_key("HUGGINGFACE_API_KEY")
    )
    if not hf_ok:
        return {
            "error": (
                "Free video ke liye HUGGINGFACE_API_KEY chahiye backend/.env mein. "
                "huggingface.co/settings/tokens se free token banayein (Inference permission)."
            ),
            "video_url": None,
        }

    if strict_i2v_lock:
        full_prompt = (
            "STRICT IMAGE-TO-VIDEO FRAME 0 LOCK. The uploaded source frame is the "
            "identity anchor. Preserve the same face, clothing, body posture, "
            "subject scale, and scene composition with 95% pixel-consistency target. "
            "Do not replace the person, do not change wardrobe, do not invent "
            "underwater/space/random backgrounds, and do not detach the subject. "
            f"\n\n{full_prompt}"
        )
        push("INIT_IMAGE LOCKED · base64 source injected · CLIP guidance 0.95…", 6)
    else:
        push(
            "Free engine · Wan 2.1 (Hugging Face) · LM Studio ne prompt analyze kiya…",
            6,
        )
    wan_key = get_settings().wan_api_key.strip() or get_key("WAN_API_KEY")
    clip, provider = await generate_free_neural_video(
        full_prompt,
        image_bytes=init_bytes if has_source else None,
        wan_key=wan_key,
        strict_i2v_lock=strict_i2v_lock,
        on_progress=lambda m, p: push(m, p),
    )

    if not clip or len(clip) < 25_000:
        return {
            "error": (
                "Video ban nahi ho saki. Hugging Face GPU queue busy ho sakti hai "
                "(free ~5 min/day). 5–10 minute baad dubara /video try karein. "
                "Pictures ke liye /image abhi bhi free hai (Pollinations)."
            ),
            "video_url": None,
            "provider": provider,
            "hint": "LM Studio chalu rakhein taake Urdu/Roman prompts sahi samjhe jayein.",
        }

    output_path.write_bytes(clip)
    _finalize_video(output_path, output_path)
    push("Cinematic MP4 ready · HD stream", 100)

    return {
        "video_url": public_video_url(filename),
        "video_id": video_id,
        "duration_seconds": duration,
        "scene_count": 1,
        "provider": provider,
        "poster_url": poster_url,
        "has_motion_clip": True,
        "has_audio": False,
        "source_image_id": source_image_id,
        "image_to_video_locked": has_source,
        "init_image_locked": strict_i2v_lock,
        "clip_guidance_scale": overrides.get(
            "clip_guidance_scale",
            0.95 if strict_i2v_lock else None,
        ),
        "pixel_consistency_target": overrides.get(
            "pixel_consistency_target",
            0.95 if strict_i2v_lock else None,
        ),
        "enhanced_prompt": cinematic["prompt"][:500],
        "prompt_source": cinematic.get("prompt_source", "rule_based"),
        "engine": "free_lm_hf_wan21",
    }
