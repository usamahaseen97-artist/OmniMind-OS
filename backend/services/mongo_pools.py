"""
Isolated Motor collection pools per OmniMind module.
Each tool gets a dedicated namespace under the shared Atlas database.
"""

from __future__ import annotations

import hashlib
import logging
import re
from datetime import datetime, timezone
from typing import Any, Optional

from services.mongo_async import get_async_database

logger = logging.getLogger(__name__)

MODULE_COLLECTIONS: dict[str, str] = {
    "builder": "builder_workspaces",
    "architect": "architect_blueprints",
    "business": "business_suites",
    "medical": "medical_analyses",
    "trading": "trading_sessions",
    "media": "media_pipelines",
    "analytics": "analytics_jobs",
    "vfx": "vfx_timelines",
    "science": "science_computations",
    "marketing": "marketing_campaigns",
    "system": "system_tool_registry",
    "profiles": "user_theme_profiles",
    "omnimap": "navigation_sessions",
    "omnimusic": "music_studio_sessions",
    "omnitv": "tv_stream_meta",
    "omnimovies": "movie_catalog_meta",
    "omnitranslator": "translator_sessions",
    "omnicharge": "charge_sessions",
}


def _slugify_email(email: str) -> str:
    local = email.split("@")[0].lower()
    safe = re.sub(r"[^a-z0-9]+", "_", local).strip("_") or "user"
    digest = hashlib.sha256(email.encode()).hexdigest()[:10]
    return f"{safe}_{digest}"


async def get_module_collection(module: str):
    """Return Motor collection for a module key."""
    name = MODULE_COLLECTIONS.get(module)
    if not name:
        raise ValueError(f"Unknown module pool: {module}")
    db = await get_async_database()
    if db is None:
        return None
    return db[name]


async def provision_workspace(
    *,
    email: str,
    tool: str,
    user_id: str,
    metadata: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Create an isolated MongoDB workspace document for a new app/project.
    Falls back to in-memory descriptor when Atlas is unavailable.
    """
    workspace_id = _slugify_email(email)
    doc = {
        "workspace_id": workspace_id,
        "email_domain": email.split("@")[-1] if "@" in email else "unknown",
        "tool": tool,
        "user_id": user_id,
        "status": "provisioned",
        "collections": {
            "projects": f"ws_{workspace_id}_projects",
            "assets": f"ws_{workspace_id}_assets",
            "logs": f"ws_{workspace_id}_logs",
        },
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    col = await get_module_collection("builder")
    if col is not None:
        await col.update_one(
            {"workspace_id": workspace_id},
            {"$set": doc},
            upsert=True,
        )
        logger.info("Provisioned Mongo workspace %s for tool=%s", workspace_id, tool)
        doc["persisted"] = True
    else:
        logger.warning("Mongo unavailable — workspace %s kept in-memory only", workspace_id)
        doc["persisted"] = False
        doc["mode"] = "in_memory_fallback"

    return doc


async def save_module_record(module: str, record: dict[str, Any]) -> dict[str, Any]:
    """Insert or upsert a record into a module pool."""
    col = await get_module_collection(module)
    if col is None:
        record["persisted"] = False
        return record
    key = record.get("id") or record.get("job_id") or record.get("session_id")
    if key:
        await col.update_one({"id": key}, {"$set": record}, upsert=True)
    else:
        result = await col.insert_one(record)
        record["_id"] = str(result.inserted_id)
    record["persisted"] = True
    return record
