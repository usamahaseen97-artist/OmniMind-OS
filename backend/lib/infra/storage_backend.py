"""Storage backend abstraction — local, S3-compatible object storage, CDN."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from config import get_settings

_LOCAL_ROOT = Path(os.getenv("OMNIMIND_STORAGE_ROOT", "storage"))


class StorageBackend:
    """Unified storage facade; S3 when bucket configured, else local."""

    def __init__(self) -> None:
        self._settings = get_settings()

    @property
    def mode(self) -> str:
        return "s3" if self._settings.s3_bucket else "local"

    def local_path(self, key: str) -> Path:
        safe = key.lstrip("/").replace("..", "")
        path = _LOCAL_ROOT / safe
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    def public_url(self, key: str) -> str:
        cdn = (self._settings.cdn_base_url or "").rstrip("/")
        if cdn:
            return f"{cdn}/{key.lstrip('/')}"
        if self.mode == "local":
            return f"/storage/{key.lstrip('/')}"
        return f"s3://{self._settings.s3_bucket}/{key.lstrip('/')}"

    def snapshot(self) -> dict[str, Any]:
        return {
            "mode": self.mode,
            "bucket": self._settings.s3_bucket or None,
            "region": self._settings.s3_region,
            "cdn": self._settings.cdn_base_url or None,
            "localRoot": str(_LOCAL_ROOT),
        }


storage_backend = StorageBackend()
