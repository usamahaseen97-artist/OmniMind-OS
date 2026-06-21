"""Contextual map search: LLM + web context + geocoding."""

from __future__ import annotations

import logging
from typing import Any

from services.geocode import geocode_place, geocode_query
from services.prompts import OMNI_MAPS_SYSTEM
from services.superapp_ai import complete_json, extract_json_object
from services.tavily import tavily_search

logger = logging.getLogger(__name__)

# Default map center (Karachi) when area unknown
DEFAULT_CENTER = {"lat": 24.8607, "lng": 67.0011}


async def _enrich_places_coords(places: list[dict], area: str) -> list[dict]:
    enriched: list[dict] = []
    for p in places:
        if not isinstance(p, dict):
            continue
        lat = p.get("lat")
        lng = p.get("lng")
        name = str(p.get("name", "Place"))
        address = str(p.get("address", area))

        if lat is None or lng is None:
            geo = await geocode_place(name, area or address)
            if geo:
                lat, lng = geo["lat"], geo["lng"]
                if not address or address == area:
                    address = geo.get("display_name", address)

        try:
            lat_f = float(lat) if lat is not None else None
            lng_f = float(lng) if lng is not None else None
        except (TypeError, ValueError):
            lat_f, lng_f = None, None

        if lat_f is None or lng_f is None:
            continue

        enriched.append(
            {
                "name": name,
                "address": address,
                "lat": lat_f,
                "lng": lng_f,
                "rating": p.get("rating"),
                "review_highlight": p.get("review_highlight", ""),
                "category": p.get("category", ""),
            }
        )
    return enriched


def _fallback_places_from_geocode(hits: list[dict], query: str) -> list[dict]:
    places = []
    for i, h in enumerate(hits[:5]):
        places.append(
            {
                "name": h.get("name") or f"Result {i + 1}",
                "address": h.get("display_name", query),
                "lat": h["lat"],
                "lng": h["lng"],
                "rating": None,
                "review_highlight": "Matched via OpenStreetMap",
                "category": "place",
            }
        )
    return places


async def search_maps(
    query: str,
    *,
    user_lat: float | None = None,
    user_lng: float | None = None,
    drive_mode: bool = False,
) -> dict[str, Any]:
    """Analyze query contextually and return places + narrative."""
    q = query.strip()
    if not q:
        return {"reply": "Please enter a location question.", "places": [], "center": DEFAULT_CENTER}

    web_context = ""
    try:
        web_context = await tavily_search(
            f"{q} best rated reviews restaurants places location coordinates",
            max_results=6,
        )
    except Exception as exc:
        logger.debug("Tavily maps context: %s", exc)

    llm_message = (
        f"User query: {q}\n"
        f"User coordinates (optional): lat={user_lat}, lng={user_lng}\n"
        f"Drive mode: {drive_mode}\n\n"
    )
    if web_context:
        llm_message += f"Live web context:\n{web_context}\n"

    data: dict[str, Any]
    try:
        data = await complete_json(message=llm_message, system_prompt=OMNI_MAPS_SYSTEM, temperature=0.35)
    except Exception as exc:
        logger.warning("Maps LLM JSON failed: %s", exc)
        data = {}

    area = str(data.get("search_area") or "")
    places = await _enrich_places_coords(data.get("places") or [], area)

    if not places:
        geo_hits = await geocode_query(q if not area else f"{q}, {area}", limit=5)
        places = _fallback_places_from_geocode(geo_hits, q)
        if not data.get("reply"):
            data["reply"] = (
                f"Found **{len(places)}** location(s) for your search. "
                "Enable Tavily + LM Studio for richer review-based rankings."
            )

    center = DEFAULT_CENTER.copy()
    if user_lat is not None and user_lng is not None:
        center = {"lat": user_lat, "lng": user_lng}
    elif places:
        center = {
            "lat": sum(p["lat"] for p in places) / len(places),
            "lng": sum(p["lng"] for p in places) / len(places),
        }

    reply = data.get("reply") or "Here are the best matches for your search."
    voice = data.get("voice_guidance") or ""

    if drive_mode and not voice and places:
        top = places[0]
        voice = (
            f"Head toward {top['name']}. "
            f"{top.get('review_highlight') or 'It is a popular choice in this area.'}"
        )

    return {
        "reply": reply,
        "voice_guidance": voice,
        "search_area": area,
        "places": places,
        "center": center,
        "place_count": len(places),
    }
