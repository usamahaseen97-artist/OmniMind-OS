"""
OmniStream — MongoDB-backed movie catalog + HTTP Range video streaming.

Design goals (Netflix-like, memory-safe):
  * Never load a whole video into memory — stream in 1 MB chunks via seek/read.
  * Honour the browser Range header and answer 206 Partial Content so the
    HTML5 <video> element can seek/scrub instantly.
  * Store ONLY metadata in MongoDB; the actual files live on local disk.
  * Degrade gracefully: if MongoDB isn't configured, auto-scan the media folder
    so the feature is operational out of the box.

Endpoints (prefix /api/v1):
  GET  /movies            -> list catalog (Mongo, else disk scan)
  GET  /movies/{id}       -> single movie metadata
  POST /movies            -> insert/update a movie document
  POST /movies/scan       -> (re)scan the media directory into the catalog
  GET  /stream/{movie_id} -> Range streaming of the movie's local file
"""

from __future__ import annotations

import logging
import mimetypes
import os
import re
import time
from pathlib import Path
from typing import Annotated, Iterator, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, model_validator

from services.mongo_async import get_async_database
from services.entertainment_pipeline import schedule_entertainment_event
from services.omnistream_catalog import FEATURED_CATALOG

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["omnistream"])

CHUNK_SIZE = 1024 * 1024  # 1 MB chunks — memory-safe streaming
MOVIES_COLLECTION = "movies"
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mkv", ".mov", ".m4v", ".ogg"}

# Short-lived cache for the disk-scan fallback so we don't stat the FS per request.
_disk_cache: dict[str, object] = {"at": 0.0, "items": []}
_DISK_TTL = 30.0

# In-memory store used when MongoDB is not configured (POST /movies).
_memory_movies: dict[str, "Movie"] = {}


class Movie(BaseModel):
    id: str
    title: str
    description: str = ""
    category: str = "Uncategorized"
    thumbnail_url: str = ""
    video_path: str = Field(default="", description="Absolute or media-root-relative local disk path")
    stream_url: str = Field(default="", description="Remote HLS/MP4 URL (overrides local file)")
    stream_kind: str = Field(default="", description="'hls' or 'file' — inferred when blank")
    rating: Optional[float] = None
    duration: Optional[int] = None
    release_year: Optional[int] = None


class MovieCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    video_path: str = Field(default="", max_length=1024)
    stream_url: str = Field(default="", max_length=2048)
    stream_kind: str = Field(default="", max_length=8)
    description: str = Field(default="", max_length=4000)
    category: str = Field(default="Uncategorized", max_length=120)
    thumbnail_url: str = Field(default="", max_length=2048)
    duration: Optional[int] = Field(default=None, ge=0)
    release_year: Optional[int] = Field(default=None, ge=1880, le=2200)

    @model_validator(mode="after")
    def _require_source(self) -> "MovieCreate":
        if not self.video_path and not self.stream_url:
            raise ValueError("Provide either video_path (local) or stream_url (remote)")
        return self


def _media_root() -> Path:
    raw = os.getenv("OMNISTREAM_MEDIA_DIR") or str(
        Path(__file__).resolve().parents[2] / "media"
    )
    return Path(raw).resolve()


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "untitled"


def _resolve_media_path(video_path: str) -> Optional[Path]:
    """Resolve a movie's video_path safely. Relative paths must stay inside media root."""
    if not video_path:
        return None
    raw = Path(video_path)
    root = _media_root()
    candidate = (raw if raw.is_absolute() else root / raw).resolve()
    if not raw.is_absolute():
        try:
            candidate.relative_to(root)
        except ValueError:
            logger.warning("Rejected traversal path: %s", video_path)
            return None
    return candidate


def _movie_from_doc(doc: dict) -> Optional[Movie]:
    try:
        movie_id = str(doc.get("id") or doc.get("_id") or "")
        video_path = str(doc.get("video_path") or "")
        stream_url = str(doc.get("stream_url") or "")
        if not movie_id or (not video_path and not stream_url):
            return None
        return Movie(
            id=movie_id,
            title=str(doc.get("title") or movie_id),
            description=str(doc.get("description") or ""),
            category=str(doc.get("category") or "Uncategorized"),
            thumbnail_url=str(doc.get("thumbnail_url") or ""),
            video_path=video_path,
            stream_url=stream_url,
            stream_kind=str(doc.get("stream_kind") or ""),
            rating=doc.get("rating"),
            duration=doc.get("duration"),
            release_year=doc.get("release_year"),
        )
    except Exception:
        return None


def _featured_movies() -> list[Movie]:
    out: list[Movie] = []
    for row in FEATURED_CATALOG:
        movie = _movie_from_doc(row)
        if movie:
            out.append(movie)
    return out


