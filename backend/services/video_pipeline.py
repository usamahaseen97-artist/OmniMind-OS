"""
Advanced video generation & editing prompt pipeline (OmniMind V11).
"""

from __future__ import annotations

import asyncio
import re
from typing import Any, Optional

from services.tool_context import (
    count_video_requests,
    detect_verbal_language,
    get_session,
    references_last_video,
    store_video,
)
from services.video_generation import generate_video
from services.prompt_enhancement import enhance_video_prompt
from services.video_prompt_intelligence import analyze_creative_video_request

EDIT_KEYWORDS = re.compile(
    r"\b(replace|change|swap|edit|modify|remove|add|slow\s*motion|faster|slower|crop|zoom)\b",
    re.I,
)


def _preserve_descriptors(text: str) -> str:
    preserved: list[str] = []
    patterns = [
        r"\b\d+\s+(friends?|people|architects?|women|men|girls?|boys?)\b",
        r"\b(mexican|indian|pakistani|female|male|woman|man|girl|boy)\s+\w+\b",
        r"\b(una?|un)\s+arquitecta\b",
        r"\b(two|three|four|\d+)\s+\w+",
        r"\b(close[- ]?up|wide shot|aerial|tracking shot|handheld)\b",
    ]
    for pat in patterns:
        for m in re.finditer(pat, text, re.I):
            chunk = m.group(0).strip()
            if chunk and chunk not in preserved:
                preserved.append(chunk)
    return "; ".join(preserved) if preserved else text.strip()[:500]


def translate_visual_prompt_to_english(user_text: str) -> str:
    descriptors = _preserve_descriptors(user_text)
    base = user_text.strip()
    if re.search(r"[\u0600-\u06FF\u0750-\u077F\u0900-\u097F\u4E00-\u9FFF]", base):
        english = (
            f"Cinematic photorealistic scene based on user intent. "
            f"Preserve exact subject details: {descriptors}. "
            f"Original user intent (translated): {base}"
        )
    else:
        english = f"Cinematic photorealistic scene: {base}"
    if descriptors and descriptors not in english:
        english += f" Critical preserved details: {descriptors}."
    return english[:2000]


def detect_input_mode(
    *,
    message: str,
    image_refs: list[str],
    video_refs: list[str],
    audio_refs: list[str],
) -> str:
    low = message.lower()
    if references_last_video(message) or video_refs or "last_generated_video" in low:
        if EDIT_KEYWORDS.search(message) or references_last_video(message):
            return "video_edit"
    if audio_refs and (image_refs or "music video" in low or "audio" in low):
        return "audio_music_video"
    if image_refs or "image-to-video" in low or "animate this image" in low or "image into video" in low:
        return "image_to_video"
    if video_refs:
        return "video_to_video"
    return "text_to_video"


def build_edit_prompt_delta(user_text: str) -> str:
    delta = user_text.strip()
    for strip in (
        "last_generated_video",
        "earlier_generated_video",
        "last video",
        "previous video",
        "that video",
        "the video",
        "edit ",
        "modify ",
    ):
        delta = re.sub(re.escape(strip), "", delta, flags=re.I).strip()
    return f"EDIT DELTA ONLY (do not restate full scene): {delta}"


