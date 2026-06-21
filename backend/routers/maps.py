"""OmniMap search API."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.maps_intelligence import search_maps

router = APIRouter(prefix="/maps", tags=["maps"])


class MapSearchBody(StrictModel):
    query: str = Field(..., min_length=1, max_length=500)
    user_lat: float | None = None
    user_lng: float | None = None
    drive_mode: bool = False


@router.post("/search")
async def map_search(body: MapSearchBody):
    return await search_maps(
        body.query,
        user_lat=body.user_lat,
        user_lng=body.user_lng,
        drive_mode=body.drive_mode,
    )
