"""
OmniMusic search intelligence — suggestions, AI predict, lyric/voice identify, taste recommendations.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Optional

from config import get_settings
from services import audius_client
from services.omnimusic_catalog import CATALOG, PRODUCTION_SONGS
from services.omnimusic_resolver import audius_hit_to_doc, audius_search_as_tracks
from services.omnimusic_trending import get_trending_tracks

logger = logging.getLogger(__name__)

_SUGGEST_CACHE: dict[str, tuple[float, list[dict[str, Any]]]] = {}
_CACHE_TTL = 120.0


def _catalog_fuzzy(q: str, limit: int = 8) -> list[dict[str, Any]]:
    low = q.lower().strip()
    if not low:
        return []
    hits: list[tuple[int, dict[str, Any]]] = []
    for raw in PRODUCTION_SONGS:
        blob = f"{raw['title']} {raw['artist']} {' '.join(raw.get('tags', []))}".lower()
        score = 0
        if low in blob:
            score += 80
        for tok in low.split():
            if len(tok) > 1 and tok in blob:
                score += 25
        if score > 0:
            hits.append((score, raw))
    hits.sort(key=lambda x: -x[0])
    return hits[:limit]


async def music_suggestions(query: str, *, limit: int = 12) -> list[dict[str, Any]]:
    """YouTube-style instant suggestions (Elasticsearch + catalog + Audius)."""
    q = query.strip()
    if len(q) < 1:
        trending = await get_trending_tracks(limit=min(limit, 10))
        return [_public_suggestion(t) for t in trending]

    import time

    now = time.time()
    cached = _SUGGEST_CACHE.get(q.lower())
    if cached and now - cached[0] < _CACHE_TTL:
        return cached[1][:limit]

    out: list[dict[str, Any]] = []
    seen: set[str] = set()

    try:
        from services.elasticsearch_songs import search_songs_elasticsearch

        for doc in await search_songs_elasticsearch(q, limit=min(8, limit)):
            key = doc["title"].lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(
                {
                    "type": "track",
                    "label": doc["title"],
                    "sub": doc["artist"],
                    "search_query": f"{doc['title']} {doc['artist']}".strip(),
                    "track": doc,
                    "source": "elasticsearch",
                }
            )
    except Exception as exc:
        logger.debug("suggest ES: %s", exc)

    for _score, raw in _catalog_fuzzy(q, limit=6):
        title = str(raw.get("title") or "")
        key = title.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(
            {
                "type": "suggestion",
                "label": title,
                "sub": str(raw.get("artist") or ""),
                "search_query": title,
                "source": "catalog",
            }
        )

    try:
        live = await audius_search_as_tracks(q, limit=min(8, limit))
        for doc in live:
            key = doc["title"].lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(
                {
                    "type": "track",
                    "label": doc["title"],
                    "sub": doc["artist"],
                    "search_query": f"{doc['title']} {doc['artist']}".strip(),
                    "track": doc,
                    "source": "audius",
                }
            )
    except Exception as exc:
        logger.debug("suggest audius: %s", exc)

    if len(out) < limit:
        for raw in CATALOG:
            title = str(raw.get("title") or "")
            if q.lower() in title.lower() and title.lower() not in seen:
                seen.add(title.lower())
                out.append(
                    {
                        "type": "suggestion",
                        "label": title,
                        "sub": str(raw.get("artist") or ""),
                        "search_query": title,
                        "source": "catalog",
                    }
                )
            if len(out) >= limit:
                break

    result = out[:limit]
    _SUGGEST_CACHE[q.lower()] = (now, result)
    return result


def _public_suggestion(track: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "track",
        "label": track.get("title", ""),
        "sub": track.get("artist", ""),
        "search_query": f"{track.get('title', '')} {track.get('artist', '')}".strip(),
        "track": track,
        "source": track.get("source", "audius"),
    }


async def music_predict_queries(partial: str) -> list[str]:
    """AI completion of what user might be searching for."""
    q = partial.strip()
    if len(q) < 2:
        return []

    base = [s["search_query"] for s in await music_suggestions(q, limit=5) if s.get("search_query")]
    settings = get_settings()
    if not settings.gemini_api_key or len(q) < 3:
        return list(dict.fromkeys(base))[:5]

    try:
        import httpx

        model = settings.gemini_model.strip() or "gemini-2.0-flash"
        prompt = (
            f'User is searching for music. Partial query: "{q}". '
            "Return JSON only: {\"queries\": [\"full song search 1\", \"2\", \"3\"]} "
            "Mix Pakistani, Bollywood, English pop. Max 4 short queries."
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.gemini_api_key}"
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
            res.raise_for_status()
            text = (
                res.json()
                .get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            data = json.loads(m.group())
            ai = [str(x).strip() for x in data.get("queries", []) if str(x).strip()]
            return list(dict.fromkeys(ai + base))[:6]
    except Exception as exc:
        logger.debug("predict queries: %s", exc)

    return list(dict.fromkeys(base))[:5]


async def music_identify_snippet(snippet: str) -> dict[str, Any]:
    """
    Identify song from TikTok/reel lyric line or voice transcript.
    """
    text = snippet.strip()[:500]
    if len(text) < 2:
        return {"success": False, "error": "Snippet too short"}

    search_q = text
    title = ""
    artist = ""

    settings = get_settings()
    if settings.gemini_api_key:
        try:
            import httpx

            model = settings.gemini_model.strip() or "gemini-2.0-flash"
            prompt = (
                "A user heard a song on TikTok/Reel and only remembers this line or hum description:\n"
                f'"{text}"\n'
                'Reply JSON only: {"title":"Song Title","artist":"Artist Name","search_query":"best YouTube search"}'
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.gemini_api_key}"
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(
                    url,
                    json={"contents": [{"parts": [{"text": prompt}]}]},
                )
                res.raise_for_status()
                raw = (
                    res.json()
                    .get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
            m = re.search(r"\{[\s\S]*\}", raw)
            if m:
                data = json.loads(m.group())
                title = str(data.get("title") or "").strip()
                artist = str(data.get("artist") or "").strip()
                search_q = str(data.get("search_query") or f"{title} {artist}").strip() or search_q
        except Exception as exc:
            logger.debug("identify gemini: %s", exc)

    try:
        hits = await audius_client.search_tracks(search_q, limit=5)
        if hits:
            doc = audius_hit_to_doc(hits[0], query=search_q)
            return {
                "success": True,
                "title": title or doc["title"],
                "artist": artist or doc["artist"],
                "search_query": search_q,
                "track": doc,
                "ai_guess": bool(title),
            }
    except Exception as exc:
        logger.debug("identify audius: %s", exc)

    return {
        "success": False,
        "error": "Could not identify — try more lyrics or song name",
        "search_query": search_q,
    }


async def music_recommendations(
    *,
    play_history: list[dict[str, Any]],
    user_id: str = "",
    limit: int = 16,
) -> list[dict[str, Any]]:
    """Personalized rows from play history + trending."""
    tags: list[str] = []
    artists: list[str] = []
    for row in play_history[:30]:
        artists.append(str(row.get("artist") or "").lower())
        for t in row.get("tags") or []:
            tags.append(str(t).lower())
        pl = str(row.get("playlist") or row.get("category") or "").lower()
        if pl:
            tags.append(pl)

    try:
        from services.memory import get_user_memory

        prefs = get_user_memory(user_id) if user_id else {}
        taste = prefs.get("music_taste") or prefs.get("favorite_genres") or []
        if isinstance(taste, list):
            tags.extend(str(x).lower() for x in taste)
    except Exception:
        pass

    pool = await get_trending_tracks(limit=48)
    if not tags and not artists:
        return pool[:limit]

    def score(doc: dict[str, Any]) -> int:
        blob = f"{doc.get('artist','')} {' '.join(doc.get('tags',[]))} {doc.get('playlist','')}".lower()
        s = 0
        for a in artists:
            if a and a in blob:
                s += 40
        for t in tags:
            if t and t in blob:
                s += 15
        return s

    ranked = sorted(pool, key=score, reverse=True)
    try:
        from services.spark_analytics import collaborative_recommendations

        spark_ranked = collaborative_recommendations(
            user_id or "anonymous",
            domain="music",
            catalog=ranked,
            limit=limit,
        )
        if spark_ranked:
            return spark_ranked
    except Exception:
        pass
    return ranked[:limit]
