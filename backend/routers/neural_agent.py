"""OmniMind V11 — multimodal neural agent (documents, images, business prompts)."""

from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import Any, Optional

import jwt
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from auth.security import decode_token
from services.cloud_neural_agent import process_neural_query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/neural-agent", tags=["Neural Engine"])

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_UPLOAD_ROOT = _BACKEND_ROOT / "data" / "neural_agent" / "uploads"
_MAX_UPLOAD_BYTES = 16 * 1024 * 1024


def _validate_session_jwt(session_jwt: str) -> dict[str, Any]:
    token = (session_jwt or "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid Authentication Token Configuration")
    try:
        return decode_token(token, expected_type="access")
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.") from exc


async def _persist_context_file(upload: UploadFile) -> tuple[dict[str, str], bytes]:
    raw_name = upload.filename or "attachment.bin"
    suffix = Path(raw_name).suffix.lower()[:16]
    safe_name = f"{uuid.uuid4().hex}{suffix}"
    _UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    dest = _UPLOAD_ROOT / safe_name

    data = await upload.read()
    if len(data) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Context file exceeds 16MB limit.")
    if not data:
        raise HTTPException(status_code=400, detail="Empty context file upload.")

    dest.write_bytes(data)
    meta = {
        "name": raw_name,
        "content_type": upload.content_type or "application/octet-stream",
        "local_path": str(dest.relative_to(_BACKEND_ROOT)).replace("\\", "/"),
        "size_bytes": str(len(data)),
    }
    return meta, data


@router.post("/query")
async def execute_multimodal_neural_query(
    user_prompt: str = Form(...),
    session_jwt: str = Form(...),
    context_file: Optional[UploadFile] = File(None),
):
    """
    Cloud-first multimodal agent: text chat, file reading, image generation routing.
    Uses Gemini / OpenAI DALL-E / Stability / Pollinations — not local GPU stacks.
    """
    claims = _validate_session_jwt(session_jwt)
    prompt = user_prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="user_prompt is required.")

    file_metadata: dict[str, Any] = {}
    file_bytes: Optional[bytes] = None
    if context_file and context_file.filename:
        file_metadata, file_bytes = await _persist_context_file(context_file)

    result = await process_neural_query(
        prompt=prompt,
        subject=str(claims.get("sub") or "guest"),
        file_bytes=file_bytes,
        file_meta=file_metadata,
    )

    ai_response_payload = {
        "success": result.get("success", True),
        "status": "Success",
        "subject": claims.get("sub"),
        "mode": result.get("mode"),
        "engine": result.get("engine"),
        "provider": result.get("provider"),
        "resolution_guideline": result.get("resolution_guideline") or result.get("response_text", "")[:500],
        "response_text": result.get("response_text"),
        "image_url": result.get("image_url"),
        "images": result.get("images"),
        "preview": result.get("preview"),
        "file_attached_status": result.get("file_attached_status", "None"),
        "file_metadata": result.get("file_metadata") or file_metadata or None,
        "generated_artifacts": result.get("generated_artifacts")
        or {"execution_status": "Verified", "download_node_link": None},
    }

    logger.info(
        "Neural agent query subject=%s mode=%s file=%s",
        claims.get("sub"),
        result.get("mode"),
        file_metadata.get("name") if file_metadata else None,
    )
    return ai_response_payload
