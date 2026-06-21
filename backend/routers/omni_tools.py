"""
OmniMind V11 specialized tool routes (image, music, research, video, uploads, labs).
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any, Literal, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import Field

from schemas.strict import StrictModel
from services.image_synthesis import synthesize_visual
from services.fast_image_response import synthesize_with_timeout
from services.omni_tool_handlers import dispatch_tool
from services.visual_context_manager import VisualContextManager
from services.tool_context import get_session
from services.video_pipeline import run_video_pipeline
from services.context_manager import ContextManager
from services.image_inpainting import IMAGE_DIR
from services.video_generation import VIDEO_DIR
from services.video_source_store import resolve_path, store_source_frame_base64

router = APIRouter(prefix="/api/v1/tools", tags=["omni-tools"])


class SubjectSegmentationModel(StrictModel):
    kind: str = "ellipse"
    cx: float = 0.5
    cy: float = 0.44
    rx: float = 0.36
    ry: float = 0.4


class VideoSourceUploadRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=128)
    image_base64: str = Field(min_length=32, max_length=8_388_608)
    filename: str = Field(default="source.jpg", max_length=256)


class VideoGenerateRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=16000)
    agent_id: str = Field(default="sovereign-core", min_length=1, max_length=64)
    image_refs: list[str] = Field(default_factory=list, max_length=16)
    video_refs: list[str] = Field(default_factory=list, max_length=8)
    audio_refs: list[str] = Field(default_factory=list, max_length=8)
    source_image_id: Optional[str] = Field(default=None, max_length=64)
    init_image_weight: float = Field(default=1.0, ge=0.5, le=1.0)
    init_image: Optional[str] = Field(default=None, max_length=8_388_608)
    init_image_locked: bool = False
    clip_guidance_scale: Optional[float] = Field(default=None, ge=0.5, le=0.99)
    denoising_strength: Optional[float] = Field(default=None, ge=0.05, le=1.0)
    image_guidance_scale: Optional[float] = Field(default=None, ge=0.05, le=2.0)
    history: list[dict[str, Any]] = Field(default_factory=list, max_length=50)


class ImageSynthesizeRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=16000)
    agent_id: str = Field(default="sovereign-core", min_length=1, max_length=64)
    reference_media_id: Optional[str] = Field(default=None, max_length=64)
    background_description: Optional[str] = Field(default=None, max_length=4000)
    subject_segmentation: Optional[SubjectSegmentationModel] = None
    mode: Optional[Literal["generate", "inpaint"]] = None
    style: Optional[str] = Field(default=None, max_length=32)
    aspect_ratio: Optional[Literal["square", "portrait", "landscape"]] = None
    negative_prompt: Optional[str] = Field(default=None, max_length=1000)


class ToolMessageRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=16000)
    tool: Optional[
        Literal[
            "video",
            "create_image",
            "create_music",
            "deep_research",
            "web_search",
            "thinking",
            "uploads",
            "personal_intelligence",
            "app_build",
            "architecture",
        ]
    ] = None
    image_refs: list[str] = Field(default_factory=list, max_length=16)
    video_refs: list[str] = Field(default_factory=list, max_length=8)
    audio_refs: list[str] = Field(default_factory=list, max_length=8)
    file_refs: list[dict[str, str]] = Field(default_factory=list, max_length=32)
    history: list[dict[str, Any]] = Field(default_factory=list, max_length=50)
    labs_prefs: Optional[dict[str, Any]] = None
    agent_id: str = Field(default="sovereign-core", min_length=1, max_length=64)
    async_mode: bool = True


_IMAGE_JOBS: dict[str, dict[str, Any]] = {}


class UploadFileMeta(StrictModel):
    name: str = Field(min_length=1, max_length=512)
    kind: Literal["text", "notebook", "image", "document", "video", "audio"] = "text"
    size_bytes: Optional[int] = Field(default=None, ge=0, le=500_000_000)


class MultiUploadRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=128)
    message: str = Field(default="", max_length=8000)
    files: list[UploadFileMeta] = Field(min_length=1, max_length=32)


@router.post("/dispatch")
async def tools_dispatch(body: ToolMessageRequest) -> dict[str, Any]:
    try:
        return await dispatch_tool(
            user_id=body.user_id,
            message=body.message,
            tool=body.tool,
            image_refs=body.image_refs,
            video_refs=body.video_refs,
            audio_refs=body.audio_refs,
            file_refs=body.file_refs,
            history=body.history,
            labs_prefs=body.labs_prefs,
            agent_id=body.agent_id,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Tool dispatch failed: {exc}") from exc


@router.get("/context/{user_id}")
async def get_user_context(user_id: str) -> dict[str, Any]:
    return VisualContextManager.snapshot(user_id)


@router.post("/image/synthesize")
async def image_synthesize(body: ImageSynthesizeRequest) -> dict[str, Any]:
    """High-fidelity text-to-image + multi-turn in-painting (General Chatbot visual engine)."""
    import os

    from services.fast_image_response import _preview_from_pollinations, synthesize_with_timeout

    fast_default = os.getenv("OMNIMIND_IMAGE_FAST_PATH", "1").strip().lower() in (
        "1",
        "true",
        "yes",
    )
    if fast_default:
        return _preview_from_pollinations(
            message=body.message,
            user_id=body.user_id,
            agent_id=body.agent_id,
        )

    try:
        seg = (
            body.subject_segmentation.model_dump()
            if body.subject_segmentation
            else None
        )
        return await synthesize_with_timeout(
            user_id=body.user_id,
            message=body.message,
            agent_id=body.agent_id,
            reference_media_id=body.reference_media_id,
            background_description=body.background_description,
            subject_segmentation=seg,
            force_mode=body.mode,
            style=body.style,
            aspect_ratio=body.aspect_ratio,
            negative_prompt=body.negative_prompt,
        )
    except Exception:
        return _preview_from_pollinations(
            message=body.message,
            user_id=body.user_id,
            agent_id=body.agent_id,
        )


@router.get("/media/generated/{filename}")
async def serve_generated_video(filename: str) -> FileResponse:
    import re

    if not re.match(r"^[0-9a-f-]{8,}\.mp4$", filename, re.I):
        raise HTTPException(status_code=404, detail="Not found")
    path = VIDEO_DIR / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(
        path,
        media_type="video/mp4",
        filename=filename,
        headers={"Accept-Ranges": "bytes", "Cache-Control": "public, max-age=3600"},
    )


@router.get("/media/generated-image/{filename}")
async def serve_generated_image(filename: str) -> FileResponse:
    import re

    if not re.match(r"^[0-9a-f-]{8,}\.(png|jpg|jpeg|webp)$", filename, re.I):
        raise HTTPException(status_code=404, detail="Not found")
    path = IMAGE_DIR / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Image not found")
    media = "image/png" if filename.lower().endswith(".png") else "image/jpeg"
    return FileResponse(
        path,
        media_type=media,
        filename=filename,
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.get("/media/source-frame/{source_image_id}")
async def serve_source_frame(source_image_id: str) -> FileResponse:
    import re

    if not re.match(r"^[0-9a-f\-]{8,}$", source_image_id, re.I):
        raise HTTPException(status_code=404, detail="Not found")
    path = resolve_path(source_image_id)
    if not path or not path.is_file():
        raise HTTPException(status_code=404, detail="Source frame not found")
    return FileResponse(
        path,
        media_type="image/jpeg",
        filename=f"{source_image_id}.jpg",
        headers={"Cache-Control": "public, max-age=7200"},
    )


@router.post("/video/upload-source")
async def video_upload_source(body: VideoSourceUploadRequest) -> dict[str, Any]:
    try:
        meta = store_source_frame_base64(
            body.user_id,
            body.image_base64,
            filename=body.filename,
        )
        return {"success": True, **meta, "init_image_weight": 1.0}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Upload failed: {exc}") from exc


async def _prepare_video_request(body: VideoGenerateRequest) -> tuple[Optional[str], dict[str, Any]]:
    from services.video_diffusion_gateway import resolve_diffusion_overrides
    from services.video_image_conditioning import bytes_to_data_uri
    from services.video_source_store import load_source_frame_bytes

    source_image_id = body.source_image_id
    init_image = body.init_image
    if body.init_image and not source_image_id:
        meta = store_source_frame_base64(
            body.user_id,
            body.init_image,
            filename=body.image_refs[0] if body.image_refs else "init_frame.jpg",
        )
        source_image_id = meta["source_image_id"]
    if source_image_id and not init_image:
        source_bytes = load_source_frame_bytes(source_image_id, user_id=body.user_id)
        if source_bytes:
            init_image = bytes_to_data_uri(source_bytes)

    init_locked = bool(body.init_image_locked or source_image_id or init_image)
    diffusion = resolve_diffusion_overrides(
        init_image,
        init_image_weight=body.init_image_weight,
        denoising_strength=body.denoising_strength,
        image_guidance_scale=body.image_guidance_scale,
        init_image_locked=init_locked,
        init_image_token=source_image_id,
        clip_guidance_scale=body.clip_guidance_scale,
    )
    diffusion["conditioning_image_base64"] = init_image
    diffusion["conditioning_source_image_id"] = source_image_id
    return source_image_id, diffusion


async def _run_video_job(job_id: str, body: VideoGenerateRequest) -> None:
    import asyncio

    from services.video_job_queue import complete_job, fail_job

    try:
        source_image_id, diffusion = await _prepare_video_request(body)
        result = await asyncio.wait_for(
            run_video_pipeline(
                user_id=body.user_id,
                message=body.message,
                image_refs=body.image_refs,
                video_refs=body.video_refs,
                audio_refs=body.audio_refs,
                source_image_id=source_image_id,
                init_image_weight=diffusion["init_image_weight"],
                init_image=diffusion.get("conditioning_image_base64") or body.init_image,
                diffusion_overrides=diffusion,
                job_id=job_id,
            ),
            timeout=600.0,
        )
        complete_job(job_id, result)
    except Exception as exc:
        fail_job(job_id, str(exc))


@router.post("/video/generate/start")
async def video_generate_start(body: VideoGenerateRequest) -> dict[str, Any]:
    """Queue free Wan 2.1 render — poll GET /video/jobs/{job_id} for live progress."""
    import asyncio

    from services.video_job_queue import create_job

    job = create_job(body.user_id)
    asyncio.create_task(_run_video_job(job.id, body))
    return {
        "job_id": job.id,
        "status": "queued",
        "message": "Free cinematic render queued (LM Studio + Hugging Face Wan 2.1)…",
        "progress": 0,
    }


@router.post("/video/generate")
async def video_generate(body: VideoGenerateRequest) -> dict[str, Any]:
    """Blocking free cinematic render — waits until MP4 is fully ready."""
    import asyncio

    from services.video_job_queue import complete_job, create_job, fail_job, job_snapshot

    try:
        job = create_job(body.user_id)
        await _run_video_job(job.id, body)
        snap = job_snapshot(job.id)
        if not snap:
            raise HTTPException(status_code=500, detail="Video job lost")
        if snap["status"] == "failed":
            raise HTTPException(status_code=500, detail=snap.get("error") or "Video failed")
        result = snap.get("result") or {}
        result["job_id"] = job.id
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Video pipeline error: {exc}") from exc


@router.get("/video/jobs/{job_id}")
async def video_job_status(job_id: str) -> dict[str, Any]:
    from services.video_job_queue import job_snapshot

    snap = job_snapshot(job_id)
    if not snap:
        raise HTTPException(status_code=404, detail="Video job not found")
    return snap


@router.get("/video/session/{user_id}")
async def video_session(user_id: str) -> dict[str, Any]:
    sess = get_session(user_id)
    last = sess.last_video
    return {
        "user_id": user_id,
        "has_last_video": last is not None,
        "last_video_id": last.id if last else None,
        "pending_queue": sess.pending_video_queue,
        "history_count": len(sess.video_history),
    }


@router.post("/image/generate")
async def image_generate(body: ToolMessageRequest) -> dict[str, Any]:
    VisualContextManager.set_active_chat_agent(body.user_id, body.agent_id)
    from services.fast_image_response import _preview_from_pollinations

    async def _run_sync_image() -> dict[str, Any]:
        return await synthesize_visual(
            user_id=body.user_id,
            message=body.message,
            agent_id=body.agent_id,
        )

    if body.async_mode:
        job_id = uuid4().hex
        _IMAGE_JOBS[job_id] = {
            "job_id": job_id,
            "status": "queued",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "result": None,
            "error": None,
        }

        async def _run() -> None:
            _IMAGE_JOBS[job_id]["status"] = "running"
            try:
                try:
                    # Smart hybrid failover: if local path is slow, use fast cloud fallback.
                    res = await asyncio.wait_for(_run_sync_image(), timeout=5.0)
                except asyncio.TimeoutError:
                    res = _preview_from_pollinations(
                        message=body.message,
                        user_id=body.user_id,
                        agent_id=body.agent_id,
                    )
                _IMAGE_JOBS[job_id]["status"] = "completed"
                _IMAGE_JOBS[job_id]["result"] = res
            except Exception as exc:
                _IMAGE_JOBS[job_id]["status"] = "failed"
                _IMAGE_JOBS[job_id]["error"] = str(exc)

        asyncio.create_task(_run())
        return {
            "job_id": job_id,
            "status": "queued",
            "message": "Image generation queued. Poll /api/v1/tools/image/jobs/{job_id}",
        }

    try:
        return await asyncio.wait_for(_run_sync_image(), timeout=5.0)
    except asyncio.TimeoutError:
        return _preview_from_pollinations(
            message=body.message,
            user_id=body.user_id,
            agent_id=body.agent_id,
        )


@router.get("/image/jobs/{job_id}")
async def image_generate_status(job_id: str) -> dict[str, Any]:
    job = _IMAGE_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Image job not found")
    return job


@router.post("/music/compose")
async def music_compose(body: ToolMessageRequest) -> dict[str, Any]:
    return await dispatch_tool(
        user_id=body.user_id,
        message=body.message,
        tool="create_music",
        audio_refs=body.audio_refs,
    )


@router.post("/research/deep")
async def research_deep(body: ToolMessageRequest) -> dict[str, Any]:
    return await dispatch_tool(
        user_id=body.user_id,
        message=body.message,
        tool="deep_research",
    )


@router.post("/search/web")
async def search_web(body: ToolMessageRequest) -> dict[str, Any]:
    return await dispatch_tool(
        user_id=body.user_id,
        message=body.message,
        tool="web_search",
    )


@router.post("/thinking/run")
async def thinking_run(body: ToolMessageRequest) -> dict[str, Any]:
    return await dispatch_tool(
        user_id=body.user_id,
        message=body.message,
        tool="thinking",
        history=body.history,
    )


@router.post("/uploads/process")
async def uploads_process(body: MultiUploadRequest) -> dict[str, Any]:
    files = [{"name": f.name, "kind": f.kind} for f in body.files]
    return await dispatch_tool(
        user_id=body.user_id,
        message=body.message or "Process uploaded files",
        tool="uploads",
        file_refs=files,
    )


@router.post("/labs/profile")
async def labs_profile(body: ToolMessageRequest) -> dict[str, Any]:
    return await dispatch_tool(
        user_id=body.user_id,
        message=body.message,
        tool="personal_intelligence",
        labs_prefs=body.labs_prefs,
    )


@router.get("/health")
async def tools_health(request: Request) -> dict[str, Any]:
    from database import ping

    db = ping()
    return {
        "status": "ok",
        "tools": [
            "video",
            "create_image",
            "app_build",
            "architecture",
            "create_music",
            "deep_research",
            "web_search",
            "thinking",
            "uploads",
            "personal_intelligence",
        ],
        "mongodb": db.get("connected", False),
    }
