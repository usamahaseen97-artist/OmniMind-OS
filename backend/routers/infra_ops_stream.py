"""
Infrastructure operations stream — live mesh telemetry for the terminal dashboard.
"""

from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.infra_ops_log import emit_ops_log, subscribe_ops_logs, unsubscribe_ops_logs

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/infra", tags=["Infrastructure"])


@router.websocket("/ops-ws")
async def infra_ops_websocket(websocket: WebSocket) -> None:
    """Push 100% active operational logs to the dark purple terminal dashboard."""
    await websocket.accept()
    queue = await subscribe_ops_logs()
    emit_ops_log("◈ Terminal dashboard subscribed — infra ops stream live", "route", "terminal")

    pump: asyncio.Task | None = None

    async def _forward() -> None:
        while True:
            entry = await queue.get()
            await websocket.send_json(entry)

    try:
        pump = asyncio.create_task(_forward())
        while True:
            data = await websocket.receive_json()
            if str(data.get("command", "")).strip().lower() in ("ping", "status"):
                await websocket.send_json({"type": "status", "status": "streaming"})
    except WebSocketDisconnect:
        logger.info("Infra ops terminal client disconnected")
    finally:
        if pump is not None:
            pump.cancel()
        unsubscribe_ops_logs(queue)
