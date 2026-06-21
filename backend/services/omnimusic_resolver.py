"""
Resolve OmniMusic catalog rows to real playable streams via Audius (free catalog).
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any, Optional

from config import get_settings
from services import audius_client

logger = logging.getLogger(__name__)

_resolve_cache: dict[str, dict[str, str]] = {}
_ENRICH_SEM = asyncio.Semaphore(6)


def play_url(audius_id: str) -> str:
    base = get_settings().omnimind_public_api_url.rstrip("/")
    return f"{base}/api/v1/music/play/{audius_id}"


def _pick_best_match(doc: dict[str, Any], hits: list[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if not hits:
        return None
    title = (doc.get("title") or "").lower()
    artist = (doc.get("artist") or "").lower()
    artist_main = re.split(r"[&,]| feat", artist, maxsplit=1)[0].strip()

    best: Optional[dict[str, Any]] = None
    best_score = -1
    for t in hits:
        t_title = (t.get("title") or "").lower()
        t_user = ((t.get("user") or {}).get("name") or "").lower()
        score = 0
        if title and title in t_title:
            score += 50
        if title and t_title in title:
            score += 30
        if artist_main and artist_main in t_user:
            score += 20
        if artist_main and artist_main in t_title:
            score += 15
        if score > best_score:
            best_score = score
            best = t
    return best or hits[0]


def audius_hit_to_doc(hit: dict[str, Any], *, query: str = "") -> dict[str, Any]:
    user = hit.get("user") or {}
    tid = str(hit["id"])
    dur_label, dur_sec = audius_client.format_duration(int(hit.get("duration") or 0))
    title = str(hit.get("title") or "Track")
    artist = str(user.get("name") or "Audius Artist")
    thumb = audius_client.artwork_url(hit)
    tags = ["audius", "stream", "latest"]
    if query:
        tags.append(query.lower())

    return {
        "id": f"audius-{tid}",
        "title": title,
        "artist": artist,
        "album": "Audius",
        "playlist": "Live Search",
        "category": "Latest",
        "year": 2024,
        "era": "latest",
        "tags": tags,
        "duration": dur_label,
        "duration_sec": dur_sec or 240,
        "thumbnail_url": thumb,
        "audius_id": tid,
        "audio_url": play_url(tid),
        "source": "audius",
        "dynamic": bool(query),
    }


async def resolve_track_audio(doc: dict[str, Any]) -> dict[str, Any]:
    """Attach real stream URL; cache by catalog id."""
    cid = str(doc.get("id") or "")
    if cid in _resolve_cache:
        cached = _resolve_cache[cid]
        return {**doc, **cached}

    audius_id = doc.get("audius_id")
    thumb = doc.get("thumbnail_url") or ""

    if not audius_id:
        query = f"{doc.get('title', '')} {doc.get('artist', '')}".strip()
        try:
            hits = await audius_client.search_tracks(query, limit=6)
            pick = _pick_best_match(doc, hits)
            if pick:
                audius_id = str(pick["id"])
                thumb = audius_client.artwork_url(pick) or thumb
                doc["title"] = doc.get("title") or pick.get("title")
        except Exception as exc:
            logger.debug("Audius resolve failed for %s: %s", query, exc)

    if audius_id:
        patch = {
            "audius_id": audius_id,
            "audio_url": play_url(str(audius_id)),
            "thumbnail_url": thumb,
            "source": "audius",
        }
        if cid:
            _resolve_cache[cid] = patch
        return {**doc, **patch}

    return doc


async def enrich_tracks(docs: list[dict[str, Any]], *, max_resolve: int = 8) -> list[dict[str, Any]]:
    if not docs:
        return docs

    for d in docs:
        if d.get("audius_id"):
            d["audio_url"] = play_url(str(d["audius_id"]))
            d["source"] = d.get("source") or "audius"

    async def _one(d: dict[str, Any]) -> dict[str, Any]:
        if d.get("audius_id") and d.get("audio_url"):
            return d
        async with _ENRICH_SEM:
            return await resolve_track_audio(d)

    need = [d for d in docs if not (d.get("audius_id") and d.get("audio_url"))]
    if not need:
        return docs

    head = need[:max_resolve]
    resolved = await asyncio.gather(*[_one(d) for d in head])
    resolved_map = {d["id"]: d for d in resolved}
    out: list[dict[str, Any]] = []
    for d in docs:
        out.append(resolved_map.get(d["id"], d))
    return out


async def audius_search_as_tracks(query: str, *, limit: int = 8) -> list[dict[str, Any]]:
    q = query.strip()
    if not q:
        return []
    try:
        hits = await audius_client.search_tracks(q, limit=limit)
        return [audius_hit_to_doc(h, query=q) for h in hits]
    except Exception as exc:
        logger.debug("Audius search failed: %s", exc)
        return []
