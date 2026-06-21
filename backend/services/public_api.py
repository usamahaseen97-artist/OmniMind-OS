"""Resolve OmniMind public API base URL (default port 8001)."""

from __future__ import annotations

from config import get_settings


def public_api_base() -> str:
    return get_settings().omnimind_public_api_url.rstrip("/")


def resolve_local_url(path: str) -> str:
    """Turn relative API paths into absolute URLs for server-side fetch."""
    if not path:
        return path
    if path.startswith("http://") or path.startswith("https://"):
        return path
    base = public_api_base()
    return f"{base}{path if path.startswith('/') else '/' + path}"
