"""CLI health check — run: python scripts/health_check.py (from backend/)"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv()

from database import ping  # noqa: E402
from services import kafka_bus, lm_studio, spark_client  # noqa: E402


async def main() -> int:
    print("MongoDB:", ping())
    print("LM Studio:", await lm_studio.check_connection())
    print("Kafka:", await kafka_bus.ping_kafka(retry=False))
    print("Spark:", spark_client.ping_spark())
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
