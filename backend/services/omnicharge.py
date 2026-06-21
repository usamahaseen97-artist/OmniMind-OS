"""
OmniCharge — internal wallet + simulated wireless-charging IoT activation.

Data model (MongoDB, Motor async):
  * ``user_wallets``         — { user_id, balance, currency, last_updated }
  * ``charging_transactions``— { transaction_id, user_id, station_id, amount_paid,
                                 charging_duration_minutes, timestamp, status }

Resilience:
  * MongoDB is preferred. If it is not configured or a query fails, the module
    transparently falls back to a per-process in-memory store so the feature
    stays operational (useful for offline / BLE-NFC simulations).
  * Wallet debit is atomic: a conditional ``$gte`` update prevents double-spend
    under concurrent activations.

Offline readiness:
  * ``make_local_token`` / ``validate_local_token`` implement an HMAC token that
    a BLE/NFC peer could present to authorise activation without cloud access.
"""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import logging
import os
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

WALLETS = "user_wallets"
TRANSACTIONS = "charging_transactions"
DEFAULT_CURRENCY = "PKR"
STARTING_BALANCE = 1000.0  # simulation top-up so wallets are testable out of the box


# ---------------------------------------------------------------------------
# Station catalog (pricing source of truth)
# ---------------------------------------------------------------------------
class ChargeTier(BaseModel):
    minutes: int
    price: float


class ChargingStation(BaseModel):
    station_id: str
    name: str
    location: str
    rate_per_minute: float
    currency: str = DEFAULT_CURRENCY
    tiers: list[ChargeTier]
    connector: str = "Wireless Qi 2.0"


_STATIONS: dict[str, ChargingStation] = {
    s.station_id: s
    for s in [
        ChargingStation(
            station_id="omni-hub-01",
            name="Omni-Hub Alpha",
            location="Lobby · Bay 1",
            rate_per_minute=3.34,
            tiers=[ChargeTier(minutes=15, price=50), ChargeTier(minutes=30, price=100), ChargeTier(minutes=60, price=180)],
        ),
        ChargingStation(
            station_id="omni-hub-02",
            name="Omni-Hub Nova",
            location="Cafe · Table Pad",
            rate_per_minute=4.0,
            tiers=[ChargeTier(minutes=15, price=60), ChargeTier(minutes=30, price=110), ChargeTier(minutes=45, price=160)],
        ),
        ChargingStation(
            station_id="omni-hub-03",
            name="Omni-Hub Pulse",
            location="Workspace · Desk 7",
            rate_per_minute=3.0,
            tiers=[ChargeTier(minutes=20, price=55), ChargeTier(minutes=40, price=105), ChargeTier(minutes=60, price=150)],
        ),
    ]
}


def list_stations() -> list[ChargingStation]:
    return list(_STATIONS.values())


def get_station(station_id: str) -> Optional[ChargingStation]:
    return _STATIONS.get(station_id)


def price_for(station: ChargingStation, minutes: int) -> float:
    """Exact tier price when it matches, else metered by rate_per_minute."""
    for tier in station.tiers:
        if tier.minutes == minutes:
            return round(tier.price, 2)
    return round(minutes * station.rate_per_minute, 2)


# ---------------------------------------------------------------------------
# Offline / BLE-NFC token
# ---------------------------------------------------------------------------
def _local_secret() -> str:
    return os.getenv("OMNICHARGE_LOCAL_SECRET", "omni-charge-local-secret-v1")


def make_local_token(user_id: str, station_id: str, day: Optional[str] = None) -> str:
    day = day or date.today().isoformat()
    msg = f"{user_id}:{station_id}:{day}".encode("utf-8")
    return hmac.new(_local_secret().encode("utf-8"), msg, hashlib.sha256).hexdigest()[:40]


def validate_local_token(token: str, user_id: str, station_id: str) -> bool:
    if not token:
        return False
    today = date.today()
    for offset in (0, 1):  # tolerate clock/day skew across the BLE peer
        day = (today - timedelta(days=offset)).isoformat()
        if hmac.compare_digest(token, make_local_token(user_id, station_id, day)):
            return True
    return False


# ---------------------------------------------------------------------------
# Storage (Mongo preferred, in-memory fallback)
# ---------------------------------------------------------------------------
_mem_wallets: dict[str, dict[str, Any]] = {}
_mem_tx: list[dict[str, Any]] = []
_mem_sessions: dict[str, dict[str, Any]] = {}
_mem_lock = asyncio.Lock()


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _db():
    try:
        from services.mongo_async import get_async_database

        return await get_async_database()
    except Exception as exc:
        logger.debug("OmniCharge Mongo unavailable: %s", exc)
        return None


