"""Non-blocking fallbacks when DB / Redis are slow or unavailable."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

_memory_cache: dict[str, Any] = {}


async def init_database_resilient(engine, base_metadata) -> str:
    """Create tables with timeout; fall back to SQLite dev file."""
    try:
        async with asyncio.timeout(8.0):
            async with engine.begin() as conn:
                await conn.run_sync(base_metadata.create_all)
        return "primary"
    except Exception as exc:
        logger.warning("primary DB init failed (%s) — switching to sqlite fallback", exc)
        fallback_url = "sqlite+aiosqlite:///./omniforge.fallback.db"
        os.environ["DATABASE_URL"] = fallback_url
        from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

        fb_engine = create_async_engine(
            fallback_url,
            connect_args={"check_same_thread": False},
        )
        async with fb_engine.begin() as conn:
            await conn.run_sync(base_metadata.create_all)
        import app.db as db_mod
        from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

        db_mod.engine = fb_engine
        db_mod.SessionLocal = async_sessionmaker(fb_engine, class_=AsyncSession, expire_on_commit=False)
        return "sqlite_fallback"


def memory_cache_get(key: str) -> Any | None:
    return _memory_cache.get(key)


def memory_cache_set(key: str, value: Any) -> None:
    _memory_cache[key] = value


def memory_cache_delete(key: str) -> None:
    _memory_cache.pop(key, None)
