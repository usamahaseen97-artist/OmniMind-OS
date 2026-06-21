"""
OmniCharge API — wallet, stations, and pay-and-activate (simulated IoT power-on).

Routes (prefix /api/v1/omnicharge):
  GET  /stations                 -> charging-station catalog + pricing tiers
  GET  /wallet/{user_id}         -> wallet balance (auto-created)
  POST /wallet/topup             -> simulated top-up
  GET  /local-token              -> issue a BLE/NFC offline token (simulation aid)
  POST /pay-and-activate         -> debit wallet, log tx, power on hardware
  GET  /transactions/{user_id}   -> recent charging transactions
"""

from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Header, HTTPException, Query
from pydantic import BaseModel, Field

from services import omnicharge
from services.entertainment_pipeline import schedule_entertainment_event

router = APIRouter(prefix="/api/v1/omnicharge", tags=["omnicharge"])


class TopUpBody(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    amount: float = Field(..., gt=0, le=1_000_000)


class PayActivateBody(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128)
    station_id: str = Field(..., min_length=1, max_length=64)
    requested_minutes: int = Field(..., ge=1, le=240)


@router.get("/stations")
async def stations():
    return {
        "stations": [s.model_dump() for s in omnicharge.list_stations()],
        "count": len(omnicharge.list_stations()),
    }


@router.get("/wallet/{user_id}")
async def wallet(user_id: str):
    return await omnicharge.get_wallet(user_id)


@router.post("/wallet/topup")
async def wallet_topup(body: TopUpBody):
    try:
        result = await omnicharge.top_up(body.user_id, body.amount)
        schedule_entertainment_event(
            "omnicharge",
            "wallet_topup",
            user_id=body.user_id,
            payload={"amount": body.amount},
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/local-token")
async def local_token(
    user_id: Annotated[str, Query(min_length=1, max_length=128)],
    station_id: Annotated[str, Query(min_length=1, max_length=64)],
):
    """Issue an HMAC token a BLE/NFC peer can present for offline activation."""
    if omnicharge.get_station(station_id) is None:
        raise HTTPException(status_code=404, detail="Unknown charging station")
    return {
        "user_id": user_id,
        "station_id": station_id,
        "local_token": omnicharge.make_local_token(user_id, station_id),
        "header": "X-Omni-Local-Token",
        "note": "Pass this header to /pay-and-activate to authorise without cloud access.",
    }


@router.post("/pay-and-activate")
async def pay_and_activate(
    body: PayActivateBody,
    x_omni_local_token: Annotated[Optional[str], Header()] = None,
):
    offline = False
    if x_omni_local_token:
        if not omnicharge.validate_local_token(
            x_omni_local_token, body.user_id, body.station_id
        ):
            raise HTTPException(status_code=401, detail="Invalid offline (BLE/NFC) token")
        offline = True

    try:
        result = await omnicharge.pay_and_activate(
            body.user_id,
            body.station_id,
            body.requested_minutes,
            offline=offline,
        )
        schedule_entertainment_event(
            "omnicharge",
            "pay_and_activate",
            user_id=body.user_id,
            payload={
                "station_id": body.station_id,
                "minutes": body.requested_minutes,
                "offline": offline,
            },
        )
        return result
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except omnicharge.InsufficientBalanceError as exc:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "insufficient_balance",
                "balance": exc.balance,
                "price": exc.price,
                "message": "Wallet balance is lower than the charging price. Please top up.",
            },
        ) from exc


@router.get("/transactions/{user_id}")
async def transactions(user_id: str, limit: Annotated[int, Query(ge=1, le=100)] = 20):
    return {"transactions": await omnicharge.list_transactions(user_id, limit)}


@router.post("/session/{session_id}/start")
async def session_start(session_id: str):
    """Start simulated charging — UI percent rises 0% → 100% from backend clock."""
    try:
        status = await omnicharge.start_charging_session(session_id)
        schedule_entertainment_event(
            "omnicharge",
            "session_start",
            user_id=status.get("user_id", ""),
            payload={"session_id": session_id, "percent": status.get("percent")},
        )
        return status
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/session/{session_id}/status")
async def session_status(session_id: str):
    """Real-time charging percent + remaining seconds (poll ~1s)."""
    try:
        return await omnicharge.get_charging_session_status(session_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