class InsufficientBalanceError(Exception):
    def __init__(self, balance: float, price: float) -> None:
        self.balance = balance
        self.price = price
        super().__init__("Insufficient wallet balance")


def _wallet_public(doc: dict[str, Any]) -> dict[str, Any]:
    last = doc.get("last_updated")
    return {
        "user_id": doc["user_id"],
        "balance": round(float(doc.get("balance", 0.0)), 2),
        "currency": doc.get("currency", DEFAULT_CURRENCY),
        "last_updated": last.isoformat() if isinstance(last, datetime) else last,
    }


async def get_wallet(user_id: str) -> dict[str, Any]:
    """Fetch (or lazily create) a wallet. Mongo first, else in-memory."""
    db = await _db()
    if db is not None:
        try:
            doc = await db[WALLETS].find_one({"user_id": user_id})
            if doc is None:
                doc = {
                    "user_id": user_id,
                    "balance": STARTING_BALANCE,
                    "currency": DEFAULT_CURRENCY,
                    "last_updated": _now(),
                }
                await db[WALLETS].insert_one(dict(doc))
            return _wallet_public(doc)
        except Exception as exc:
            logger.warning("OmniCharge wallet read fell back to memory: %s", exc)

    async with _mem_lock:
        doc = _mem_wallets.get(user_id)
        if doc is None:
            doc = {
                "user_id": user_id,
                "balance": STARTING_BALANCE,
                "currency": DEFAULT_CURRENCY,
                "last_updated": _now(),
            }
            _mem_wallets[user_id] = doc
        return _wallet_public(doc)


async def top_up(user_id: str, amount: float) -> dict[str, Any]:
    if amount <= 0:
        raise ValueError("Top-up amount must be positive")
    await get_wallet(user_id)  # ensure exists
    db = await _db()
    if db is not None:
        try:
            from pymongo import ReturnDocument

            doc = await db[WALLETS].find_one_and_update(
                {"user_id": user_id},
                {"$inc": {"balance": amount}, "$set": {"last_updated": _now()}},
                return_document=ReturnDocument.AFTER,
            )
            if doc:
                return _wallet_public(doc)
        except Exception as exc:
            logger.warning("OmniCharge top-up fell back to memory: %s", exc)

    async with _mem_lock:
        doc = _mem_wallets.setdefault(
            user_id,
            {"user_id": user_id, "balance": STARTING_BALANCE, "currency": DEFAULT_CURRENCY, "last_updated": _now()},
        )
        doc["balance"] = round(float(doc["balance"]) + amount, 2)
        doc["last_updated"] = _now()
        return _wallet_public(doc)


async def _atomic_debit(user_id: str, price: float) -> Optional[dict[str, Any]]:
    """Atomically debit if balance >= price. Returns updated wallet or None."""
    db = await _db()
    if db is not None:
        try:
            from pymongo import ReturnDocument

            doc = await db[WALLETS].find_one_and_update(
                {"user_id": user_id, "balance": {"$gte": price}},
                {"$inc": {"balance": -price}, "$set": {"last_updated": _now()}},
                return_document=ReturnDocument.AFTER,
            )
            return _wallet_public(doc) if doc else None
        except Exception as exc:
            logger.warning("OmniCharge debit fell back to memory: %s", exc)

    async with _mem_lock:
        doc = _mem_wallets.get(user_id)
        if not doc or float(doc["balance"]) < price:
            return None
        doc["balance"] = round(float(doc["balance"]) - price, 2)
        doc["last_updated"] = _now()
        return _wallet_public(doc)


async def _log_transaction(tx: dict[str, Any]) -> None:
    db = await _db()
    if db is not None:
        try:
            await db[TRANSACTIONS].insert_one(dict(tx))
            return
        except Exception as exc:
            logger.warning("OmniCharge tx log fell back to memory: %s", exc)
    async with _mem_lock:
        _mem_tx.append(dict(tx))


def _tx_public(tx: dict[str, Any]) -> dict[str, Any]:
    ts = tx.get("timestamp")
    return {
        "transaction_id": tx["transaction_id"],
        "user_id": tx["user_id"],
        "station_id": tx["station_id"],
        "amount_paid": round(float(tx["amount_paid"]), 2),
        "charging_duration_minutes": tx["charging_duration_minutes"],
        "timestamp": ts.isoformat() if isinstance(ts, datetime) else ts,
        "status": tx.get("status", "completed"),
    }


