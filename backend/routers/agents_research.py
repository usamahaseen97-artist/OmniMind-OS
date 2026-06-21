"""CrewAI / LangChain agent research API for dashboard chat + live preview."""

from __future__ import annotations

import asyncio
import base64
import html
import logging
import re
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import Field

from agents import resolve_agent_gemini_model, run_research_task
from schemas.strict import StrictModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])

_TEMP_ROOT = Path(__file__).resolve().parent.parent / "data" / "temp" / "research"
_ALLOWED_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}


class ResearchImageB64(StrictModel):
    filename: str = Field(default="upload.jpg", max_length=256)
    data_base64: str = Field(min_length=16, max_length=8_388_608)


class AgentResearchRequest(StrictModel):
    user_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=16000)
    agent_id: str = Field(default="sovereign-core", max_length=64)
    conversation_id: str | None = Field(default=None, max_length=128)
    image_paths: list[str] = Field(default_factory=list, max_length=8)
    images_base64: list[ResearchImageB64] = Field(default_factory=list, max_length=6)


def _strip_data_url(raw: str) -> bytes:
    payload = raw.strip()
    if "," in payload and payload.startswith("data:"):
        payload = payload.split(",", 1)[1]
    payload = re.sub(r"\s+", "", payload)
    try:
        return base64.b64decode(payload, validate=False)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 image payload.") from exc


def _safe_suffix(name: str) -> str:
    ext = Path(name).suffix.lower()
    return ext if ext in _ALLOWED_IMAGE_SUFFIXES else ".jpg"


def _persist_bytes(data: bytes, filename: str) -> Path:
    _TEMP_ROOT.mkdir(parents=True, exist_ok=True)
    path = _TEMP_ROOT / f"{uuid.uuid4().hex}{_safe_suffix(filename)}"
    path.write_bytes(data)
    return path


def _persist_b64_images(refs: list[ResearchImageB64]) -> list[Path]:
    paths: list[Path] = []
    for ref in refs:
        data = _strip_data_url(ref.data_base64)
        if len(data) < 32:
            raise HTTPException(status_code=400, detail=f"Image too small: {ref.filename}")
        paths.append(_persist_bytes(data, ref.filename))
    return paths


async def _persist_upload_files(files: list[UploadFile]) -> list[Path]:
    paths: list[Path] = []
    for upload in files:
        if not upload.filename:
            continue
        suffix = _safe_suffix(upload.filename)
        if Path(upload.filename).suffix.lower() not in _ALLOWED_IMAGE_SUFFIXES and suffix == ".jpg":
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image type: {upload.filename}",
            )
        data = await upload.read()
        if len(data) < 32:
            continue
        if len(data) > 8_388_608:
            raise HTTPException(status_code=400, detail=f"Image too large: {upload.filename}")
        paths.append(_persist_bytes(data, upload.filename))
    return paths


def _resolve_server_paths(raw_paths: list[str]) -> list[Path]:
    backend = Path(__file__).resolve().parent.parent
    resolved: list[Path] = []
    for raw in raw_paths:
        p = Path(raw)
        if not p.is_absolute():
            p = (backend / raw).resolve()
        else:
            p = p.resolve()
        if not str(p).startswith(str(backend.resolve())):
            raise HTTPException(status_code=400, detail="image_paths must stay under backend/")
        if not p.is_file():
            raise HTTPException(status_code=400, detail=f"Image not found: {raw}")
        resolved.append(p)
    return resolved


def _cleanup_paths(paths: list[Path]) -> None:
    for p in paths:
        try:
            if p.is_file() and _TEMP_ROOT in p.parents:
                p.unlink(missing_ok=True)
        except OSError:
            logger.debug("temp cleanup skipped for %s", p)


def _build_response(
    *,
    user_id: str,
    agent_id: str,
    message: str,
    report: str,
    engine: str,
    image_names: list[str],
    conversation_id: str | None,
) -> dict[str, Any]:
    safe_html = (
        f'<pre style="white-space:pre-wrap;font-size:13px;line-height:1.5;'
        f'padding:14px;margin:0">{html.escape(report)}</pre>'
    )
    return {
        "success": True,
        "tool": "deep_research",
        "agent": "researcher",
        "model": resolve_agent_gemini_model(),
        "engine": engine,
        "message": report,
        "content": report,
        "status": f"Research complete · {engine} · {resolve_agent_gemini_model()}",
        "thinking_seconds": 6,
        "preview": {
            "type": "research",
            "html": safe_html,
            "active_tab": "live",
        },
        "meta": {
            "user_id": user_id,
            "agent_id": agent_id,
            "conversation_id": conversation_id,
            "had_images": bool(image_names),
            "images_used": image_names,
        },
    }


async def _execute_research(
    *,
    user_id: str,
    message: str,
    agent_id: str,
    conversation_id: str | None,
    temp_paths: list[Path],
    server_paths: list[Path],
) -> dict[str, Any]:
    all_paths = [*server_paths, *temp_paths]
    image_names = [p.name for p in all_paths]
    try:
        report, engine = await asyncio.to_thread(
            run_research_task,
            message,
            image_paths=all_paths or None,
        )
    except Exception as exc:
        logger.exception("agent research failed")
        raise HTTPException(status_code=500, detail=str(exc)[:500]) from exc
    finally:
        _cleanup_paths(temp_paths)

    return _build_response(
        user_id=user_id,
        agent_id=agent_id,
        message=message,
        report=report,
        engine=engine,
        image_names=image_names,
        conversation_id=conversation_id,
    )


@router.post("/research")
async def agent_research_json(body: AgentResearchRequest) -> dict[str, Any]:
    """
    JSON research endpoint — accepts prompt + optional base64 images or server image_paths.
    Response shape matches OmniMind tool dispatch (message + preview) for dashboard UI.
    """
    temp_paths = _persist_b64_images(body.images_base64)
    server_paths = _resolve_server_paths(body.image_paths)
    return await _execute_research(
        user_id=body.user_id,
        message=body.message.strip(),
        agent_id=body.agent_id,
        conversation_id=body.conversation_id,
        temp_paths=temp_paths,
        server_paths=server_paths,
    )


@router.post("/research/upload")
async def agent_research_multipart(
    user_id: str = Form(...),
    message: str = Form(...),
    agent_id: str = Form(default="sovereign-core"),
    conversation_id: str | None = Form(default=None),
    images: list[UploadFile] = File(default=[]),
) -> dict[str, Any]:
    """Multipart research — dashboard file uploads from the + attachment menu."""
    if not message.strip():
        raise HTTPException(status_code=400, detail="message is required")
    temp_paths = await _persist_upload_files(images)
    return await _execute_research(
        user_id=user_id.strip(),
        message=message.strip(),
        agent_id=agent_id.strip() or "sovereign-core",
        conversation_id=conversation_id,
        temp_paths=temp_paths,
        server_paths=[],
    )
