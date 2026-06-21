"""Authorized OmniMind V11 sovereign tool enum — single-instance registry."""

from __future__ import annotations

from enum import Enum


class SovereignToolId(str, Enum):
    """Exactly 11 authorized workbench tools."""

    OMNIFORGE_ENGINE = "omniforge-engine"
    APP_BUILDER = "app-builder"
    GAME_DEV = "game-dev"
    BUSINESS_SITE_MAKER = "business-site-maker"
    ARCHITECTURAL_DESIGNER = "architectural-designer"
    NASA_SOLVER = "nasa-solver"
    MEDICAL_DIAGNOSTIC = "medical-diagnostic"
    QUANTUM_TRADING = "quantum-trading"
    BUSINESS_ANALYTICS = "business-analytics"
    CREATIVE_VISIONARY = "creative-visionary"
    VFX_MASTER = "vfx-master"
    DIGITAL_MARKETING_HUB = "digital-marketing-hub"


AUTHORIZED_TOOL_IDS: frozenset[str] = frozenset(t.value for t in SovereignToolId)

TOOL_MODULE_MAP: dict[str, str] = {
    SovereignToolId.OMNIFORGE_ENGINE.value: "builder",
    SovereignToolId.APP_BUILDER.value: "builder",
    SovereignToolId.GAME_DEV.value: "builder",
    SovereignToolId.BUSINESS_SITE_MAKER.value: "builder",
    SovereignToolId.ARCHITECTURAL_DESIGNER.value: "architect",
    SovereignToolId.NASA_SOLVER.value: "science",
    SovereignToolId.MEDICAL_DIAGNOSTIC.value: "medical",
    SovereignToolId.QUANTUM_TRADING.value: "trading",
    SovereignToolId.BUSINESS_ANALYTICS.value: "analytics",
    SovereignToolId.CREATIVE_VISIONARY.value: "media",
    SovereignToolId.VFX_MASTER.value: "vfx",
    SovereignToolId.DIGITAL_MARKETING_HUB.value: "marketing",
}

BUILDER_TOOL_IDS: frozenset[str] = frozenset(
    {
        SovereignToolId.OMNIFORGE_ENGINE.value,
        SovereignToolId.APP_BUILDER.value,
        SovereignToolId.GAME_DEV.value,
        SovereignToolId.BUSINESS_SITE_MAKER.value,
    }
)
