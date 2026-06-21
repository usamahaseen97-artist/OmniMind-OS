"""System tool registry sync + user theme profile persistence."""

from __future__ import annotations

import logging
import secrets
from datetime import datetime, timezone
from typing import Any, Optional

from schemas.sovereign_tools import AUTHORIZED_TOOL_IDS, SovereignToolId, TOOL_MODULE_MAP
from services.mongo_pools import get_module_collection

logger = logging.getLogger(__name__)

_THEME_PRESETS = frozenset({"deep-purple", "gold-accent", "auto", "custom"})


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def sync_authorized_tool_registry() -> dict[str, Any]:
    """
    Purge duplicate / unauthorized tool strings and upsert exactly 11 enum entries.
    """
    col = await get_module_collection("system")
    purged = 0
    upserted = 0

    if col is not None:
        result = await col.delete_many({"tool_id": {"$nin": list(AUTHORIZED_TOOL_IDS)}})
        purged = result.deleted_count

        for tool_id in SovereignToolId:
            doc = {
                "tool_id": tool_id.value,
                "module": TOOL_MODULE_MAP.get(tool_id.value, "generic"),
                "authorized": True,
                "singleton": True,
                "updated_at": _now(),
            }
            await col.update_one({"tool_id": tool_id.value}, {"$set": doc}, upsert=True)
            upserted += 1

        logger.info("Tool registry synced: purged=%s upserted=%s", purged, upserted)
    else:
        logger.warning("Mongo unavailable — tool registry sync skipped (in-memory only)")

    return {
        "ok": True,
        "authorized_count": len(AUTHORIZED_TOOL_IDS),
        "purged_duplicates": purged,
        "upserted": upserted,
        "tools": sorted(AUTHORIZED_TOOL_IDS),
        "persisted": col is not None,
    }


async def save_user_theme(
    *,
    user_id: str,
    preset_id: str,
    custom_color: Optional[str] = None,
    auto_seed: Optional[str] = None,
) -> dict[str, Any]:
    if preset_id not in _THEME_PRESETS:
        raise ValueError(f"Invalid preset_id: {preset_id}")

    seed = auto_seed or (secrets.token_hex(8) if preset_id == "auto" else None)
    doc = {
        "user_id": user_id,
        "preset_id": preset_id,
        "custom_color": custom_color,
        "auto_seed": seed,
        "applied_globally": True,
        "updated_at": _now(),
    }

    col = await get_module_collection("profiles")
    if col is not None:
        await col.update_one({"user_id": user_id}, {"$set": doc}, upsert=True)
        doc["persisted"] = True
    else:
        doc["persisted"] = False
        doc["mode"] = "in_memory_fallback"

    logger.info("Theme saved user=%s preset=%s seed=%s", user_id, preset_id, seed)
    return {"ok": True, "theme": doc}


async def get_user_theme(user_id: str) -> dict[str, Any]:
    col = await get_module_collection("profiles")
    if col is None:
        return {"ok": True, "theme": {"preset_id": "deep-purple", "persisted": False}}
    doc = await col.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        return {"ok": True, "theme": {"preset_id": "deep-purple", "user_id": user_id}}
    return {"ok": True, "theme": doc}
