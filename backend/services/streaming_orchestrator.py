"""
On-demand Kafka / Spark via Docker Compose + idle auto-stop.

Docker commands (project root — same as manual terminal):
  docker compose -f docker-compose.yml up -d kafka
  docker compose -f docker-compose.yml up -d spark-master spark-worker
  docker compose -f docker-compose.yml stop kafka
  docker compose -f docker-compose.yml stop spark-master spark-worker
"""

from __future__ import annotations

import asyncio
import logging
import subprocess
import time
from pathlib import Path
from typing import Any, Literal, Optional

import requests

from config import get_settings
from services import kafka_bus, spark_client
from services.infra_pool import run_blocking
from services.process_utils import docker_executable, run_subprocess_safe

logger = logging.getLogger(__name__)

ServiceName = Literal["kafka", "spark"]

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
COMPOSE_FILE = PROJECT_ROOT / "docker-compose.yml"

SERVICE_CONTAINERS: dict[ServiceName, list[str]] = {
    "kafka": ["omnimind-kafka"],
    "spark": ["omnimind-spark-master", "omnimind-spark-worker"],
}

COMPOSE_UP_TARGETS: dict[ServiceName, list[str]] = {
    "kafka": ["kafka"],
    "spark": ["spark-master", "spark-worker"],
}

COMPOSE_STOP_TARGETS: dict[ServiceName, list[str]] = {
    "kafka": ["kafka"],
    "spark": ["spark-master", "spark-worker"],
}

_last_activity: dict[ServiceName, float] = {"kafka": 0.0, "spark": 0.0}
_watchdog_task: asyncio.Task[None] | None = None
_lock = asyncio.Lock()


def _docker_missing_error() -> dict[str, Any]:
    return {
        "ready": False,
        "error": (
            "Docker CLI not found on PATH. Install Docker Desktop or set DOCKER_BINARY, "
            "or disable Kafka/Spark on-demand features."
        ),
        "hint": "Telemetry and music work without Docker; streaming stacks are optional.",
    }


def _compose_base() -> Optional[list[str]]:
    docker = docker_executable()
    if not docker:
        return None
    return [docker, "compose", "-f", str(COMPOSE_FILE)]


