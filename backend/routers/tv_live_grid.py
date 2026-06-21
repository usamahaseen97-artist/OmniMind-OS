"""
OmniTV — high-speed live grids (News, Football, Cricket) with multi-bitrate HLS.
"""

from __future__ import annotations

from typing import Annotated, Any, Optional

from fastapi import APIRouter, Query

from services.kafka_pipeline import ingest, schedule_telemetry
from services.kafka_pipeline import TelemetryEvent

router = APIRouter(prefix="/api/v1/tv", tags=["omnitv-bigdata"])

# Public demo HLS ladders (multi-bitrate master playlists)
_LIVE_FEEDS: list[dict[str, Any]] = [
    {
        "id": "live-intl-news",
        "title": "International News 24/7",
        "category": "Live News",
        "genre": "news",
        "description": "Global newsroom feed — adaptive HLS ladder.",
        "master_url": "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
        "bitrates": ["1080p", "720p", "480p", "360p"],
        "is_live": True,
        "poster": "https://picsum.photos/seed/omni-news/640/360",
    },
    {
        "id": "live-football-hd",
        "title": "Live Football HD",
        "category": "Live Sports",
        "genre": "football",
        "description": "Sports arena stream — low-latency adaptive delivery.",
        "master_url": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        "bitrates": ["1080p", "720p", "480p"],
        "is_live": True,
        "poster": "https://picsum.photos/seed/omni-football/640/360",
    },
    {
        "id": "live-cricket-premium",
        "title": "Live Cricket Premium",
        "category": "Live Sports",
        "genre": "cricket",
        "description": "Cricket coverage simulation — multi-bitrate HLS.",
        "master_url": "https://test-streams.mux.dev/pts_shift/master.m3u8",
        "bitrates": ["720p", "480p", "360p"],
        "is_live": True,
        "poster": "https://picsum.photos/seed/omni-cricket/640/360",
    },
    {
        "id": "live-sports-emerald",
        "title": "World Sports Live",
        "category": "Live Sports",
        "genre": "sports",
        "description": "Continuous sports highlights channel.",
        "master_url": "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
        "bitrates": ["1080p", "720p"],
        "is_live": True,
        "poster": "https://picsum.photos/seed/omni-sports/640/360",
    },
]


@router.get("/live-grid")
async def live_grid(
    user_id: Annotated[str, Query(max_length=120)] = "anonymous",
    category: Annotated[Optional[str], Query(max_length=80)] = None,
):
    feeds = _LIVE_FEEDS
    if category:
        cat = category.strip().lower()
        feeds = [f for f in feeds if cat in f.get("category", "").lower() or cat in f.get("genre", "")]
    schedule_telemetry(
        TelemetryEvent(
            user_id=user_id,
            content_id="live-grid",
            genre="live",
            playback_status="view",
            domain="tv",
            title="OmniTV Live Grid",
        )
    )
    return {
        "feeds": feeds,
        "count": len(feeds),
        "delivery": "multi-bitrate-hls",
        "kafka_topic": "tv-events",
    }


@router.post("/event")
async def tv_event(
    user_id: str = "anonymous",
    content_id: str = "",
    genre: str = "live",
    playback_status: str = "play",
    network_bitrate: float = 0.0,
    packet_loss_ratio: float = 0.0,
    title: str = "",
):
    result = await ingest(
        domain="tv",
        user_id=user_id,
        content_id=content_id,
        genre=genre,
        playback_status=playback_status,  # type: ignore
        network_bitrate=network_bitrate,
        packet_loss_ratio=packet_loss_ratio,
        title=title,
    )
    return {"ok": True, **result}
