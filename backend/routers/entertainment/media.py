"""OmniStream — placeholder media search API."""

from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/media", tags=["omni-stream"])


@router.get("/health")
async def media_health():
    return {"service": "omni-stream", "status": "ready", "version": "V11-placeholder"}


@router.get("/search")
async def search_media(
    q: Annotated[str, Query(min_length=1, max_length=500)],
    media_type: Annotated[Optional[str], Query(max_length=32)] = "all",
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
):
    """Placeholder — wire to News API / YouTube / internal catalog later."""
    return {
        "success": True,
        "query": q.strip(),
        "media_type": media_type or "all",
        "limit": limit,
        "results": [],
        "message": "OmniStream search placeholder — no external catalog connected yet.",
    }
