"""OmniMind V11 entertainment routers — music, media, live TV."""

from routers.entertainment.live import router as live_router
from routers.entertainment.livetv import router as livetv_router
from routers.entertainment.media import router as media_router
from routers.entertainment.music import router as music_router
from routers.entertainment.stream import router as stream_router

__all__ = [
    "music_router",
    "media_router",
    "livetv_router",
    "stream_router",
    "live_router",
]
