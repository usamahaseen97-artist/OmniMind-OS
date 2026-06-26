"""Dependency injection helpers for platform services."""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated, Any

from fastapi import Depends

from lib.omnicore_store import load, save, status as store_status


@lru_cache(maxsize=1)
def get_store_status() -> dict[str, Any]:
    return store_status()


def omnicore_load(key: str, default: Any) -> Any:
    return load(key, default)


def omnicore_save(key: str, data: Any) -> bool:
    return save(key, data)


StoreStatus = Annotated[dict[str, Any], Depends(get_store_status)]
