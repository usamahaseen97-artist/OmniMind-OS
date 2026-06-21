"""
Central API key resolver — reads backend/.env via pydantic Settings (single source of truth).
"""

from __future__ import annotations

import os
from typing import Optional

from config import get_settings

PLACEHOLDER_FRAGMENTS = (
    "lm-studio",
    "lm_studio",
    "your_",
    "changeme",
    "xxx",
    "placeholder",
    "paste_",
    "sk-xxx",
    "not-needed",
    "dummy",
)

# Env var name → Settings attribute(s), first non-empty wins
ENV_TO_SETTINGS: dict[str, tuple[str, ...]] = {
    "GEMINI_API_KEY": ("gemini_api_key",),
    "REPLICATE_API_TOKEN": ("replicate_api_token",),
    "REPLICATE_API_KEY": ("replicate_api_token",),
    "STABILITY_API_KEY": ("stability_api_key",),
    "POLLINATIONS_API_KEY": ("pollinations_api_key",),
    "POLLINATIONS_SECRET_KEY": ("pollinations_api_key",),
    "HUGGINGFACE_API_KEY": ("huggingface_api_key",),
    "HF_TOKEN": ("huggingface_api_key",),
    "WAN_API_KEY": ("wan_api_key",),
    "WAN25_API_KEY": ("wan_api_key",),
    "TAVILY_API_KEY": ("tavily_api_key",),
    "GROK_API_KEY": ("grok_api_key",),  # Groq API (gsk_…)
    "OPENAI_API_KEY": ("openai_api_key",),
    "LOCAL_LLM_API_KEY": ("local_llm_api_key",),
    "GOOGLE_MAPS_API_KEY": ("google_maps_api_key",),
    "MAPS_API_KEY": ("google_maps_api_key",),
    "HUNYUAN_API_KEY": ("openrouter_api_key",),
    "OPENROUTER_API_KEY": ("openrouter_api_key",),
    "FINNHUB_API_KEY": ("finnhub_api_key",),
    "COINGECKO_API_KEY": ("coingecko_api_key",),
    "SUPABASE_URL": ("supabase_url",),
    "SUPABASE_ANON_KEY": ("supabase_anon_key",),
    "SUPABASE_SERVICE_KEY": ("supabase_service_key",),
}


def is_configured_key(raw: str) -> bool:
    val = (raw or "").strip()
    if len(val) < 8:
        return False
    low = val.lower()
    return not any(p in low for p in PLACEHOLDER_FRAGMENTS)


def get_key(env_name: str) -> str:
    """Resolve secret from Settings first, then os.environ."""
    settings = get_settings()
    for attr in ENV_TO_SETTINGS.get(env_name, ()):
        val = (getattr(settings, attr, None) or "").strip()
        if is_configured_key(val):
            return val
    return (os.getenv(env_name, "") or "").strip()


def key_active(env_name: str) -> bool:
    return is_configured_key(get_key(env_name))


def openai_cloud_key() -> Optional[str]:
    """Real OpenAI cloud key (not LM Studio placeholder)."""
    from services.lm_auth import is_placeholder_lm_key

    key = get_key("OPENAI_API_KEY")
    if not key or is_placeholder_lm_key(key):
        return None
    if key.startswith("sk-lm"):
        return None
    return key


def groq_key() -> Optional[str]:
    k = get_key("GROK_API_KEY")
    return k if k and k.startswith("gsk_") else None


def openrouter_key() -> Optional[str]:
    k = get_key("HUNYUAN_API_KEY") or get_key("OPENROUTER_API_KEY")
    return k if k and ("sk-or-" in k or len(k) > 20) else None


def configured_keys_summary() -> dict[str, bool]:
    """For /gateway/providers — no secret values."""
    return {name: key_active(name) for name in ENV_TO_SETTINGS}
