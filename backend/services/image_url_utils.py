"""Normalize generated image URLs for chat SSE and markdown payloads."""
from __future__ import annotations

import os
from urllib.parse import urljoin, urlparse


def public_api_base() -> str:
    base = (
        os.getenv("OMNIMIND_PUBLIC_API_URL")
        or os.getenv("NEXT_PUBLIC_OMNIMIND_API_URL")
        or "http://127.0.0.1:8001"
    ).strip().rstrip("/")
    return base


def is_likely_image_url(url: str | None) -> bool:
    """True when value is a URL/path — not a bare text generation prompt."""
    if not url or not isinstance(url, str):
        return False
    raw = url.strip()
    if not raw:
        return False
    if raw.startswith("data:"):
        return True
    parsed = urlparse(raw)
    if parsed.scheme in ("http", "https"):
        return True
    if raw.startswith("//"):
        return True
    if raw.startswith("/api/") or raw.startswith("/omni-api/"):
        return True
    return False


def public_image_url(url: str | None) -> str:
    """Return an absolute, browser-loadable URL for chat markdown and SSE assets."""
    if not url or not isinstance(url, str):
        return ""
    raw = url.strip()
    if not raw:
        return ""
    if not is_likely_image_url(raw):
        return ""
    if raw.startswith("data:"):
        return raw
    parsed = urlparse(raw)
    if parsed.scheme in ("http", "https"):
        return raw
    if raw.startswith("//"):
        return f"https:{raw}"
    base = public_api_base()
    if raw.startswith("/"):
        return urljoin(f"{base}/", raw.lstrip("/"))
    return urljoin(f"{base}/", raw)


def normalize_image_asset(asset: dict) -> dict:
    """Ensure gallery/SSE image dicts expose absolute `url` fields."""
    if not isinstance(asset, dict):
        return asset
    out = dict(asset)
    url = out.get("url") or out.get("src") or out.get("href")
    if url:
        abs_url = public_image_url(str(url))
        out["url"] = abs_url
        out["src"] = abs_url
    return out
