"""
Live preview synchronization gateway for App / Business / Game dev canvases.
"""

from __future__ import annotations

import json
from collections import defaultdict
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/ws", tags=["stream-preview"])

_rooms: dict[str, set[WebSocket]] = defaultdict(set)


async def _broadcast(room_id: str, payload: dict[str, Any]) -> None:
    peers = _rooms.get(room_id, set())
    if not peers:
        return
    raw = json.dumps(payload, ensure_ascii=False)
    dead: list[WebSocket] = []
    for ws in peers:
        try:
            await ws.send_text(raw)
        except Exception:
            dead.append(ws)
    for ws in dead:
        peers.discard(ws)


@router.websocket("/stream-preview")
async def stream_preview_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    room_id: str | None = None
    try:
        await websocket.send_text(json.dumps({"type": "status", "status": "connected"}))
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "message": "invalid_json"}))
                continue

            t = msg.get("type")
            if t == "join":
                room_id = str(msg.get("room_id") or "default")
                _rooms[room_id].add(websocket)
                await websocket.send_text(json.dumps({"type": "joined", "room_id": room_id}))
                continue
            if t == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue
            if t in {"preview_patch", "preview_state"}:
                if not room_id:
                    await websocket.send_text(json.dumps({"type": "error", "message": "join_required"}))
                    continue
                await _broadcast(room_id, {"type": t, "payload": msg.get("payload")})
                continue
            await websocket.send_text(json.dumps({"type": "error", "message": f"unknown_type:{t}"}))
    except WebSocketDisconnect:
        pass
    finally:
        if room_id and room_id in _rooms:
            _rooms[room_id].discard(websocket)
            if not _rooms[room_id]:
                del _rooms[room_id]

