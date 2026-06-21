"""
OmniStream Live — FastAPI routes for live streaming (HLS).

Endpoints (prefix /api/live):
  GET /channels                       -> live channel catalog
  GET /{channel_id}/master.m3u8       -> master playlist (proxy rewrite OR ffmpeg ABR)
  GET /{channel_id}/proxy             -> proxied upstream asset (sub-playlist / .ts), streamed
  GET /{channel_id}/hls/{filename}    -> transcoded HLS file from the ffmpeg workdir
  GET /{channel_id}/stats             -> viewer count + live/mode info (also a heartbeat)

Design notes:
  * Segments are streamed chunk-by-chunk (httpx.stream / FileResponse) — never
    buffered whole, so prolonged live sessions don't leak memory.
  * One upstream/ffmpeg process is fanned out to many viewers.
  * Optional access token gate via OMNISTREAM_LIVE_TOKEN.
"""

from __future__ import annotations

import base64
import os
from pathlib import Path
from typing import AsyncIterator, Optional
from urllib.parse import quote, urljoin

import httpx
from fastapi import APIRouter, HTTPException, Query, Request, Response
from fastapi.responses import FileResponse, StreamingResponse

from services import live_stream as live

router = APIRouter(prefix="/api/live", tags=["omnistream-live"])

HLS_MIME = "application/vnd.apple.mpegurl"
SECURITY_HEADERS = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "cross-origin",
}


def _enc(url: str) -> str:
    return base64.urlsafe_b64encode(url.encode("utf-8")).decode("ascii").rstrip("=")


def _dec(token: str) -> str:
    padded = token + ("=" * (-len(token) % 4))
    return base64.urlsafe_b64decode(padded.encode("ascii")).decode("utf-8")


def _validate_access(request: Request) -> None:
    """Optional permission gate. Enable by setting OMNISTREAM_LIVE_TOKEN."""
    required = os.getenv("OMNISTREAM_LIVE_TOKEN")
    if not required:
        return
    provided = request.headers.get("x-live-key") or request.query_params.get("key")
    if provided != required:
        raise HTTPException(status_code=403, detail="Live access denied")


def _client_token(request: Request) -> str:
    token = request.query_params.get("token")
    if token:
        return token[:64]
    host = request.client.host if request.client else "anon"
    return f"{host}:{request.headers.get('user-agent', '')[:24]}"


def _proxy_asset_url(request: Request, channel_id: str, absolute_url: str, referrer: str) -> str:
    base = str(request.base_url).rstrip("/")
    params = f"u={quote(_enc(absolute_url), safe='')}"
    if referrer:
        params += f"&r={quote(_enc(referrer), safe='')}"
    return f"{base}/api/live/{quote(channel_id)}/proxy?{params}"


def _rewrite_proxy_playlist(text: str, *, request: Request, channel_id: str, source_url: str, referrer: str) -> str:
    out: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            out.append(raw)
            continue
        if line.startswith("#"):
            # Rewrite EXT-X-KEY / MEDIA URI="..." attributes too.
            if 'URI="' in line:
                prefix, _, rest = line.partition('URI="')
                inner, _, suffix = rest.partition('"')
                absolute = urljoin(source_url, inner)
                proxied = _proxy_asset_url(request, channel_id, absolute, referrer)
                line = f'{prefix}URI="{proxied}"{suffix}'
            out.append(line)
            continue
        absolute = urljoin(source_url, line)
        out.append(_proxy_asset_url(request, channel_id, absolute, referrer))
    return "\n".join(out) + "\n"


def _rewrite_local_playlist(text: str, *, request: Request, channel_id: str) -> str:
    base = str(request.base_url).rstrip("/")
    out: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            out.append(raw)
            continue
        # local ffmpeg outputs are plain filenames (v0.m3u8 / v0_seg3.ts)
        out.append(f"{base}/api/live/{quote(channel_id)}/hls/{quote(line)}")
    return "\n".join(out) + "\n"


@router.get("/channels")
async def live_channels(request: Request):
    channels = []
    base = str(request.base_url).rstrip("/")
    for ch in live.list_channels():
        channels.append(
            {
                "id": ch.id,
                "name": ch.name,
                "category": ch.category,
                "mode": ch.mode,
                "isLive": ch.is_live,
                "poster": ch.poster,
                "playlistUrl": f"{base}/api/live/{quote(ch.id)}/master.m3u8",
                "statsUrl": f"{base}/api/live/{quote(ch.id)}/stats",
            }
        )
    return {
        "channels": channels,
        "count": len(channels),
        "ffmpeg": live.transcoder.ffmpeg_available,
    }


