"""
Elasticsearch — songs index for fast fuzzy search (play_music, OmniMusic).

When ES is down / port locked / service stopped on Windows, all reads fall back to
``songs_static_provider`` (local JSON + in-memory index) — no crash, instant results.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

from config import get_settings

logger = logging.getLogger(__name__)

SONGS_INDEX = "songs"
_INDEX_READY = False
_client: Any = None

# Circuit breaker — avoid hammering a dead :9200 socket
_ES_CIRCUIT_OPEN = False
_ES_LAST_FAIL = 0.0
_ES_COOLDOWN_SEC = 120.0
_ES_PROBE_INTERVAL = 45.0
_ES_LAST_PROBE = 0.0

SONGS_MAPPING = {
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "analysis": {
            "analyzer": {
                "song_analyzer": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": ["lowercase", "asciifolding"],
                }
            }
        },
    },
    "mappings": {
        "properties": {
            "id": {"type": "keyword"},
            "title": {"type": "text", "analyzer": "song_analyzer", "fields": {"raw": {"type": "keyword"}}},
            "artist": {"type": "text", "analyzer": "song_analyzer"},
            "album": {"type": "text", "analyzer": "song_analyzer"},
            "playlist": {"type": "keyword"},
            "category": {"type": "keyword"},
            "tags": {"type": "text", "analyzer": "song_analyzer"},
            "era": {"type": "keyword"},
            "year": {"type": "integer"},
            "duration_sec": {"type": "integer"},
            "thumbnail_url": {"type": "keyword", "index": False},
            "audio_url": {"type": "keyword", "index": False},
            "audius_id": {"type": "keyword"},
            "youtube_id": {"type": "keyword"},
            "source": {"type": "keyword"},
        }
    },
}


def _index_name() -> str:
    return get_settings().elasticsearch_songs_index.strip() or SONGS_INDEX


def is_elasticsearch_enabled() -> bool:
    settings = get_settings()
    if not settings.elasticsearch_enabled:
        return False
    return bool(settings.elasticsearch_url.strip())


def _circuit_allows_es() -> bool:
    """Skip ES I/O when circuit is open (recent connection failure)."""
    if not _ES_CIRCUIT_OPEN:
        return True
    if time.time() - _ES_LAST_FAIL >= _ES_COOLDOWN_SEC:
        return True
    return False


def _open_circuit(reason: str) -> None:
    global _ES_CIRCUIT_OPEN, _ES_LAST_FAIL, _INDEX_READY
    if not _ES_CIRCUIT_OPEN:
        logger.info(
            "Elasticsearch unavailable (%s) — static JSON catalog active (%s tracks)",
            reason[:120],
            _static_count_safe(),
        )
    _ES_CIRCUIT_OPEN = True
    _ES_LAST_FAIL = time.time()
    _INDEX_READY = False


def _close_circuit() -> None:
    global _ES_CIRCUIT_OPEN
    _ES_CIRCUIT_OPEN = False


def _static_count_safe() -> int:
    try:
        from services.songs_static_provider import static_catalog_size

        return static_catalog_size()
    except Exception:
        return 0


def _static_fallback_search(query: str, *, limit: int) -> list[dict[str, Any]]:
    from services.songs_static_provider import search_static_songs

    return search_static_songs(query, limit=limit)


def song_to_es_document(doc: dict[str, Any]) -> dict[str, Any]:
    """Normalize catalog / MongoDB row for the songs index."""
    tags = doc.get("tags") or []
    if isinstance(tags, str):
        tags = [tags]
    return {
        "id": str(doc.get("id") or ""),
        "title": str(doc.get("title") or ""),
        "artist": str(doc.get("artist") or ""),
        "album": str(doc.get("album") or ""),
        "playlist": str(doc.get("playlist") or doc.get("category") or ""),
        "category": str(doc.get("category") or "Pop"),
        "tags": [str(t) for t in tags],
        "era": str(doc.get("era") or "latest"),
        "year": int(doc.get("year") or 2020),
        "duration_sec": int(doc.get("duration_sec") or doc.get("durationSec") or 240),
        "thumbnail_url": str(doc.get("thumbnail_url") or doc.get("thumbnailUrl") or ""),
        "audio_url": str(doc.get("audio_url") or doc.get("audioUrl") or ""),
        "audius_id": str(doc.get("audius_id") or ""),
        "youtube_id": str(doc.get("youtube_id") or ""),
        "source": str(doc.get("source") or "omnimusic"),
    }


def _get_client() -> Any:
    global _client
    if _client is not None:
        return _client
    from elasticsearch import AsyncElasticsearch

    settings = get_settings()
    url = settings.elasticsearch_url.strip()

    kwargs: dict[str, Any] = {
        "request_timeout": 4,
        "retry_on_timeout": False,
        "max_retries": 0,
        "verify_certs": settings.elasticsearch_verify_ssl,
    }
    user = settings.elasticsearch_username.strip()
    pwd = settings.elasticsearch_password.strip()
    if user and pwd:
        kwargs["basic_auth"] = (user, pwd)
    elif user:
        kwargs["basic_auth"] = (user, "")

    _client = AsyncElasticsearch(url, **kwargs)
    return _client


async def close_elasticsearch() -> None:
    global _client, _INDEX_READY
    if _client is not None:
        try:
            await _client.close()
        except Exception as exc:
            logger.debug("ES client close: %s", exc)
        _client = None
    _INDEX_READY = False


async def _ping_elasticsearch() -> bool:
    if not is_elasticsearch_enabled() or not _circuit_allows_es():
        return False
    try:
        client = _get_client()
        return bool(await client.ping())
    except Exception as exc:
        _open_circuit(str(exc))
        await close_elasticsearch()
        return False


async def ensure_songs_index() -> bool:
    """Create songs index with mapping if missing; never raises."""
    global _INDEX_READY
    if not is_elasticsearch_enabled():
        return False
    if not _circuit_allows_es():
        return False
    if _INDEX_READY:
        return True
    try:
        client = _get_client()
        if not await client.ping():
            _open_circuit("ping failed")
            await close_elasticsearch()
            return False
        name = _index_name()
        exists = await client.indices.exists(index=name)
        if not exists:
            await client.indices.create(
                index=name,
                settings=SONGS_MAPPING["settings"],
                mappings=SONGS_MAPPING["mappings"],
            )
            logger.info("Elasticsearch index %r created", name)
        _INDEX_READY = True
        _close_circuit()
        return True
    except Exception as exc:
        _open_circuit(str(exc))
        await close_elasticsearch()
        return False


async def save_song_to_elasticsearch(doc: dict[str, Any], *, refresh: bool = False) -> bool:
    if not is_elasticsearch_enabled() or not _circuit_allows_es():
        return False
    song_id = str(doc.get("id") or "").strip()
    if not song_id:
        return False
    try:
        if not await ensure_songs_index():
            return False
        client = _get_client()
        body = song_to_es_document(doc)
        await client.index(
            index=_index_name(),
            id=song_id,
            document=body,
            refresh="wait_for" if refresh else False,
        )
        return True
    except Exception as exc:
        _open_circuit(str(exc))
        await close_elasticsearch()
        return False


async def bulk_save_songs_to_elasticsearch(
    docs: list[dict[str, Any]],
    *,
    refresh: bool = False,
) -> int:
    if not is_elasticsearch_enabled() or not docs or not _circuit_allows_es():
        return 0
    try:
        if not await ensure_songs_index():
            return 0
        from elasticsearch.helpers import async_bulk

        client = _get_client()
        name = _index_name()

        async def gen():
            for doc in docs:
                sid = str(doc.get("id") or "").strip()
                if not sid:
                    continue
                yield {
                    "_index": name,
                    "_id": sid,
                    "_source": song_to_es_document(doc),
                }

        ok, errors = await async_bulk(client, gen(), raise_on_error=False)
        if errors:
            logger.warning("Elasticsearch bulk had %s errors", len(errors))
        if refresh:
            await client.indices.refresh(index=name)
        logger.info("Elasticsearch indexed %s songs (%s ok)", len(docs), ok)
        return int(ok)
    except Exception as exc:
        _open_circuit(str(exc))
        await close_elasticsearch()
        return 0


async def search_songs_elasticsearch(
    query: str,
    *,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """
    Fuzzy search — Elasticsearch when healthy, else instant local JSON catalog.
    """
    q = query.strip()
    if not q:
        return []

    if not is_elasticsearch_enabled():
        return _static_fallback_search(q, limit=limit)

    if not _circuit_allows_es():
        return _static_fallback_search(q, limit=limit)

    try:
        if not await ensure_songs_index():
            return _static_fallback_search(q, limit=limit)

        client = _get_client()
        res = await client.search(
            index=_index_name(),
            size=min(limit, 20),
            query={
                "multi_match": {
                    "query": q,
                    "fields": [
                        "title^4",
                        "artist^3",
                        "tags^2",
                        "album^2",
                        "playlist",
                        "category",
                    ],
                    "type": "best_fields",
                    "fuzziness": "AUTO",
                    "prefix_length": 1,
                    "operator": "or",
                }
            },
        )
        hits = res.get("hits", {}).get("hits") or []
        out: list[dict[str, Any]] = []
        for hit in hits:
            src = hit.get("_source") or {}
            if not src.get("title"):
                continue
            out.append(
                {
                    "id": src.get("id", hit.get("_id", "")),
                    "title": src["title"],
                    "artist": src.get("artist", ""),
                    "album": src.get("album", ""),
                    "playlist": src.get("playlist", "Search"),
                    "category": src.get("category", "Pop"),
                    "tags": list(src.get("tags") or []),
                    "era": src.get("era", "latest"),
                    "year": src.get("year", 2020),
                    "duration_sec": src.get("duration_sec", 240),
                    "thumbnail_url": src.get("thumbnail_url", ""),
                    "audio_url": src.get("audio_url", ""),
                    "audius_id": src.get("audius_id", ""),
                    "source": src.get("source", "elasticsearch"),
                    "_es_score": hit.get("_score"),
                }
            )
        if out:
            _close_circuit()
            return out
        return _static_fallback_search(q, limit=limit)
    except Exception as exc:
        _open_circuit(str(exc))
        await close_elasticsearch()
        return _static_fallback_search(q, limit=limit)


async def elasticsearch_health() -> dict[str, Any]:
    from services.songs_static_provider import static_provider_health

    static = static_provider_health()

    if not is_elasticsearch_enabled():
        return {
            "enabled": False,
            "connected": False,
            "fallback_active": True,
            "fallback": "local_json",
            "static": static,
            "search_mode": "local_json",
        }

    global _ES_LAST_PROBE
    now = time.time()
    connected = False
    err: Optional[str] = None

    if _circuit_allows_es() and (now - _ES_LAST_PROBE >= _ES_PROBE_INTERVAL or not _ES_CIRCUIT_OPEN):
        _ES_LAST_PROBE = now
        try:
            connected = await _ping_elasticsearch()
            if connected:
                _close_circuit()
        except Exception as exc:
            err = str(exc)
            _open_circuit(err)

    if connected:
        return {
            "enabled": True,
            "connected": True,
            "index": _index_name(),
            "fallback_active": False,
            "static": static,
            "search_mode": "elasticsearch",
        }

    auth = err and ("401" in err or "AuthenticationException" in err)
    return {
        "enabled": True,
        "connected": False,
        "index": _index_name(),
        "circuit_open": _ES_CIRCUIT_OPEN,
        "fallback_active": True,
        "fallback": "local_json",
        "static": static,
        "search_mode": "local_json",
        "auth_required": bool(auth),
        "error": (err or "connection refused or service stopped")[:200],
        "hint": (
            "Elasticsearch offline — OmniMusic uses backend/data/songs_static.json (instant). "
            "Start ES with docker compose up -d elasticsearch, or set ELASTICSEARCH_ENABLED=false."
        ),
    }
