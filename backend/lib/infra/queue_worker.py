"""Background worker — Redis queue consumer for AI, video, email, notification jobs."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Awaitable, Callable

from services.redis_cache import cache_get_json, init_redis

logger = logging.getLogger(__name__)

QUEUE_NAMES = (
    "omni:queue:ai",
    "omni:queue:video",
    "omni:queue:email",
    "omni:queue:notification",
    "omni:queue:retry",
)

Handler = Callable[[dict[str, Any]], Awaitable[None]]


async def enqueue(queue: str, payload: dict[str, Any]) -> str:
    """Push job to Redis list; memory fallback via cache key."""
    from services.redis_cache import cache_set_json
    import uuid

    job_id = str(uuid.uuid4())
    body = {"id": job_id, "queue": queue, "payload": payload}
    await cache_set_json(f"omni:queue:job:{job_id}", body, ttl_seconds=7200)
    # List push when Redis client available
    try:
        from services import redis_cache

        client = redis_cache._redis_client  # noqa: SLF001
        if client is not None:
            await client.lpush(queue, json.dumps(body))
            return job_id
    except Exception as exc:
        logger.warning("Queue push fallback: %s", exc)
    return job_id


async def _default_handler(job: dict[str, Any]) -> None:
    logger.info("Worker processed job %s on %s", job.get("id"), job.get("queue"))


async def run_worker(
    queues: tuple[str, ...] = QUEUE_NAMES,
    handler: Handler | None = None,
    poll_interval: float = 2.0,
) -> None:
    """Long-running worker loop — run via worker_main.py."""
    await init_redis()
    process = handler or _default_handler
    logger.info("OmniMind worker started — queues: %s", ", ".join(queues))

    while True:
        try:
            from services import redis_cache

            client = redis_cache._redis_client  # noqa: SLF001
            if client is not None:
                result = await client.brpop(list(queues), timeout=5)
                if result:
                    _, raw = result
                    job = json.loads(raw)
                    await process(job)
                    continue
            await asyncio.sleep(poll_interval)
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.exception("Worker loop error: %s", exc)
            await asyncio.sleep(poll_interval)


async def drain_retry_queue(handler: Handler | None = None) -> int:
    """Process retry queue once — for scheduled cron."""
    process = handler or _default_handler
    count = 0
    while True:
        snap = await cache_get_json("omni:queue:retry:head")
        if not snap:
            break
        await process(snap)
        count += 1
    return count
