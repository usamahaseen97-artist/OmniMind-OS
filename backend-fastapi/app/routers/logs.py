from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/logs", tags=["logs"])


@router.get("/server")
async def server_logs() -> dict:
    return {
        "items": [
            {
                "ts": datetime.now(timezone.utc).isoformat(),
                "level": "INFO",
                "message": "backend-fastapi healthy",
            }
        ]
    }
