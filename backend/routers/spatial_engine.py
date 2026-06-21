"""
OmniMind V11 Spatial Engine — external architecture + interior design pipelines.
WebSocket canvas sync · render mode switching · blueprint vault (no file trees).
"""

from __future__ import annotations

import json
import logging
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import Field, field_validator

from schemas.strict import StrictModel
from schemas.validators import validate_non_blank_str
from services.spatial_runtime_engine import (
    build_directive_payload,
    export_render_package,
    get_or_create_session,
    recalculate_layout,
    save_blueprint_vault,
    toggle_render_payload,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/spatial", tags=["spatial-engine"])

SpatialModule = Literal["external", "interior"]
RenderMode = Literal["matrix", "cinematic"]

# session_id -> connected websockets
_ws_rooms: dict[str, set[WebSocket]] = {}


class ExecuteDirectiveBody(StrictModel):
    module: SpatialModule
    prompt: str = Field(..., min_length=1, max_length=16000)
    render_mode: RenderMode = "matrix"
    session_id: str = Field(default="", max_length=64)

    @field_validator("prompt")
    @classmethod
    def prompt_ok(cls, v: str) -> str:
        return validate_non_blank_str(v)


class ToggleRenderModeBody(StrictModel):
    module: SpatialModule
    render_mode: RenderMode
    session_id: str = Field(default="", max_length=64)
    prompt: str = Field(default="", max_length=16000)


class SaveBlueprintBody(StrictModel):
    module: SpatialModule
    session_id: str = Field(default="", max_length=64)
    label: str = Field(default="", max_length=200)
    blueprint: dict[str, Any] | None = None


class ExportRenderBody(StrictModel):
    module: SpatialModule
    session_id: str = Field(default="", max_length=64)
    render_mode: RenderMode = "cinematic"
    prompt: str = Field(default="", max_length=16000)


class CanvasDragBody(StrictModel):
    session_id: str = Field(..., min_length=8, max_length=64)
    asset_id: str = Field(..., min_length=1, max_length=128)
    x: float = Field(..., ge=-500, le=500)
    y: float = Field(default=0.4, ge=-100, le=100)
    z: float = Field(..., ge=-500, le=500)


async def broadcast_spatial_session(session_id: str, payload: dict[str, Any]) -> None:
    """Public broadcast hook for spatial_hybrid and other routers."""
    await _broadcast(session_id, payload)


async def _broadcast(session_id: str, payload: dict[str, Any]) -> None:
    peers = _ws_rooms.get(session_id, set())
    dead: list[WebSocket] = []
    raw = json.dumps(payload, ensure_ascii=False)
    for ws in peers:
        try:
            await ws.send_text(raw)
        except Exception:
            dead.append(ws)
    for ws in dead:
        peers.discard(ws)


@router.post("/execute-directive")
async def execute_directive(body: ExecuteDirectiveBody) -> dict[str, Any]:
    """
    Parse prompt tokens → structured spatial payload (coordinates, textures, illumination).
  """
    sid = get_or_create_session(body.module, body.session_id or None)
    payload = await build_directive_payload(
        module=body.module,
        prompt=body.prompt,
        render_mode=body.render_mode,
        session_id=sid,
    )
    await _broadcast(sid, {"type": "directive", "payload": payload})
    return {"ok": True, **payload}


@router.post("/toggle-render-mode")
async def toggle_render_mode(body: ToggleRenderModeBody) -> dict[str, Any]:
    """Instant matrix ↔ cinematic transition with mode-specific geometry payloads."""
    sid = get_or_create_session(body.module, body.session_id or None)
    payload = await toggle_render_payload(
        module=body.module,
        render_mode=body.render_mode,
        session_id=sid,
        prompt=body.prompt,
    )
    await _broadcast(sid, {"type": "render_mode", "payload": payload})
    return {"ok": True, **payload}


@router.post("/save-blueprint")
async def save_blueprint(body: SaveBlueprintBody) -> dict[str, Any]:
    """Persist structural parameters to local asset vault — no file tree exposure."""
    sid = body.session_id or None
    return await save_blueprint_vault(
        module=body.module,
        session_id=sid,
        label=body.label,
        blueprint=body.blueprint,
    )


@router.post("/export-render")
async def export_render(body: ExportRenderBody) -> dict[str, Any]:
    """Package active high-fidelity view into downloadable layout archive."""
    return await export_render_package(
        module=body.module,
        session_id=body.session_id or None,
        render_mode=body.render_mode,
        prompt=body.prompt,
    )


@router.post("/sync-drag")
async def sync_drag_http(body: CanvasDragBody) -> dict[str, Any]:
    """HTTP fallback for canvas drag coordination (WebSocket preferred)."""
    try:
        sync = recalculate_layout(
            session_id=body.session_id,
            asset_id=body.asset_id,
            x=body.x,
            y=body.y,
            z=body.z,
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    await _broadcast(body.session_id, {"type": "sync", "payload": sync})
    return {"ok": True, **sync}


@router.websocket("/sync-canvas")
async def sync_canvas_ws(websocket: WebSocket) -> None:
    """
    Persistent two-way canvas sync — drag events recalculate structure tree + config text.
    """
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
                module = msg.get("module", "external")
                if module not in ("external", "interior"):
                    module = "external"
                session_id = get_or_create_session(module, msg.get("session_id"))
                _ws_rooms.setdefault(session_id, set()).add(websocket)
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "joined",
                            "session_id": session_id,
                            "module": module,
                        }
                    )
                )
                continue

            if not session_id:
                await websocket.send_text(
                    json.dumps({"type": "error", "message": "join_required"})
                )
                continue

            if msg_type == "drag":
                try:
                    sync = recalculate_layout(
                        session_id=session_id,
                        asset_id=str(msg.get("asset_id", "")),
                        x=float(msg.get("x", 0)),
                        y=float(msg.get("y", 0.4)),
                        z=float(msg.get("z", 0)),
                    )
                except (KeyError, ValueError) as exc:
                    await websocket.send_text(
                        json.dumps({"type": "error", "message": str(exc)})
                    )
                    continue
                await _broadcast(session_id, {"type": "sync", "payload": sync})
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