def _run_compose_sync(*args: str, timeout: int = 180) -> subprocess.CompletedProcess[str]:
    base = _compose_base()
    if not base:
        raise FileNotFoundError("docker executable not found")
    cmd = [*base, *args]
    logger.info("Executing: %s", " ".join(cmd))
    proc, err = run_subprocess_safe(
        cmd,
        cwd=str(PROJECT_ROOT),
        timeout=timeout,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc is None:
        raise FileNotFoundError(err or "docker compose failed")
    return proc


def _container_states_sync() -> dict[str, str]:
    """Fast docker probe — never block API health for 30s if Docker Desktop is stuck."""
    wanted = set(SERVICE_CONTAINERS["kafka"] + SERVICE_CONTAINERS["spark"])
    states: dict[str, str] = {n: "missing" for n in wanted}
    docker = docker_executable()
    if not docker:
        return states
    proc, _ = run_subprocess_safe(
        [docker, "ps", "-a", "--format", "{{.Names}}|{{.State}}"],
        timeout=2,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc is None:
        return states
    for line in (proc.stdout or "").strip().splitlines():
        if "|" not in line:
            continue
        name, state = line.split("|", 1)
        name = name.strip()
        if name in wanted:
            states[name] = state.strip().lower()
    return states


def is_service_running(service: ServiceName) -> bool:
    states = _container_states_sync()
    required = SERVICE_CONTAINERS[service]
    return all(states.get(c, "").startswith("running") for c in required)


def touch_activity(service: ServiceName) -> None:
    _last_activity[service] = time.monotonic()


def _wait_kafka_ready_sync(max_wait: int = 90) -> bool:
    settings = get_settings()
    host = settings.kafka_bootstrap_servers.split(",")[0].strip()
    if ":" in host:
        _, port_s = host.rsplit(":", 1)
        port = int(port_s)
    else:
        port = 9092
    host_only = host.split(":")[0] if ":" in host else host
    deadline = time.monotonic() + max_wait
    while time.monotonic() < deadline:
        try:
            import socket

            with socket.create_connection((host_only, port), timeout=2):
                return True
        except OSError:
            time.sleep(2)
    return False


def _wait_spark_ready_sync(max_wait: int = 120) -> bool:
    url = f"{get_settings().spark_ui_url.rstrip('/')}/json/"
    deadline = time.monotonic() + max_wait
    while time.monotonic() < deadline:
        try:
            r = requests.get(url, timeout=4)
            if r.ok:
                return True
        except requests.RequestException:
            pass
        time.sleep(3)
    return False


async def ensure_service_active(service: ServiceName) -> dict[str, Any]:
    """
    Start Docker service if stopped; connect Kafka client when applicable.
    Records activity for idle watchdog.
    """
    touch_activity(service)
    settings = get_settings()

    if not COMPOSE_FILE.is_file():
        return {
            "ready": False,
            "service": service,
            "error": f"docker-compose.yml not found at {COMPOSE_FILE}",
            "hint": "Run compose from project root: omnimind 1/",
        }

    if not docker_executable():
        out = _docker_missing_error()
        out["service"] = service
        return out

    async with _lock:
        running = await run_blocking(is_service_running, service)
        if not running:
            targets = COMPOSE_UP_TARGETS[service]
            try:
                proc = await run_blocking(_run_compose_sync, "up", "-d", *targets)
            except FileNotFoundError as exc:
                return {
                    "ready": False,
                    "service": service,
                    "error": str(exc),
                }
            if proc.returncode != 0:
                return {
                    "ready": False,
                    "service": service,
                    "error": (proc.stderr or proc.stdout or "docker compose up failed").strip(),
                    "command": " ".join([*(_compose_base() or ["docker", "compose"]), "up", "-d", *targets]),
                }
            if service == "kafka":
                ok = await run_blocking(_wait_kafka_ready_sync)
                if not ok:
                    return {"ready": False, "service": service, "error": "Kafka port not reachable"}
            else:
                ok = await run_blocking(_wait_spark_ready_sync)
                if not ok:
                    return {"ready": False, "service": service, "error": "Spark UI not reachable"}

        if service == "kafka":
            status = await kafka_bus.init_kafka()
            return {
                "ready": bool(status.get("connected")),
                "service": service,
                "mode": "on-demand",
                "lazy_load": settings.streaming_lazy_load,
                **status,
            }

        status = spark_client.ping_spark()
        return {
            "ready": bool(status.get("connected")),
            "service": service,
            "mode": "on-demand",
            **status,
        }


async def stop_service(service: ServiceName) -> dict[str, Any]:
    """Stop Docker containers and release client connections."""
    async with _lock:
        if service == "kafka":
            await kafka_bus.close_kafka()

        if not await run_blocking(is_service_running, service):
            return {"stopped": True, "service": service, "already_stopped": True}

        if not docker_executable():
            return {"stopped": True, "service": service, "already_stopped": True}

        targets = COMPOSE_STOP_TARGETS[service]
        try:
            proc = await run_blocking(_run_compose_sync, "stop", *targets)
        except FileNotFoundError as exc:
            return {"stopped": False, "service": service, "error": str(exc)}
        base = _compose_base() or ["docker", "compose", "-f", str(COMPOSE_FILE)]
        return {
            "stopped": proc.returncode == 0,
            "service": service,
            "stderr": (proc.stderr or "").strip() or None,
            "command": " ".join([*base, "stop", *targets]),
        }


def service_status(service: ServiceName) -> dict[str, Any]:
    states = _container_states_sync()
    containers = {
        name: states.get(name, "missing") for name in SERVICE_CONTAINERS[service]
    }
    running = all(s.startswith("running") for s in containers.values())
    idle_seconds = (
        time.monotonic() - _last_activity[service] if _last_activity[service] else None
    )
    return {
        "service": service,
        "running": running,
        "containers": containers,
        "last_activity_seconds_ago": round(idle_seconds, 1) if idle_seconds is not None else None,
    }


async def _idle_watchdog_loop() -> None:
    settings = get_settings()
    interval = max(30, settings.streaming_watchdog_interval_seconds)
    idle_limit = max(60, settings.streaming_idle_timeout_seconds)

    while True:
        try:
            await asyncio.sleep(interval)
            now = time.monotonic()
            for service in ("kafka", "spark"):
                last = _last_activity[service]
                if last <= 0:
                    continue
                if now - last < idle_limit:
                    continue
                if not await run_blocking(is_service_running, service):
                    continue
                logger.info(
                    "Idle timeout (%ss) — stopping %s", idle_limit, service
                )
                await stop_service(service)
                _last_activity[service] = 0.0
        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.warning("Streaming watchdog error: %s", exc)


async def start_idle_watchdog() -> None:
    global _watchdog_task
    if _watchdog_task is not None and not _watchdog_task.done():
        return
    _watchdog_task = asyncio.create_task(_idle_watchdog_loop(), name="streaming-idle-watchdog")


async def stop_idle_watchdog() -> None:
    global _watchdog_task
    if _watchdog_task is not None:
        _watchdog_task.cancel()
        try:
            await _watchdog_task
        except asyncio.CancelledError:
            pass
        _watchdog_task = None


async def ensure_kafka_running() -> dict[str, Any]:
    """On-demand Kafka: docker compose up -d kafka + connect producer."""
    return await ensure_service_active("kafka")


async def ensure_spark_running() -> dict[str, Any]:
    """On-demand Spark: docker compose up -d spark-master spark-worker."""
    return await ensure_service_active("spark")