def _session_public(session: dict[str, Any]) -> dict[str, Any]:
    started = session.get("started_at")
    duration_sec = int(session.get("duration_seconds") or 0)
    status = session.get("status", "pending")
    percent = 0.0
    remaining = duration_sec
    watts = 0.0

    if status == "charging" and isinstance(started, datetime) and duration_sec > 0:
        elapsed = (_now() - started).total_seconds()
        remaining = max(0, int(duration_sec - elapsed))
        percent = min(100.0, round((elapsed / duration_sec) * 100, 1))
        watts = round(5.0 + percent * 0.14, 1)
        if remaining <= 0:
            status = "completed"
            percent = 100.0
            watts = 0.0
    elif status == "completed":
        percent = 100.0
        remaining = 0

    return {
        "session_id": session["session_id"],
        "user_id": session["user_id"],
        "station_id": session["station_id"],
        "status": status,
        "percent": percent,
        "remaining_seconds": remaining,
        "duration_seconds": duration_sec,
        "watts": watts,
        "hardware_status": session.get("hardware_status", "STANDBY"),
        "started_at": started.isoformat() if isinstance(started, datetime) else None,
        "ends_at": session.get("ends_at"),
    }


async def start_charging_session(session_id: str) -> dict[str, Any]:
    """Begin simulated power delivery (0% → 100% on UI)."""
    async with _mem_lock:
        session = _mem_sessions.get(session_id)
    if session is None:
        raise LookupError("Unknown charging session")
    if session.get("status") == "charging":
        return _session_public(session)

    started = _now()
    duration_sec = int(session.get("duration_seconds") or 60)
    session["status"] = "charging"
    session["started_at"] = started
    session["hardware_status"] = "HARDWARE_POWER_ON"
    session["ends_at"] = (started + timedelta(seconds=duration_sec)).isoformat()

    async with _mem_lock:
        _mem_sessions[session_id] = session
    return _session_public(session)


async def get_charging_session_status(session_id: str) -> dict[str, Any]:
    async with _mem_lock:
        session = _mem_sessions.get(session_id)
    if session is None:
        raise LookupError("Unknown charging session")
    pub = _session_public(session)
    if pub["status"] == "completed":
        async with _mem_lock:
            if session_id in _mem_sessions:
                _mem_sessions[session_id]["status"] = "completed"
                _mem_sessions[session_id]["hardware_status"] = "CHARGE_COMPLETE"
    return pub


async def pay_and_activate(
    user_id: str,
    station_id: str,
    requested_minutes: int,
    *,
    offline: bool = False,
) -> dict[str, Any]:
    """Debit wallet, log transaction, and 'power on' the simulated hardware."""
    station = get_station(station_id)
    if station is None:
        raise LookupError("Unknown charging station")
    if requested_minutes <= 0 or requested_minutes > 240:
        raise ValueError("requested_minutes must be between 1 and 240")

    price = price_for(station, requested_minutes)

    # Validate funds + atomically debit (skip wallet creation race by ensuring first).
    await get_wallet(user_id)
    wallet = await _atomic_debit(user_id, price)
    if wallet is None:
        current = await get_wallet(user_id)
        raise InsufficientBalanceError(balance=current["balance"], price=price)

    started = _now()
    tx = {
        "transaction_id": f"tx_{uuid.uuid4().hex[:16]}",
        "user_id": user_id,
        "station_id": station_id,
        "amount_paid": price,
        "charging_duration_minutes": requested_minutes,
        "timestamp": started,
        "status": "completed",
    }
    await _log_transaction(tx)

    duration_sec = requested_minutes * 60
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "station_id": station_id,
        "status": "pending",
        "hardware_status": "READY",
        "duration_seconds": duration_sec,
        "started_at": None,
        "ends_at": None,
        "transaction_id": tx["transaction_id"],
    }
    async with _mem_lock:
        _mem_sessions[session_id] = session

    return {
        "success": True,
        "hardware_status": "READY",
        "mode": "offline" if offline else "online",
        "station": station.model_dump(),
        "transaction": _tx_public(tx),
        "wallet": wallet,
        "session_id": session_id,
        "charging_session": {
            "session_id": session_id,
            "started_at": None,
            "ends_at": None,
            "duration_minutes": requested_minutes,
            "remaining_seconds": duration_sec,
            "percent": 0,
            "status": "pending",
        },
    }


async def list_transactions(user_id: str, limit: int = 20) -> list[dict[str, Any]]:
    db = await _db()
    if db is not None:
        try:
            cursor = db[TRANSACTIONS].find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
            docs = await cursor.to_list(length=limit)
            if docs:
                return [_tx_public(d) for d in docs]
        except Exception as exc:
            logger.warning("OmniCharge tx history fell back to memory: %s", exc)
    async with _mem_lock:
        rows = [t for t in _mem_tx if t["user_id"] == user_id]
    rows.sort(key=lambda t: t["timestamp"], reverse=True)
    return [_tx_public(t) for t in rows[:limit]]
