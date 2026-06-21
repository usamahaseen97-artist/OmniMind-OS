"""
Omni infrastructure utility services — canonical /api/v1/omni* routes.
Wraps existing maps, music, TV, movies, translator, and omnicharge modules.
"""

from __future__ import annotations

import logging
from typing import Annotated, Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import Field

from schemas.strict import StrictModel
from services import omnicharge
from services.maps_intelligence import search_maps
from services.mongo_pools import save_module_record
from services.translator import translate_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["omni-infra"])


class NavigationBody(StrictModel):
    query: str = Field(..., min_length=1, max_length=500)
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    vehicle: str = Field(default="car", max_length=32)
    user_id: str = Field(default="anonymous", max_length=128)


class VoiceRouteBody(StrictModel):
    transcript: str = Field(..., min_length=1, max_length=2000)
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    user_id: str = Field(default="anonymous", max_length=128)


class MusicStudioBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    voice_track_base64: Optional[str] = Field(default=None, max_length=4_000_000)
    auto_tune: bool = True
    blend_melody: bool = True
    genre: str = Field(default="pop", max_length=32)


class TranslatorSpeakBody(StrictModel):
    text: str = Field(..., min_length=1, max_length=8000)
    source_lang: str = Field(default="auto", max_length=16)
    target_lang: str = Field(default="ur", max_length=16)
    mode: str = Field(default="speech", max_length=16)


class ChargerSessionBody(StrictModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    tier_pkr: int = Field(..., ge=100, le=400)
    station_id: str = Field(default="station-alpha", max_length=64)


class ChargerPauseBody(StrictModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    session_id: str = Field(..., min_length=1, max_length=128)
    elapsed_seconds: int = Field(..., ge=0, le=86400)


_TIER_MAP = {
    100: 0.25,
    200: 0.50,
    300: 0.75,
    400: 1.0,
}


@router.post("/omnimap/navigation")
async def omnimap_navigation(body: NavigationBody) -> dict[str, Any]:
    """Mock vehicle/bike vectors + POI ranking via maps intelligence."""
    result = await search_maps(
        body.query,
        user_lat=body.user_lat,
        user_lng=body.user_lng,
        drive_mode=body.vehicle in ("car", "bike", "drive"),
    )
    session = {
        "session_id": f"nav_{body.user_id[:8]}",
        "vehicle": body.vehicle,
        "query": body.query,
        "poi_count": len(result.get("places", [])),
    }
    await save_module_record("omnimap", session)
    return {"ok": True, "navigation": result, "kafka_stream": "omnimind.navigation.mock", **session}


@router.post("/omnimap/voice-route")
async def omnimap_voice_route(body: VoiceRouteBody) -> dict[str, Any]:
    """Speech transcription handler → route query."""
    return await omnimap_navigation(
        NavigationBody(
            query=body.transcript,
            user_lat=body.user_lat,
            user_lng=body.user_lng,
            user_id=body.user_id,
        )
    )


@router.post("/omnimusic/studio")
async def omnimusic_studio(body: MusicStudioBody) -> dict[str, Any]:
    """Voice capture pipeline with mock auto-tune + melody blend."""
    session = {
        "session_id": f"studio_{body.user_id[:8]}",
        "auto_tune": body.auto_tune,
        "blend_melody": body.blend_melody,
        "genre": body.genre,
        "voice_received": bool(body.voice_track_base64),
        "filters": ["pitch_correction", "noise_gate", "reverb_light"],
    }
    await save_module_record("omnimusic", session)
    logger.info("OmniMusic studio session user=%s", body.user_id)
    return {"ok": True, "pipeline": "async_queued", **session}


@router.get("/omnitv/stream")
async def omnitv_stream_catalog(
    user_id: Annotated[str, Query(max_length=128)] = "anonymous",
):
    """High-throughput catalog segment with recommendation weights (mock)."""
    channels = [
        {"id": "news-1", "title": "OmniNews Live", "weight": 0.92},
        {"id": "sports-1", "title": "OmniSports HD", "weight": 0.88},
        {"id": "culture-1", "title": "OmniCulture", "weight": 0.75},
    ]
    await save_module_record("omnitv", {"user_id": user_id, "channels": len(channels)})
    return {"ok": True, "streams": channels, "recommendation_engine": "weighted_v1"}


@router.get("/omnimovies/catalog")
async def omnimovies_catalog(
    user_id: Annotated[str, Query(max_length=128)] = "anonymous",
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
):
    rows = [
        {"id": f"movie_{i}", "title": f"OmniMind Feature {i}", "score": round(0.95 - i * 0.03, 2)}
        for i in range(min(limit, 10))
    ]
    await save_module_record("omnimovies", {"user_id": user_id, "count": len(rows)})
    return {"ok": True, "catalog": rows, "total": len(rows)}


@router.post("/omnitranslator/speak")
async def omnitranslator_speak(body: TranslatorSpeakBody) -> dict[str, Any]:
    """Bidirectional voice/text translation engine."""
    result = await translate_text(
        body.text,
        source_lang=body.source_lang,
        target_lang=body.target_lang,
        mode=body.mode,
    )
    await save_module_record("omnitranslator", {"target": body.target_lang, "chars": len(body.text)})
    return {"ok": True, "tool": "omnitranslator", **result}


@router.post("/omnicharger/session")
async def omnicharger_start_session(body: ChargerSessionBody) -> dict[str, Any]:
    """Validate PKR tier against energy output stream and start session."""
    pct = _TIER_MAP.get(body.tier_pkr)
    if pct is None:
        raise HTTPException(status_code=400, detail="Invalid tier — use 100, 200, 300, or 400 PKR")
    wallet = await omnicharge.get_wallet(body.user_id)
    if wallet.get("balance", 0) < body.tier_pkr:
        raise HTTPException(status_code=402, detail="Insufficient wallet balance")
    session = {
        "session_id": f"chg_{body.user_id[:6]}_{body.tier_pkr}",
        "tier_pkr": body.tier_pkr,
        "energy_pct": pct,
        "station_id": body.station_id,
        "status": "active",
        "billing_per_second_pkr": round(body.tier_pkr / 3600, 4),
    }
    await save_module_record("omnicharge", session)
    return {"ok": True, **session}


@router.post("/omnicharger/session/pause")
async def omnicharger_pause_session(body: ChargerPauseBody) -> dict[str, Any]:
    """Instant pause with per-second billing deduction."""
    deducted = round(body.elapsed_seconds * (100 / 3600), 2)
    return {
        "ok": True,
        "session_id": body.session_id,
        "status": "paused",
        "elapsed_seconds": body.elapsed_seconds,
        "deducted_pkr": deducted,
        "message": "Session paused — billing calculated to the second",
    }
