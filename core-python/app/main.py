from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routes.orchestrator import router as orchestrator_router
from app.routes.providers import router as providers_router
from app.services.community_api_sync import community_sync_loop, load_cached_nodes


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_cached_nodes()
    sync_task = asyncio.create_task(community_sync_loop())
    yield
    sync_task.cancel()
    try:
        await sync_task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="OmniMind Core Python Engine", version="v11-polyglot", lifespan=lifespan)

app.include_router(orchestrator_router)
app.include_router(providers_router)


@app.get("/healthz")
async def healthz() -> dict:
    return {"ok": True, "service": "core-python", "mode": "polyglot-migration"}
