from __future__ import annotations

from fastapi import APIRouter, Header
from pydantic import BaseModel, Field

from app.services.community_api_sync import sync_community_directory, sync_status
from app.services.provider_router import generate_with_fallback, provider_status

router = APIRouter(prefix="/api/v1/providers", tags=["providers"])


class ProviderChatBody(BaseModel):
    message: str = Field(..., min_length=1, max_length=32000)
    history: list[dict[str, str]] = Field(default_factory=list)
    system_prompt: str = ""
    free_only: bool = False
    coding: bool = False


@router.get("/status")
async def providers_status() -> dict:
    return await provider_status()


@router.get("/community/sync-status")
async def community_sync_status() -> dict:
    return sync_status()


@router.post("/community/sync")
async def community_sync_now() -> dict:
    return await sync_community_directory(force=True)


@router.post("/chat")
async def providers_chat(
    body: ProviderChatBody,
    x_omniforge_free_pipeline: str | None = Header(default=None, alias="X-OmniForge-Free-Pipeline"),
) -> dict:
    free_only = body.free_only or (x_omniforge_free_pipeline or "").strip().lower() in ("1", "true", "yes")
    return await generate_with_fallback(
        body.message,
        history=body.history,
        system_prompt=body.system_prompt,
        free_only=free_only,
        coding=body.coding,
    )


@router.post("/chat/free")
async def providers_chat_free(body: ProviderChatBody) -> dict:
    return await generate_with_fallback(
        body.message,
        history=body.history,
        system_prompt=body.system_prompt,
        free_only=True,
        coding=body.coding,
    )
