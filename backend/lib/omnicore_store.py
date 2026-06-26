"""OmniCore platform persistence — MongoDB with process-memory fallback only when Atlas unavailable."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from database import get_collection, is_memory_fallback

logger = logging.getLogger(__name__)

_COLLECTION = "omnicore_platform"
_process_cache: dict[str, Any] = {}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _col():
    return get_collection(_COLLECTION)


def load(key: str, default: Any) -> Any:
    """Load document by key; returns default if missing."""
    col = _col()
    if col is None or is_memory_fallback():
        return _process_cache.get(key, default)
    try:
        doc = col.find_one({"_id": key})
        if doc and "data" in doc:
            return doc["data"]
    except Exception as exc:
        logger.warning("omnicore_store load %s failed: %s", key, exc)
    return default


def save(key: str, data: Any) -> bool:
    """Persist document by key."""
    col = _col()
    payload = {"_id": key, "data": data, "updatedAt": _now()}
    if col is None or is_memory_fallback():
        _process_cache[key] = data
        return True
    try:
        col.replace_one({"_id": key}, payload, upsert=True)
        return True
    except Exception as exc:
        logger.error("omnicore_store save %s failed: %s", key, exc)
        _process_cache[key] = data
        return False


def append_list_item(key: str, item: dict[str, Any], *, max_items: int = 500) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = list(load(key, []))
    items.insert(0, item)
    if len(items) > max_items:
        items = items[:max_items]
    save(key, items)
    return items


def load_list(key: str) -> list[dict[str, Any]]:
    data = load(key, [])
    return data if isinstance(data, list) else []


def status() -> dict[str, Any]:
    col = _col()
    return {
        "collection": _COLLECTION,
        "mongo": col is not None and not is_memory_fallback(),
        "memoryFallback": is_memory_fallback() or col is None,
        "keysCached": list(_process_cache.keys()),
    }
