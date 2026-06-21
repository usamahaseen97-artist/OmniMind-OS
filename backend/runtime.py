"""
Windows-safe uvicorn startup and reload detection.

Use from main.py __main__ or: python -m runtime (from backend/).
"""

from __future__ import annotations

import os
import sys
from typing import Any


def freeze_support_windows() -> None:
    """Required on Windows when using multiprocessing spawn (uvicorn --reload)."""
    if sys.platform == "win32":
        import multiprocessing

        multiprocessing.freeze_support()


def is_reload_supervisor_process() -> bool:
    """
    True in the uvicorn/watchfiles parent that watches files but must not
    run FastAPI lifespan background tasks (avoids spawn/reload crashes on Windows).
    """
    if os.environ.get("RUN_MAIN") == "true":
        return False

    argv = " ".join(getattr(sys, "argv", []))
    if "--reload" not in argv and "reload" not in os.environ.get("UVICORN_RELOAD", ""):
        return False

    try:
        import multiprocessing as mp

        if mp.parent_process() is not None:
            return False
    except (AttributeError, NotImplementedError, ValueError):
        pass

    return True


def should_run_lifespan_tasks() -> bool:
    """Whether this process should start Kafka watchers, Mongo threads, warmups, etc."""
    if os.environ.get("OMNIMIND_SKIP_STARTUP", "").lower() in ("1", "true", "yes"):
        return False
    return not is_reload_supervisor_process()


def uvicorn_run_kwargs(*, port: int | None = None) -> dict[str, Any]:
    """Build kwargs for uvicorn.run with Windows-friendly reload defaults."""
    reload = os.getenv("UVICORN_RELOAD", "0").strip().lower() in ("1", "true", "yes")
    kwargs: dict[str, Any] = {
        "app": "main:app",
        "host": os.getenv("HOST", "127.0.0.1"),
        "port": port or int(os.getenv("PORT", "8001")),
        "log_level": os.getenv("UVICORN_LOG_LEVEL", "info"),
        "access_log": True,
        "timeout_keep_alive": 5,
        "reload": reload,
    }
    if reload:
        kwargs["reload_dirs"] = [os.path.dirname(os.path.abspath(__file__))]
        kwargs["reload_excludes"] = [
            "data",
            "data/*",
            "*.jsonl",
            "__pycache__",
            ".pytest_cache",
            ".venv",
            "venv",
        ]
        if sys.platform == "win32":
            os.environ.setdefault("WATCHFILES_FORCE_POLLING", "true")
    return kwargs


def run_uvicorn() -> None:
    """Entry used by ``python main.py`` or ``python -m runtime``."""
    freeze_support_windows()
    import uvicorn

    uvicorn.run(**uvicorn_run_kwargs())
