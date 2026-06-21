"""OmniTV — legal channel guide and public HLS proxy.

Only verified official YouTube embeds or explicitly public HLS streams are
listed here. No community IPTV or unauthorized rebroadcast URLs are exposed.
"""

from __future__ import annotations

import base64
import json
from pathlib import Path
from typing import Any, Optional
from urllib.parse import quote, urljoin

import httpx
from fastapi import APIRouter, HTTPException, Query, Request, Response

from services.entertainment_pipeline import schedule_entertainment_event

router = APIRouter(prefix="/api/livetv", tags=["omni-tv"])

CHANNEL_MAP_PATH = Path(__file__).resolve().parents[2] / "data" / "pakistan_iptv_channels.json"
PK_TIMEZONES = {"Asia/Karachi"}
LOCALHOSTS = {"127.0.0.1", "::1", "localhost"}
HLS_MIME = "application/vnd.apple.mpegurl"


def _load_channels() -> list[dict[str, Any]]:
    try:
        data = json.loads(CHANNEL_MAP_PATH.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return [c for c in data if isinstance(c, dict)]
    except Exception:
        pass
    return []


def _channel_by_id(channel_id: str) -> dict[str, Any] | None:
    return next((c for c in _load_channels() if c.get("id") == channel_id), None)


def _source_url(channel: dict[str, Any], source_index: int = 0) -> str:
    sources = channel.get("sources") or []
    if not sources:
        return ""
    index = min(max(source_index, 0), len(sources) - 1)
    source = sources[index]
    return str(source.get("url") or "")


def _source_referrer(channel: dict[str, Any], source_index: int = 0) -> str:
    sources = channel.get("sources") or []
    if not sources:
        return ""
    index = min(max(source_index, 0), len(sources) - 1)
    return str((sources[index] or {}).get("referrer") or "")


def _encode_url(url: str) -> str:
    return base64.urlsafe_b64encode(url.encode("utf-8")).decode("ascii").rstrip("=")


def _decode_url(token: str) -> str:
    padded = token + ("=" * (-len(token) % 4))
    return base64.urlsafe_b64decode(padded.encode("ascii")).decode("utf-8")


def _request_host(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
    return forwarded or (request.client.host if request.client else "")


def _detect_region(request: Request) -> str:
    country = (
        request.headers.get("cf-ipcountry")
        or request.headers.get("x-vercel-ip-country")
        or request.headers.get("x-country-code")
        or ""
    ).upper()
    if country in ("PK", "PAK"):
        return "pakistan"
    if _request_host(request) in LOCALHOSTS:
        return "pakistan"
    accept = (request.headers.get("accept-language") or "").lower()
    if "ur" in accept or "pk" in accept:
        return "pakistan"
    tz = request.headers.get("x-timezone") or request.headers.get("x-client-timezone") or ""
    if tz in PK_TIMEZONES or "Karachi" in tz:
        return "pakistan"
    return "international"


def _public_channel_payload(
    request: Request,
    channel: dict[str, Any],
) -> dict[str, Any]:
    channel_id = str(channel["id"])
    base = str(request.base_url).rstrip("/")
    stream_url = f"{base}/api/livetv/stream/{quote(channel_id)}/index.m3u8"
    source_count = len(channel.get("sources") or [])
    is_hls = channel.get("sourceType") == "hls" and source_count > 0
    return {
        "id": channel_id,
        "name": channel["name"],
        "category": channel["category"],
        "region": channel.get("region", "pakistan"),
        "trendingKarachi": bool(channel.get("trendingKarachi")),
        "tags": channel.get("tags", []),
        "sourceType": channel.get("sourceType", "youtube"),
        "embedUrl": channel.get("embedUrl"),
        "officialUrl": channel.get("officialUrl"),
        "verifiedLegal": bool(channel.get("verifiedLegal")),
        "m3u8Url": stream_url if is_hls else "",
        "streamUrls": [f"{stream_url}?source={i}" for i in range(source_count)] if is_hls else [],
        "sourceCount": source_count,
        "sourceRef": (channel.get("sources") or [{}])[0].get("source"),
    }


def _headers(referrer: str = "") -> dict[str, str]:
    headers = {
        "User-Agent": "OmniMind-TV/1.0 (+HLS proxy)",
        "Accept": "*/*",
    }
    if referrer:
        headers["Referer"] = referrer
    return headers


def _proxy_url(request: Request, url: str, referrer: str = "") -> str:
    base = str(request.base_url).rstrip("/")
    params = f"u={quote(_encode_url(url), safe='')}"
    if referrer:
        params += f"&r={quote(_encode_url(referrer), safe='')}"
    return f"{base}/api/livetv/proxy?{params}"


def _rewrite_playlist(text: str, *, request: Request, source_url: str, referrer: str = "") -> str:
    out: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            out.append(raw)
            continue
        absolute = urljoin(source_url, line)
        out.append(_proxy_url(request, absolute, referrer))
    return "\n".join(out) + "\n"


async def _fetch_upstream(url: str, *, referrer: str = "") -> httpx.Response:
    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
        return await client.get(url, headers=_headers(referrer))


@router.get("/health")
async def livetv_health():
    return {
        "service": "omni-tv",
        "status": "ready",
        "version": "V11",
        "catalog": "legal_live_channels",
    }


@router.get("/geo")
async def livetv_geo(request: Request):
    region = _detect_region(request)
    return {
        "success": True,
        "region": region,
        "label": "Pakistan" if region == "pakistan" else "International",
        "client_host": _request_host(request),
    }


@router.get("/channels")
async def list_channels(request: Request, region: Optional[str] = None):
    active = (region or _detect_region(request)).lower()
    channels = [c for c in _load_channels() if c.get("verifiedLegal") is True]
    ordered = sorted(channels, key=lambda c: (not c.get("trendingKarachi"), c["name"]))
    public = [_public_channel_payload(request, c) for c in ordered]
    return {"success": True, "region": active, "channels": public, "count": len(public)}


@router.get("/stream/{channel_id}/index.m3u8")
async def channel_stream(
    request: Request,
    channel_id: str,
    source: int = Query(default=0, ge=0),
) -> Response:
    channel = _channel_by_id(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Unknown channel")

    sources = channel.get("sources") or []
    if not sources:
        raise HTTPException(status_code=404, detail="No stream sources configured")

    attempts = list(range(min(source, len(sources) - 1), len(sources))) + list(range(0, min(source, len(sources) - 1)))
    last_error = "stream unavailable"
    for index in attempts:
        url = _source_url(channel, index)
        referrer = _source_referrer(channel, index)
        if not url:
            continue
        try:
            upstream = await _fetch_upstream(url, referrer=referrer)
            if upstream.status_code >= 400:
                last_error = f"{upstream.status_code} from upstream"
                continue
            text = upstream.text
            if "#EXTM3U" not in text[:200]:
                last_error = "upstream did not return an HLS playlist"
                continue
            rewritten = _rewrite_playlist(
                text,
                request=request,
                source_url=url,
                referrer=referrer,
            )
            schedule_entertainment_event(
                "omnitv",
                "live_play",
                payload={"channel_id": channel_id, "name": channel.get("name"), "source_index": index},
            )
            return Response(
                rewritten,
                media_type=HLS_MIME,
                headers={
                    "Cache-Control": "no-store",
                    "X-OmniTV-Channel": str(channel["name"]),
                    "X-OmniTV-Source": str((sources[index] or {}).get("source", "")),
                },
            )
        except Exception as exc:
            last_error = str(exc)

    raise HTTPException(status_code=502, detail=f"{channel['name']} source unavailable: {last_error}")


@router.get("/proxy")
async def proxy_hls_asset(request: Request, u: str, r: str = "") -> Response:
    try:
        url = _decode_url(u)
        referrer = _decode_url(r) if r else ""
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid stream token") from exc

    upstream = await _fetch_upstream(url, referrer=referrer)
    if upstream.status_code >= 400:
        raise HTTPException(status_code=upstream.status_code, detail="Upstream asset unavailable")

    content_type = upstream.headers.get("content-type", "")
    body = upstream.content
    text_head = body[:200].decode("utf-8", errors="ignore")
    if "mpegurl" in content_type.lower() or "#EXTM3U" in text_head:
        rewritten = _rewrite_playlist(
            body.decode("utf-8", errors="ignore"),
            request=request,
            source_url=url,
            referrer=referrer,
        )
        return Response(rewritten, media_type=HLS_MIME, headers={"Cache-Control": "no-store"})

    return Response(
        body,
        media_type=content_type or "application/octet-stream",
        headers={"Cache-Control": "no-store"},
    )