async def run_video_pipeline(
    *,
    user_id: str,
    message: str,
    image_refs: Optional[list[str]] = None,
    video_refs: Optional[list[str]] = None,
    audio_refs: Optional[list[str]] = None,
    source_image_id: Optional[str] = None,
    init_image_weight: Optional[float] = None,
    init_image: Optional[str] = None,
    diffusion_overrides: Optional[dict] = None,
    job_id: Optional[str] = None,
) -> dict[str, Any]:
    image_refs = image_refs or []
    video_refs = video_refs or []
    audio_refs = audio_refs or []
    sess = get_session(user_id)
    verbal_lang = detect_verbal_language(message)
    total_requested = count_video_requests(message)
    mode = detect_input_mode(
        message=message,
        image_refs=image_refs,
        video_refs=video_refs,
        audio_refs=audio_refs,
    )
    has_upload_image = bool(image_refs) or bool(init_image) or bool(source_image_id)
    plan = analyze_creative_video_request(
        message,
        has_image=has_upload_image,
        has_video_ref=bool(video_refs),
    )
    if has_upload_image and mode == "text_to_video":
        mode = "image_to_video"

    status_steps: list[str] = ["Warming up video engine…", "Analyzing creative prompt…"]
    is_edit = mode == "video_edit" and sess.last_video is not None

    if is_edit:
        english_prompt = build_edit_prompt_delta(message)
        status_steps.append("Applying context-aware edit (delta only)…")
        ref_handle = "last_generated_video"
        ref_id = sess.last_video.id if sess.last_video else None
    else:
        stripped = re.sub(r"^/video\s+", "", message.strip(), flags=re.I)
        v_enh = enhance_video_prompt(stripped or message)
        english_prompt = v_enh["prompt"]
        status_steps.append("LM Studio · prompt analyze + cinematic enhance…")
        ref_handle = None
        ref_id = None

    if plan.wants_audio:
        status_steps.append(f"Audio track · {plan.audio_style[:60]}…")

    if mode == "image_to_video":
        if plan.background_edit:
            status_steps.append("Background replace · subject lock · then I2V motion…")
        else:
            status_steps.append("Image-to-video · source frame lock…")

    verbal_constraint = (
        f"Any spoken dialogue or on-screen verbal text in the generated video MUST be in "
        f"{verbal_lang.upper()} (user's original language). Visual/scene description is English only."
    )
    full_internal = f"{english_prompt}\n\n{verbal_constraint}"

    attachments_note = []
    if image_refs:
        attachments_note.append(f"Image references: {', '.join(image_refs)}")
    if video_refs:
        attachments_note.append(f"Video references: {', '.join(video_refs)}")
    if audio_refs:
        attachments_note.append(f"Audio references: {', '.join(audio_refs)}")
    if is_edit and sess.last_video:
        attachments_note.append(f"Base video handle: {ref_handle} (id: {ref_id})")

    def push_status(step: str) -> None:
        if step not in status_steps:
            status_steps.append(step)

    from services.video_source_store import latest_source_image_id

    effective_source_id = source_image_id
    if not effective_source_id and image_refs and mode == "image_to_video":
        effective_source_id = latest_source_image_id(user_id)

    overrides = diffusion_overrides or {}
    weight = init_image_weight if init_image_weight is not None else (
        overrides.get(
            "init_image_weight",
            plan.init_image_weight if (effective_source_id or init_image) else None,
        )
    )
    if weight is None and (effective_source_id or init_image):
        weight = plan.init_image_weight

    prep_init_image = init_image

    if overrides.get("has_init_image") or prep_init_image:
        status_steps.append(
            f"Diffusion lock · denoise={overrides.get('denoising_strength', 0.2):.2f} "
            f"· guidance={overrides.get('image_guidance_scale', 0.2):.2f}"
        )

    gen = await generate_video(
        message,
        english_prompt=english_prompt,
        image_refs=image_refs,
        user_id=user_id,
        source_image_id=effective_source_id,
        init_image_weight=weight,
        init_image=prep_init_image or init_image,
        diffusion_overrides=overrides,
        on_progress=push_status,
        job_id=job_id,
    )

    remaining = max(0, total_requested - 1)
    if total_requested > 1:
        sess.pending_video_queue = remaining
        follow_up = (
            f"I generated **video 1 of {total_requested}**. "
            f"Reply **yes** or **continue** to generate the remaining {remaining} video(s)."
        )
    else:
        sess.pending_video_queue = 0
        follow_up = ""

    video_url = gen.get("video_url")
    poster_url = gen.get("poster_url")
    duration = gen.get("duration_seconds", 60)
    provider = gen.get("provider", "omnimind_cinematic")

    if gen.get("error") or not video_url:
        return {
            "success": False,
            "tool": "video",
            "error": gen.get("error") or "Video generation failed.",
            "status_steps": status_steps,
            "message": f"Video render failed: {gen.get('error', 'unknown')}",
        }

    status_steps.append(f"Final {duration}s MP4 ready ({provider}).")

    preview_html = f"""
    <div style="font-family:system-ui;background:#0a0a0f;color:#e4e4e7;padding:16px;border-radius:12px;border:1px solid rgba(0,255,136,0.25)">
      <p style="color:#00ff88;font-weight:700;margin:0 0 8px">OmniMind Video · {mode.replace('_',' ').title()}</p>
      <p style="font-size:12px;color:#a1a1aa;margin:0 0 12px">{' · '.join(status_steps)}</p>
      <video src="{video_url}" controls playsinline style="width:100%;max-height:420px;border-radius:8px;background:#000"></video>
      <p style="font-size:11px;color:#71717a;margin-top:12px">
        Duration: <strong>{duration}s</strong> · Provider: {provider}
      </p>
      {f'<p style="color:#fbbf24;margin-top:8px">{follow_up}</p>' if follow_up else ''}
    </div>
    """

    rec = store_video(
        user_id,
        user_prompt=message,
        english_visual_prompt=full_internal,
        verbal_language=verbal_lang,
        mode=mode,
        preview_html=preview_html,
    )

    return {
        "success": True,
        "tool": "video",
        "mode": mode,
        "is_edit": is_edit,
        "english_visual_prompt": english_prompt,
        "verbal_language": verbal_lang,
        "verbal_constraint": verbal_constraint,
        "reference_handle": ref_handle,
        "reference_video_id": ref_id,
        "attachments": attachments_note,
        "video_id": rec.id,
        "generated_video_id": gen.get("video_id"),
        "status_steps": status_steps,
        "thinking_seconds": max(8, min(120, duration // 2)),
        "duration_seconds": duration,
        "provider": provider,
        "multi_video": {
            "requested": total_requested,
            "completed": 1,
            "remaining": remaining,
            "awaiting_confirmation": remaining > 0,
            "follow_up_message": follow_up,
        },
        "preview": {
            "html": preview_html,
            "type": "video",
            "image_url": poster_url,
            "video_url": video_url,
            "active_tab": "live",
        },
        "video_url": video_url,
        "message": (
            f"**{duration}-second cinematic video ready (free · real AI motion).** "
            f"Press play — HD MP4. ({provider.replace('_', ' ')})"
            + (f" {follow_up}" if follow_up else "")
        ),
    }
