"""Aggregate router for all 11 sovereign core tool endpoints."""

from fastapi import APIRouter

from routers.core_tools.analytics import router as analytics_router
from routers.core_tools.architect import router as architect_router
from routers.core_tools.builder import router as builder_router
from routers.core_tools.business import router as business_router
from routers.core_tools.marketing import router as marketing_router
from routers.core_tools.medical import router as medical_router
from routers.core_tools.media import router as media_router
from routers.core_tools.science import router as science_router
from routers.core_tools.trading import router as trading_router
from routers.core_tools.vfx import router as vfx_router

core_tools_router = APIRouter(tags=["core-tools"])

for r in (
    builder_router,
    architect_router,
    business_router,
    medical_router,
    trading_router,
    media_router,
    analytics_router,
    vfx_router,
    science_router,
    marketing_router,
):
    core_tools_router.include_router(r)
