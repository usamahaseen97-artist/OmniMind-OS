"""
Async MongoDB Atlas access via Motor.
Uses bracket notation client[db_name] — never client.get_database().
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import get_settings
from database import resolve_mongodb_uri

logger = logging.getLogger(__name__)

_async_client: Optional[AsyncIOMotorClient] = None


class MongoNotConfiguredError(Exception):
    """Raised when MONGODB_* credentials are missing from .env."""


def _db_name() -> str:
    return get_settings().mongodb_db_name or "omnimind"


async def get_motor_client() -> Optional[AsyncIOMotorClient]:
    """Singleton AsyncIOMotorClient; returns None if Atlas is not configured."""
    global _async_client
    uri = resolve_mongodb_uri()
    if not uri:
        logger.warning(
            "MongoDB async client skipped — set MONGODB_URI or "
            "MONGODB_USER + MONGODB_PASSWORD + MONGODB_HOST in .env"
        )
        return None

    if _async_client is None:
        try:
            _async_client = AsyncIOMotorClient(
                uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                retryWrites=True,
            )
        except Exception as exc:
            logger.error("Failed to create Motor client: %s", exc)
            _async_client = None
            return None
    return _async_client


async def get_async_database(
    db_name: Optional[str] = None,
) -> Optional[AsyncIOMotorDatabase]:
    """Return Atlas database using bracket access: client['omnimind']."""
    client = await get_motor_client()
    if client is None:
        return None
    name = db_name or _db_name()
    return client[name]


async def ping_async() -> dict[str, Any]:
    """Non-fatal Atlas ping for health endpoints."""
    uri = resolve_mongodb_uri()
    if not uri:
        return {
            "connected": False,
            "mode": "async",
            "error": "not_configured",
            "hint": "Set MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST in .env",
        }

    client = await get_motor_client()
    if client is None:
        return {"connected": False, "mode": "async", "error": "client_init_failed"}

    name = _db_name()
    try:
        await client.admin.command("ping")
        db = client[name]
        return {
            "connected": True,
            "mode": "async_motor",
            "database": db.name,
        }
    except Exception as exc:
        logger.warning("MongoDB async ping failed: %s", exc)
        await close_async_client()
        return {
            "connected": False,
            "mode": "async",
            "error": type(exc).__name__,
            "message": str(exc)[:300],
        }


async def close_async_client() -> None:
    """Close Motor client on application shutdown."""
    global _async_client
    if _async_client is not None:
        _async_client.close()
        _async_client = None
        logger.info("Motor async client closed")
