"""OmniMind background worker entrypoint — run: python worker_main.py"""

from __future__ import annotations

import asyncio
import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("omnimind.worker")


async def main() -> None:
    from lib.infra.queue_worker import run_worker

    logger.info("Starting OmniMind background worker")
    await run_worker()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Worker shutdown")
        sys.exit(0)
