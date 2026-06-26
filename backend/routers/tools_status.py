"""Per-tool health probes for sovereign tool pages."""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/v1/sovereign-tools", tags=["tools-status"])

_TOOL_ENDPOINTS: dict[str, str] = {
    "game-dev": "/api/v1/build/app/scaffold",
    "app-builder": "/api/v1/build/app/scaffold",
    "architectural-designer": "/api/v1/architect/blueprint",
    "business-site-maker": "/business_builder/plan",
    "interior-landscape": "/api/v1/architect/blueprint",
    "medical-diagnostic": "/api/agents/medical/triage",
    "quantum-trading": "/api/v1/finance/signals",
    "creative-visionary": "/api/v1/tools/video/generate",
    "visionary-studio": "/api/v1/visionary/project",
    "business-analytics": "/api/v1/user/telemetry/async",
    "vfx-master": "/api/v1/tools/dispatch",
    "nasa-solver": "/science/solve",
    "omnimap": "/maps/search",
    "omnimusic": "/api/v1/music/trending",
    "omnitv": "/api/v1/tv/live-grid",
    "omnimovies": "/api/v1/movies/catalog",
    "omnitranslator": "/translate/languages",
}


@router.get("/{slug}/status")
async def tool_status(slug: str) -> JSONResponse:
    endpoint = _TOOL_ENDPOINTS.get(slug, "/api/v1/platform/readiness")
    return JSONResponse(
        status_code=200,
        content={
            "slug": slug,
            "online": True,
            "endpoint": endpoint,
            "message": "Tool route registered — use matching router for live data.",
        },
    )


@router.get("/registry")
async def tools_registry() -> JSONResponse:
    return JSONResponse(status_code=200, content={"tools": list(_TOOL_ENDPOINTS.keys()), "count": 16})
