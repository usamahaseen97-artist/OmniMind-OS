"""OpenStreetMap Nominatim geocoding (no API key required)."""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "OmniMind-V11/1.0 (maps; contact: omnimind.local)"


async def geocode_query(query: str, limit: int = 1) -> list[dict[str, Any]]:
    """Return [{lat, lng, display_name, ...}] from Nominatim."""
    q = query.strip()
    if not q:
        return []

    params = {
        "q": q,
        "format": "json",
        "limit": limit,
        "addressdetails": 1,
    }
    headers = {"User-Agent": USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.get(NOMINATIM_URL, params=params, headers=headers)
            res.raise_for_status()
            data = res.json()
    except Exception as exc:
        logger.warning("Geocode failed for %r: %s", q[:80], exc)
        return []

    results: list[dict[str, Any]] = []
    for item in data if isinstance(data, list) else []:
        try:
            results.append(
                {
                    "lat": float(item["lat"]),
                    "lng": float(item["lon"]),
                    "display_name": item.get("display_name", q),
                    "name": item.get("name") or q,
                }
            )
        except (KeyError, TypeError, ValueError):
            continue
    return results


async def geocode_place(name: str, area: str = "") -> Optional[dict[str, Any]]:
    query = f"{name}, {area}" if area else name
    hits = await geocode_query(query, limit=1)
    return hits[0] if hits else None