def _scan_disk() -> list[Movie]:
    """Build a catalog from video files on disk (zero-config fallback)."""
    now = time.time()
    if now - float(_disk_cache["at"]) < _DISK_TTL and _disk_cache["items"]:
        return list(_disk_cache["items"])  # type: ignore[arg-type]

    root = _media_root()
    items: list[Movie] = []
    if root.is_dir():
        for path in sorted(root.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in VIDEO_EXTENSIONS:
                continue
            rel = path.relative_to(root)
            stem = path.stem.replace("_", " ").replace(".", " ").strip()
            category = rel.parts[0] if len(rel.parts) > 1 else "Movies"
            items.append(
                Movie(
                    id=_slugify(str(rel.with_suffix(""))),
                    title=stem.title(),
                    description=f"Local file · {rel.as_posix()}",
                    category=category.title(),
                    video_path=rel.as_posix(),
                )
            )

    _disk_cache["at"] = now
    _disk_cache["items"] = items
    return list(items)


async def _all_movies() -> tuple[list[Movie], str]:
    """Return (movies, source). Mongo first, then in-memory inserts, then disk scan."""
    db = await get_async_database()
    if db is not None:
        try:
            docs = await db[MOVIES_COLLECTION].find({}).to_list(length=1000)
            movies = [m for m in (_movie_from_doc(d) for d in docs) if m]
            if movies:
                return movies, "mongodb"
        except Exception as exc:
            logger.warning("Mongo movies query failed, using disk scan: %s", exc)

    if _memory_movies:
        return list(_memory_movies.values()), "memory"

    # Out-of-the-box: premium featured catalog + any local files.
    return _featured_movies() + _scan_disk(), "featured"


async def _find_movie(movie_id: str) -> Optional[Movie]:
    db = await get_async_database()
    if db is not None:
        try:
            doc = await db[MOVIES_COLLECTION].find_one({"id": movie_id})
            if doc:
                return _movie_from_doc(doc)
        except Exception as exc:
            logger.warning("Mongo find_one failed: %s", exc)

    if movie_id in _memory_movies:
        return _memory_movies[movie_id]

    for movie in _featured_movies() + _scan_disk():
        if movie.id == movie_id:
            return movie
    return None


def _stream_kind(movie: Movie) -> str:
    if movie.stream_kind:
        return movie.stream_kind
    url = movie.stream_url or movie.video_path
    return "hls" if url.lower().endswith(".m3u8") else "file"


def _public_movie(movie: Movie) -> dict:
    # Remote sources (HLS/MP4) are played directly; local files go through the
    # Range-streaming endpoint.
    stream_url = movie.stream_url or f"/api/v1/stream/{movie.id}"
    return {
        "id": movie.id,
        "title": movie.title,
        "description": movie.description,
        "category": movie.category,
        "thumbnail_url": movie.thumbnail_url,
        "duration": movie.duration,
        "release_year": movie.release_year,
        "stream_url": stream_url,
        "stream_kind": _stream_kind(movie),
        "rating": movie.rating,
    }


@router.get("/movies")
async def list_movies(
    q: Annotated[Optional[str], Query(max_length=200)] = None,
    category: Annotated[Optional[str], Query(max_length=120)] = None,
):
    movies, source = await _all_movies()
    query = (q or "").strip().lower()
    cat = (category or "").strip().lower()

    def matches(movie: Movie) -> bool:
        if cat and movie.category.lower() != cat:
            return False
        if not query:
            return True
        haystack = f"{movie.title} {movie.description} {movie.category}".lower()
        return query in haystack

    filtered = [m for m in movies if matches(m)]
    schedule_entertainment_event(
        "omnistream",
        "list_movies",
        payload={"q": query, "category": cat, "count": len(filtered)},
    )
    return {
        "source": source,
        "count": len(filtered),
        "movies": [_public_movie(m) for m in filtered],
    }


@router.get("/movies/{movie_id}")
async def get_movie(movie_id: str):
    movie = await _find_movie(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return _public_movie(movie)


@router.post("/movies", status_code=201)
async def create_movie(body: MovieCreate):
    movie = Movie(id=_slugify(body.title), **body.model_dump())
    db = await get_async_database()
    if db is not None:
        try:
            await db[MOVIES_COLLECTION].update_one(
                {"id": movie.id}, {"$set": movie.model_dump()}, upsert=True
            )
            return {"stored": "mongodb", "movie": _public_movie(movie)}
        except Exception as exc:
            logger.warning("Mongo upsert failed, storing in memory: %s", exc)

    _memory_movies[movie.id] = movie
    return {"stored": "memory", "movie": _public_movie(movie)}


@router.post("/movies/scan")
async def scan_library():
    """(Re)scan the media directory and upsert discovered files into the catalog."""
    _disk_cache["at"] = 0.0  # force refresh
    found = _scan_disk()
    db = await get_async_database()
    if db is not None:
        try:
            for movie in found:
                await db[MOVIES_COLLECTION].update_one(
                    {"id": movie.id}, {"$set": movie.model_dump()}, upsert=True
                )
            return {"scanned": len(found), "stored": "mongodb", "media_root": str(_media_root())}
        except Exception as exc:
            logger.warning("Mongo scan upsert failed: %s", exc)

    for movie in found:
        _memory_movies[movie.id] = movie
    return {"scanned": len(found), "stored": "memory", "media_root": str(_media_root())}


@router.post("/movies/seed")
async def seed_featured(replace: Annotated[bool, Query()] = True):
    """Seed/refresh the premium featured catalog into MongoDB.

    With ``replace=true`` (default) it clears the collection first for a clean
    refresh, then inserts the current catalog. Set ``replace=false`` to keep
    existing documents and only upsert the catalog by id.
    """
    featured = _featured_movies()
    db = await get_async_database()
    if db is not None:
        try:
            if replace:
                await db[MOVIES_COLLECTION].delete_many({})
                if featured:
                    await db[MOVIES_COLLECTION].insert_many(
                        [{**m.model_dump(), "featured": True} for m in featured]
                    )
            else:
                for movie in featured:
                    await db[MOVIES_COLLECTION].update_one(
                        {"id": movie.id},
                        {"$set": {**movie.model_dump(), "featured": True}},
                        upsert=True,
                    )
            schedule_entertainment_event(
                "omnistream",
                "seed",
                payload={"seeded": len(featured), "replaced": replace, "stored": "mongodb"},
            )
            return {"seeded": len(featured), "stored": "mongodb", "replaced": replace}
        except Exception as exc:
            logger.warning("Mongo seed failed, storing in memory: %s", exc)


    if replace:
        _memory_movies.clear()
    for movie in featured:
        _memory_movies[movie.id] = movie
    schedule_entertainment_event(
        "omnistream",
        "seed",
        payload={"seeded": len(featured), "replaced": replace},
    )
    return {"seeded": len(featured), "stored": "memory", "replaced": replace}


def _parse_range(range_header: str, file_size: int) -> tuple[int, int]:
    """Parse 'bytes=start-end' -> (start, end) clamped to file size."""
    start, end = 0, file_size - 1
    units, _, rng = range_header.partition("=")
    if units.strip().lower() != "bytes":
        return start, end
    start_s, _, end_s = rng.partition("-")
    if start_s.strip():
        start = int(start_s)
    if end_s.strip():
        end = int(end_s)
    if start_s.strip() == "" and end_s.strip():
        # suffix range: bytes=-N (last N bytes)
        length = int(end_s)
        start = max(file_size - length, 0)
        end = file_size - 1
    end = min(end, file_size - 1)
    return start, end


def _file_chunks(path: Path, start: int, end: int) -> Iterator[bytes]:
    """Yield 1 MB chunks of [start, end] using seek/read — never loads the whole file."""
    remaining = end - start + 1
    with open(path, "rb") as handle:
        handle.seek(start)
        while remaining > 0:
            chunk = handle.read(min(CHUNK_SIZE, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk


@router.get("/stream/{movie_id}")
async def stream_movie(movie_id: str, request: Request):
    movie = await _find_movie(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    schedule_entertainment_event(
        "omnistream",
        "play",
        payload={"movie_id": movie_id, "title": movie.title, "range": bool(request.headers.get("range"))},
    )

    path = _resolve_media_path(movie.video_path)
    if path is None or not path.is_file():
        raise HTTPException(status_code=404, detail="Video file not found on host")

    file_size = path.stat().st_size
    content_type = mimetypes.guess_type(str(path))[0] or "video/mp4"
    range_header = request.headers.get("range")

    headers = {
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
        "Content-Disposition": "inline",
    }

    if range_header:
        try:
            start, end = _parse_range(range_header, file_size)
        except (ValueError, TypeError):
            start, end = 0, file_size - 1
        if start > end or start >= file_size:
            raise HTTPException(
                status_code=416,
                detail="Requested range not satisfiable",
                headers={"Content-Range": f"bytes */{file_size}"},
            )
        headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"
        headers["Content-Length"] = str(end - start + 1)
        return StreamingResponse(
            _file_chunks(path, start, end),
            status_code=206,
            media_type=content_type,
            headers=headers,
        )

    headers["Content-Length"] = str(file_size)
    return StreamingResponse(
        _file_chunks(path, 0, file_size - 1),
        status_code=200,
        media_type=content_type,
        headers=headers,
    )
