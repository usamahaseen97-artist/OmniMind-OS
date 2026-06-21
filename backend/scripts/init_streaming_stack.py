"""
Wake Kafka + Spark on demand (same as hitting /api/streaming/kafka/health).

With STREAMING_LAZY_LOAD=true (default), FastAPI does NOT start Docker at boot.
Usage (from backend/):
  python scripts/init_streaming_stack.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Allow imports from backend root
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv()

from services import kafka_bus  # noqa: E402
from services.streaming_orchestrator import (  # noqa: E402
    ensure_kafka_running,
    ensure_spark_running,
)


async def main() -> int:
    print("Starting Kafka (docker compose up -d kafka)...")
    kafka_status = await ensure_kafka_running()
    print("Kafka:", kafka_status)

    print("Starting Spark (docker compose up -d spark-master spark-worker)...")
    spark_status = await ensure_spark_running()
    print("Spark:", spark_status)

    await kafka_bus.close_kafka()

    ok = kafka_status.get("ready") and spark_status.get("ready")
    if ok:
        print("\nStreaming stack ready.")
        return 0
    print("\nStreaming stack not fully ready — is docker compose running?")
    return 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