@router.get("/{channel_id}/master.m3u8")
async def master_playlist(request: Request, channel_id: str) -> Response:
    _validate_access(request)
    channel = live.get_channel(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Unknown live channel")

    await live.viewers.heartbeat(channel_id, _client_token(request))

    if channel.mode == "transcode":
        if not live.transcoder.ffmpeg_available:
            raise HTTPException(status_code=503, detail="ffmpeg not available for transcoding")
        session = await live.transcoder.ensure(channel)
        if not session or not session.master_path.exists():
            raise HTTPException(status_code=503, detail="Live transcode is starting, retry shortly")
        text = session.master_path.read_text(encoding="utf-8", errors="ignore")
        rewritten = _rewrite_local_playlist(text, request=request, channel_id=channel_id)
        return Response(rewritten, media_type=HLS_MIME, headers=dict(SECURITY_HEADERS))

    # proxy mode
    if not channel.source:
        raise HTTPException(status_code=404, detail="No live source configured")
    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            upstream = await client.get(channel.source, headers=_upstream_headers(channel.referrer))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Live source unreachable: {exc}") from exc
    if upstream.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Live source error {upstream.status_code}")
    text = upstream.text
    if "#EXTM3U" not in text[:256]:
        raise HTTPException(status_code=502, detail="Live source is not an HLS playlist")
    rewritten = _rewrite_proxy_playlist(
        text, request=request, channel_id=channel_id, source_url=channel.source, referrer=channel.referrer
    )
    return Response(rewritten, media_type=HLS_MIME, headers=dict(SECURITY_HEADERS))


def _upstream_headers(referrer: str = "") -> dict[str, str]:
    headers = {"User-Agent": "OmniStream-Live/1.0", "Accept": "*/*"}
    if referrer:
        headers["Referer"] = referrer
    return headers


@router.get("/{channel_id}/proxy")
async def proxy_asset(request: Request, channel_id: str, u: str, r: str = "") -> Response:
    _validate_access(request)
    channel = live.get_channel(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Unknown live channel")
    try:
        url = _dec(u)
        referrer = _dec(r) if r else channel.referrer
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid asset token") from exc

    headers = _upstream_headers(referrer)
    # Forward Range so the player can seek within the live buffer if supported.
    if (rng := request.headers.get("range")):
        headers["Range"] = rng

    client = httpx.AsyncClient(timeout=20.0, follow_redirects=True)
    try:
        req = client.build_request("GET", url, headers=headers)
        upstream = await client.send(req, stream=True)
    except Exception as exc:
        await client.aclose()
        raise HTTPException(status_code=502, detail=f"Upstream asset error: {exc}") from exc

    if upstream.status_code >= 400:
        status = upstream.status_code
        await upstream.aclose()
        await client.aclose()
        raise HTTPException(status_code=status, detail="Upstream asset unavailable")

    content_type = upstream.headers.get("content-type", "")
    # Playlists must be rewritten, so buffer those (small text files only).
    if "mpegurl" in content_type.lower() or url.endswith(".m3u8"):
        body = await upstream.aread()
        await upstream.aclose()
        await client.aclose()
        rewritten = _rewrite_proxy_playlist(
            body.decode("utf-8", errors="ignore"),
            request=request,
            channel_id=channel_id,
            source_url=url,
            referrer=referrer,
        )
        return Response(rewritten, media_type=HLS_MIME, headers=dict(SECURITY_HEADERS))

    async def _stream() -> AsyncIterator[bytes]:
        try:
            async for chunk in upstream.aiter_bytes(chunk_size=64 * 1024):
                yield chunk
        finally:
            await upstream.aclose()
            await client.aclose()

    resp_headers = dict(SECURITY_HEADERS)
    for h in ("content-length", "content-range", "accept-ranges"):
        if h in upstream.headers:
            resp_headers[h.title()] = upstream.headers[h]
    return StreamingResponse(
        _stream(),
        status_code=upstream.status_code,
        media_type=content_type or "video/mp2t",
        headers=resp_headers,
    )


@router.get("/{channel_id}/hls/{filename}")
async def transcoded_file(request: Request, channel_id: str, filename: str) -> Response:
    _validate_access(request)
    channel = live.get_channel(channel_id)
    if not channel or channel.mode != "transcode":
        raise HTTPException(status_code=404, detail="No transcode session for channel")
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid segment name")
    if not (filename.endswith(".m3u8") or filename.endswith(".ts")):
        raise HTTPException(status_code=400, detail="Unsupported asset")

    session = await live.transcoder.get(channel_id)
    if not session:
        raise HTTPException(status_code=503, detail="Live transcode not running")
    path = Path(session.workdir) / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Segment not found")

    if filename.endswith(".m3u8"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        rewritten = _rewrite_local_playlist(text, request=request, channel_id=channel_id)
        return Response(rewritten, media_type=HLS_MIME, headers=dict(SECURITY_HEADERS))

    return FileResponse(
        path,
        media_type="video/mp2t",
        headers=dict(SECURITY_HEADERS),
    )


@router.get("/{channel_id}/stats")
async def live_stats(request: Request, channel_id: str, token: Optional[str] = Query(default=None)):
    channel = live.get_channel(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Unknown live channel")
    await live.viewers.heartbeat(channel_id, token or _client_token(request))
    return {
        "channelId": channel_id,
        "viewers": await live.viewers.count(channel_id),
        "isLive": channel.is_live,
        "mode": channel.mode,
    }
