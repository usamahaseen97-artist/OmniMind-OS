"""
Unified async job queue — Redis-backed with in-memory fallback.
Heavy OmniMind tools return an immediate job token; workers run off the request thread.
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable, Optional

from services.redis_cache import cache_get_json, cache_set_json

logger = logging.getLogger(__name__)

JobRunner = Callable[[], Awaitable[dict[str, Any]]]

HEAVY_TOOL_ALIASES: frozenset[str] = frozenset(
    {
        "visionary_ai",
        "vfx_editor",
        "architect",
        "blueprint",
        "quantum_trading",
        "fintech",
        "nasa_solver",
        "physics",
        "medical_diagnostic",
        "healthcare",
        "game_dev",
        "simulation",
    }
)

_JOB_TTL_SECONDS = 7200
_memory_jobs: dict[str, dict[str, Any]] = {}


@dataclass
class OmniJob:
    id: str
    tool_name: str
    user_id: str
    query: str
    status: str = "queued"  # queued | processing | completed | failed
    progress: int = 0
    message: str = "Queued for OmniMind pipeline…"
    result: dict[str, Any] | None = None
    error: str | None = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)


def is_heavy_tool(tool_name: str) -> bool:
    return tool_name.lower().strip() in HEAVY_TOOL_ALIASES


def _job_key(job_id: str) -> str:
    return f"omni:job:{job_id}"


def _snapshot(job: OmniJob) -> dict[str, Any]:
    return {
        "job_id": job.id,
        "tool_name": job.tool_name,
        "user_id": job.user_id,
        "query": job.query,
        "status": job.status,
        "progress": job.progress,
        "message": job.message,
        "result": job.result,
        "error": job.error,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }


async def _persist(job: OmniJob) -> None:
    snap = _snapshot(job)
    _memory_jobs[job.id] = snap
    await cache_set_json(_job_key(job.id), snap, ttl_seconds=_JOB_TTL_SECONDS)


async def create_job(tool_name: str, user_id: str, query: str) -> OmniJob:
    job = OmniJob(
        id=str(uuid.uuid4()),
        tool_name=tool_name.lower().strip(),
        user_id=user_id,
        query=query,
    )
    await _persist(job)
    return job


async def get_job_snapshot(job_id: str) -> dict[str, Any] | None:
    cached = await cache_get_json(_job_key(job_id))
    if isinstance(cached, dict):
        return cached
    return _memory_jobs.get(job_id)


async def update_job(
    job_id: str,
    *,
    status: str | None = None,
    progress: int | None = None,
    message: str | None = None,
) -> None:
    snap = await get_job_snapshot(job_id)
    if not snap:
        return
    if status is not None:
        snap["status"] = status
    if progress is not None:
        snap["progress"] = max(0, min(100, progress))
    if message is not None:
        snap["message"] = message
    snap["updated_at"] = time.time()
    _memory_jobs[job_id] = snap
    await cache_set_json(_job_key(job_id), snap, ttl_seconds=_JOB_TTL_SECONDS)


async def complete_job(job_id: str, result: dict[str, Any]) -> None:
    snap = await get_job_snapshot(job_id)
    if not snap:
        return
    snap.update(
        {
            "status": "completed",
            "progress": 100,
            "message": "Pipeline complete",
            "result": result,
            "error": None,
            "updated_at": time.time(),
        }
    )
    _memory_jobs[job_id] = snap
    await cache_set_json(_job_key(job_id), snap, ttl_seconds=_JOB_TTL_SECONDS)


async def fail_job(job_id: str, error: str) -> None:
    snap = await get_job_snapshot(job_id)
    if not snap:
        return
    snap.update(
        {
            "status": "failed",
            "error": error[:500],
            "message": error[:500],
            "updated_at": time.time(),
        }
    )
    _memory_jobs[job_id] = snap
    await cache_set_json(_job_key(job_id), snap, ttl_seconds=_JOB_TTL_SECONDS)


async def schedule_job(
    tool_name: str,
    query: str,
    user_identity: str,
    runner: JobRunner,
    *,
    poll_path: str = "/api/v1/omnimind/jobs",
) -> dict[str, Any]:
    """Create job, return immediate acknowledgment, run runner in background."""
    job = await create_job(tool_name, user_identity, query)
    await update_job(job.id, status="queued", progress=5, message="Accepted — pipeline starting")

    async def _run() -> None:
        await update_job(job.id, status="processing", progress=15, message="Running heavy pipeline…")
        try:
            result = await runner()
            await complete_job(job.id, result)
        except Exception as exc:
            logger.warning("Job %s (%s) failed: %s", job.id, tool_name, exc)
            await fail_job(job.id, str(exc))

    asyncio.create_task(_run())
    return {
        "status": "accepted",
        "async": True,
        "job_id": job.id,
        "tool": tool_name,
        "poll_url": f"{poll_path}/{job.id}",
        "message": "Heavy tool queued — poll for completion (UI stays responsive)",
    }
