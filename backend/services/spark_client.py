"""
Apache Spark helpers for OmniMind.
Health checks use the Spark Master UI; PySpark session is created on demand.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import requests

from config import get_settings

logger = logging.getLogger(__name__)

_spark_session: Any = None


async def ping_spark_async() -> dict[str, Any]:
    """Non-blocking Spark UI health check (runs in infra thread pool)."""
    from services.infra_pool import run_blocking

    return await run_blocking(ping_spark)


def ping_spark() -> dict[str, Any]:
    """Check Spark Master via REST UI (no JVM required on the API host)."""
    settings = get_settings()
    base = settings.spark_ui_url.rstrip("/")
    url = f"{base}/json/"

    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        payload = response.json()
        workers = payload.get("workers") or []
        alive = [w for w in workers if isinstance(w, dict) and w.get("state") == "ALIVE"]
        return {
            "connected": True,
            "master_url": settings.spark_master_url,
            "ui_url": base,
            "workers_total": len(workers),
            "workers_alive": len(alive),
            "status": payload.get("status"),
        }
    except requests.RequestException as exc:
        return {
            "connected": False,
            "master_url": settings.spark_master_url,
            "ui_url": base,
            "error": str(exc),
            "hint": "Run: docker compose up -d  and open http://localhost:8080",
        }


def init_spark() -> dict[str, Any]:
    """
    Lightweight startup check (Master UI only).
    Does not start a local JVM — use get_spark_session() when running jobs.
    """
    status = ping_spark()
    if status.get("connected"):
        logger.info(
            "Spark master online (%s workers alive)",
            status.get("workers_alive", 0),
        )
    else:
        logger.warning("Spark not ready: %s", status.get("error", "unknown"))
    return status


def get_spark_session():
    """
    Lazy PySpark session (requires Java on the machine running the API).
    Master defaults to spark://localhost:7077 from .env.
    """
    global _spark_session
    if _spark_session is not None:
        return _spark_session

    from pyspark.sql import SparkSession

    settings = get_settings()
    _spark_session = (
        SparkSession.builder.master(settings.spark_master_url)
        .appName("OmniMind-V11")
        .config("spark.sql.shuffle.partitions", "4")
        .getOrCreate()
    )
    logger.info("PySpark session started: %s", settings.spark_master_url)
    return _spark_session


def stop_spark() -> None:
    """Stop PySpark session if one was created."""
    global _spark_session
    if _spark_session is not None:
        try:
            _spark_session.stop()
        except Exception as exc:
            logger.debug("Spark session stop: %s", exc)
        _spark_session = None
