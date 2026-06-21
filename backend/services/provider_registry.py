"""
Provider registry — maps OmniMind tools to executors using keys from api_keys (Settings/.env).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

from services.api_keys import get_key, is_configured_key, key_active, openai_cloud_key, groq_key, openrouter_key
from services.lm_auth import resolve_lm_api_key

# Re-export for other modules
env_key_active = key_active


@dataclass(frozen=True)
class ProviderSlot:
    provider_id: str
    label: str
    env_keys: tuple[str, ...] = ()
    requires_key: bool = True


CHAT_PROVIDERS: tuple[ProviderSlot, ...] = (
    ProviderSlot("gemini", "Google Gemini", ("GEMINI_API_KEY",)),
    ProviderSlot("lm_studio", "LM Studio (local)", ("LOCAL_LLM_API_KEY",), False),
    ProviderSlot("groq", "Groq LLM (GROK_API_KEY)", ("GROK_API_KEY",)),
    ProviderSlot("openrouter", "OpenRouter (HUNYUAN_API_KEY)", ("HUNYUAN_API_KEY", "OPENROUTER_API_KEY")),
    ProviderSlot("openai_cloud", "OpenAI API", ("OPENAI_API_KEY",)),
    ProviderSlot("pollinations_chat", "Pollinations Chat", ("POLLINATIONS_API_KEY", "POLLINATIONS_SECRET_KEY")),
    ProviderSlot("pollinations_free", "Pollinations Open", (), False),
)

IMAGE_PROVIDERS: tuple[ProviderSlot, ...] = (
    ProviderSlot("replicate_flux", "Replicate Flux", ("REPLICATE_API_TOKEN", "REPLICATE_API_KEY")),
    ProviderSlot("stability", "Stability SD3", ("STABILITY_API_KEY",)),
    ProviderSlot("huggingface", "Hugging Face FLUX", ("HUGGINGFACE_API_KEY",)),
    ProviderSlot("pollinations_hd", "Pollinations Pro", ("POLLINATIONS_API_KEY",)),
    ProviderSlot("pollinations_free", "Pollinations Open", (), False),
)

VIDEO_PROVIDERS: tuple[ProviderSlot, ...] = (
    ProviderSlot(
        "hf_wan21",
        "Hugging Face Wan 2.1 (free)",
        ("HUGGINGFACE_API_KEY",),
    ),
    ProviderSlot(
        "pollinations_video",
        "Pollinations Video (key optional)",
        ("POLLINATIONS_API_KEY",),
        requires_key=False,
    ),
    ProviderSlot(
        "huggingface_video",
        "HF Inference video",
        ("HUGGINGFACE_API_KEY",),
    ),
    ProviderSlot("wan", "WAN / DashScope Video", ("WAN_API_KEY", "WAN25_API_KEY")),
    ProviderSlot("pollinations_free", "Pollinations Open", (), False),
)

RESEARCH_PROVIDERS: tuple[ProviderSlot, ...] = (
    ProviderSlot("tavily", "Tavily Search", ("TAVILY_API_KEY",)),
    ProviderSlot("gemini_research", "Gemini synthesis", ("GEMINI_API_KEY",)),
    ProviderSlot("sandbox_research", "Local template", (), False),
)

MAPS_PROVIDERS: tuple[ProviderSlot, ...] = (
    ProviderSlot("tavily_maps", "Tavily + LLM", ("TAVILY_API_KEY",)),
    ProviderSlot("gemini_maps", "Gemini maps", ("GEMINI_API_KEY",)),
    ProviderSlot("sandbox_maps", "Heuristic", (), False),
)

MUSIC_PROVIDERS: tuple[ProviderSlot, ...] = (
    ProviderSlot("pollinations_audio", "Pollinations Audio", ("POLLINATIONS_API_KEY",)),
    ProviderSlot("sandbox_music", "Catalog", (), False),
)

TOOL_PROVIDER_CHAINS: dict[str, tuple[ProviderSlot, ...]] = {
    "chat": CHAT_PROVIDERS,
    "create_image": IMAGE_PROVIDERS,
    "video": VIDEO_PROVIDERS,
    "deep_research": RESEARCH_PROVIDERS,
    "web_search": (ProviderSlot("tavily", "Tavily", ("TAVILY_API_KEY",)),),
    "maps": MAPS_PROVIDERS,
    "create_music": MUSIC_PROVIDERS,
    "app_build": (ProviderSlot("scaffold", "Scaffold", (), False),),
    "architecture": (ProviderSlot("blueprint", "Blueprint", (), False),),
}


def _slot_active(slot: ProviderSlot, *, lm_online: bool = False) -> bool:
    if slot.provider_id == "lm_studio":
        if lm_online:
            return True
        if resolve_lm_api_key():
            return True
        return False
    if slot.provider_id == "groq":
        return groq_key() is not None
    if slot.provider_id == "openrouter":
        return openrouter_key() is not None
    if slot.provider_id == "openai_cloud":
        return openai_cloud_key() is not None
    if not slot.requires_key:
        return True
    return any(key_active(k) for k in slot.env_keys)


def resolve_active_provider(tool_id: str, *, lm_online: bool = False) -> dict[str, Any]:
    chain = TOOL_PROVIDER_CHAINS.get(tool_id, CHAT_PROVIDERS)
    keys_detail = {k: key_active(k) for k in {ek for s in chain for ek in s.env_keys}}

    active: Optional[ProviderSlot] = None
    for slot in chain:
        if _slot_active(slot, lm_online=lm_online):
            active = slot
            break

    chosen = active or (chain[-1] if chain else None)
    return {
        "tool": tool_id,
        "provider_id": chosen.provider_id if chosen else "sandbox",
        "provider_label": chosen.label if chosen else "Sandbox",
        "configured": active is not None and active.requires_key,
        "using_free_tier": bool(chosen and not chosen.requires_key),
        "keys": keys_detail,
        "chain": [
            {
                "id": s.provider_id,
                "label": s.label,
                "active": _slot_active(s, lm_online=lm_online),
            }
            for s in chain
        ],
    }


def provider_matrix(lm_online: bool = False) -> list[dict[str, Any]]:
    return [resolve_active_provider(t, lm_online=lm_online) for t in TOOL_PROVIDER_CHAINS]


def gemini_available() -> bool:
    return key_active("GEMINI_API_KEY")


def replicate_available() -> bool:
    return key_active("REPLICATE_API_TOKEN") or key_active("REPLICATE_API_KEY")


def stability_available() -> bool:
    return key_active("STABILITY_API_KEY")


def pollinations_available() -> bool:
    return key_active("POLLINATIONS_API_KEY")


def huggingface_available() -> bool:
    return key_active("HUGGINGFACE_API_KEY")


def tavily_available() -> bool:
    return key_active("TAVILY_API_KEY")


def wan_available() -> bool:
    return key_active("WAN_API_KEY")


def finnhub_available() -> bool:
    return key_active("FINNHUB_API_KEY")


def coingecko_available() -> bool:
    return key_active("COINGECKO_API_KEY")
