"""
OmniMind V11 Medical Diagnostic Intelligence — analyze-stream + WebSocket slider sync.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Literal

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import Field

from schemas.strict import StrictModel
from services.medical_diagnostic_engine import (
    analyze_stream_payload,
    apply_manual_settings,
    get_or_create_session,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/medical", tags=["medical-diagnostic-engine"])

StreamSource = Literal["camera", "upload"]
FileType = Literal["dicom", "video", "image"]

_ws_rooms: dict[str, set[WebSocket]] = {}


class ManualSettingsBody(StrictModel):
    sensitivity: float = Field(default=0.72, ge=0.0, le=1.0)
    contrast: float = Field(default=1.0, ge=0.2, le=2.5)
    vascular_isolation: float = Field(default=0.35, ge=0.0, le=1.0)


class AnalyzeStreamBody(StrictModel):
    stream_source: StreamSource
    file_type: FileType
    manual_settings: ManualSettingsBody = Field(default_factory=ManualSettingsBody)
    session_id: str = Field(default="", max_length=64)
    frame_index: int = Field(default=0, ge=0, le=100000)
    file_count: int = Field(default=1, ge=1, le=9999)


async def _broadcast(session_id: str, payload: dict[str, Any]) -> None:
    peers = _ws_rooms.get(session_id, set())
    raw = json.dumps(payload, ensure_ascii=False)
    dead: list[WebSocket] = []
    for ws in peers:
        try:
            await ws.send_text(raw)
        except Exception:
            dead.append(ws)
    for ws in dead:
        peers.discard(ws)


@router.post("/analyze-stream")
async def analyze_stream(body: AnalyzeStreamBody) -> dict[str, Any]:
    """Real-time CV pipeline — anomalies, volumetric mesh path, clinical summary."""
    sid = get_or_create_session(body.session_id or None)
    payload = await analyze_stream_payload(
        stream_source=body.stream_source,
        file_type=body.file_type,
        manual_settings=body.manual_settings.model_dump(),
        session_id=sid,
        frame_index=body.frame_index,
        file_count=body.file_count,
    )
    await _broadcast(sid, {"type": "analysis", "payload": payload})
    return payload


@router.websocket("/diagnostic-stream")
async def diagnostic_stream_ws(websocket: WebSocket) -> None:
    """Bidirectional slider + frame sync — manual tweaks re-render filters instantly."""
    await websocket.accept()
    session_id: str | None = None
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "message": "invalid_json"}))
                continue

            msg_type = msg.get("type", "")

            if msg_type == "join":
                session_id = get_or_create_session(msg.get("session_id"))
                _ws_rooms.setdefault(session_id, set()).add(websocket)
                await websocket.send_text(
                    json.dumps({"type": "joined", "session_id": session_id})
                )
                continue

            if not session_id:
                await websocket.send_text(json.dumps({"type": "error", "message": "join_required"}))
                continue

            if msg_type == "settings":
                sync = apply_manual_settings(
                    session_id,
                    msg.get("manual_settings") or {},
                )
                await _broadcast(session_id, sync)
                continue

            if msg_type == "analyze":
                payload = await analyze_stream_payload(
                    stream_source=msg.get("stream_source", "upload"),
                    file_type=msg.get("file_type", "image"),
                    manual_settings=msg.get("manual_settings"),
                    session_id=session_id,
                    frame_index=int(msg.get("frame_index", 0)),
                    file_count=int(msg.get("file_count", 1)),
                )
                await _broadcast(session_id, {"type": "analysis", "payload": payload})
                continue

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue

            await websocket.send_text(
                json.dumps({"type": "error", "message": f"unknown_type:{msg_type}"})
            )
    except WebSocketDisconnect:
        pass
    finally:
        if session_id and session_id in _ws_rooms:
            _ws_rooms[session_id].discard(websocket)
            if not _ws_rooms[session_id]:
                del _ws_rooms[session_id]
