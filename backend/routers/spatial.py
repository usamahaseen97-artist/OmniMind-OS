"""AR spatial overlay — strict query validation."""

from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Query
from pydantic import Field, field_validator

from schemas.strict import StrictModel
from services.spatial_overlay import fetch_overlay_data

router = APIRouter(prefix="/api/v1/spatial", tags=["spatial"])


class SpatialOverlayQuery(StrictModel):
    symbols: Optional[str] = Field(default=None, max_length=512)
    history_days: int = Field(default=14, ge=5, le=90)

    @field_validator("symbols")
    @classmethod
    def symbols_ok(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        s = v.strip()
        if not s:
            return None
        if any(c for c in s if c not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.-_"):
            raise ValueError("symbols contain invalid characters")
        return s


@router.get("/overlay-data")
async def spatial_overlay_data(
    symbols: Annotated[Optional[str], Query(max_length=512)] = None,
    history_days: Annotated[int, Query(ge=5, le=90)] = 14,
):
    q = SpatialOverlayQuery(symbols=symbols, history_days=history_days)
    sym_list = [s.strip() for s in q.symbols.split(",")] if q.symbols else None
    return await fetch_overlay_data(symbols=sym_list, history_days=q.history_days)
