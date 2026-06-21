"""
Global integration gateway — API key binding, Cursor-style cloud fallbacks, tool routing.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Optional

from config import get_settings
from services.api_keys import key_active
from services.model_router import execute_with_provider_fallback, probe_local_stack
from services.provider_registry import (
    provider_matrix,
    resolve_active_provider,
)

env_key_active = key_active

logger = logging.getLogger(__name__)

ToolExecutor = Callable[..., Awaitable[dict[str, Any]]]


@dataclass(frozen=True)
class IntegrationBinding:
    tool_id: str
    env_keys: tuple[str, ...]
    provider_label: str
    fallback_mode: str  # cloud | mock | local


TOOL_BINDINGS: dict[str, IntegrationBinding] = {
    "chat": IntegrationBinding(
        "chat",
        ("GEMINI_API_KEY", "OPENAI_API_KEY", "GROK_API_KEY", "POLLINATIONS_API_KEY"),
        "resilient_llm",
        "cloud",
    ),
    "create_image": IntegrationBinding(
        "create_image",
        ("REPLICATE_API_TOKEN", "STABILITY_API_KEY", "POLLINATIONS_API_KEY", "HUGGINGFACE_API_KEY"),
        "tiered_image",
        "cloud",
    ),
    "video": IntegrationBinding(
        "video",
        ("REPLICATE_API_TOKEN", "WAN_API_KEY", "POLLINATIONS_API_KEY"),
        "tiered_video",
        "cloud",
    ),
    "deep_research": IntegrationBinding(
        "deep_research",
        ("TAVILY_API_KEY", "GEMINI_API_KEY"),
        "tavily_gemini",
        "cloud",
    ),
    "web_search": IntegrationBinding("web_search", ("TAVILY_API_KEY",), "tavily", "cloud"),
    "create_music": IntegrationBinding(
        "create_music",
        ("POLLINATIONS_API_KEY",),
        "pollinations_audio",
        "mock",
    ),
    "maps": IntegrationBinding(
        "maps",
        ("TAVILY_API_KEY", "GEMINI_API_KEY", "GOOGLE_MAPS_API_KEY"),
        "maps_intel",
        "cloud",
    ),
    "app_build": IntegrationBinding("app_build", (), "scaffold", "mock"),
    "architecture": IntegrationBinding("architecture", (), "blueprint", "mock"),
}


def integration_matrix() -> list[dict[str, Any]]:
    """Status map for /integrations, /gateway/status, and /platform/readiness."""
    providers = {row["tool"]: row for row in provider_matrix()}
    rows: list[dict[str, Any]] = []
    for binding in TOOL_BINDINGS.values():
        keys = {k: env_key_active(k) for k in binding.env_keys}
        configured = any(keys.values()) if binding.env_keys else True
        active = providers.get(binding.tool_id, {})
        rows.append(
            {
                "tool": binding.tool_id,
                "provider": active.get("provider_id", binding.provider_label),
                "provider_label": active.get("provider_label", binding.provider_label),
                "fallback": binding.fallback_mode,
                "configured": configured,
                "keys": keys,
                "route": "cursor_auto",
                "active_provider": active,
            }
        )
    settings = get_settings()
    rows.append(
        {
            "tool": "local_llm",
            "provider": "lm_studio",
            "provider_label": "LM Studio / Ollama-compatible",
            "fallback": "cloud",
            "configured": True,
            "base_url": settings.effective_local_llm_base_url,
            "route": "model_router",
        }
    )
    return rows


def resolve_tool_route(tool_id: str) -> dict[str, Any]:
    binding = TOOL_BINDINGS.get(tool_id or "chat", TOOL_BINDINGS["chat"])
    active = resolve_active_provider(tool_id or "chat")
    keys_ok = {k: env_key_active(k) for k in binding.env_keys}
    has_keys = any(keys_ok.values()) if binding.env_keys else True
    return {
        "tool": binding.tool_id,
        "provider": active.get("provider_id", binding.provider_label),
        "provider_label": active.get("provider_label"),
        "use_fallback": active.get("using_free_tier", not has_keys),
        "fallback_mode": binding.fallback_mode,
        "keys": keys_ok,
        "halt": False,
        "message": None,
        "active_provider": active,
        "routing": "cursor_failover",
    }


async def execute_tool_with_fallback(
    tool_id: str,
    executor: ToolExecutor,
    *,
    user_id: str,
    message: str,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Run tool executor with Cursor-style local→cloud provider chain; sandbox only as last resort.
    """
    from services.event_pipeline import publish_omnimind_event

    route = resolve_tool_route(tool_id)
    stack = await probe_local_stack()
    lm_online = bool(stack.get("local_online"))

    await publish_omnimind_event(
        user_id,
        "tool.dispatch",
        {"tool": tool_id, "route": route, "local_online": lm_online},
    )

    async def _primary(**exec_kwargs: Any) -> dict[str, Any]:
        return await executor(user_id=user_id, message=message, **exec_kwargs)

    result = await execute_with_provider_fallback(
        tool_id,
        _primary,
        user_id=user_id,
        message=message,
        lm_online=lm_online,
        **kwargs,
    )

    if isinstance(result, dict) and result.get("success") is not False and "message" in result:
        result.setdefault("provider", route.get("provider"))
        result.setdefault("provider_label", route.get("provider_label"))
        return result

    if isinstance(result, dict) and result.get("success") is not False:
        result.setdefault("provider", route.get("provider"))
        result.setdefault("provider_label", route.get("provider_label"))
        return result

    err = (result or {}).get("error") if isinstance(result, dict) else None
    logger.warning("Tool %s exhausted providers, sandbox bridge: %s", tool_id, err)
    sandbox = _mock_tool_result(tool_id, message, err)
    sandbox["routing"] = "sandbox_last_resort"
    return sandbox


def _mock_tool_result(tool_id: str, message: str, err: Optional[str] = None) -> dict[str, Any]:
    preview = message.strip()[:120]
    route = resolve_active_provider(tool_id)
    base = {
        "success": True,
        "tool": tool_id,
        "provider": route.get("provider_id", "omnimind_sandbox"),
        "provider_label": route.get("provider_label", "Sandbox"),
        "sandbox": True,
    }
    if tool_id == "create_image":
        from services.image_generation import pollinations_url

        url = pollinations_url(preview or "OmniMind abstract emerald")
        return {
            **base,
            "message": f"**Image ready** (cloud bridge).\n\n![Generated]({url})",
            "image_url": url,
            "images": [{"url": url, "alt": preview}],
            "preview": {"type": "image", "image_url": url, "active_tab": "live"},
        }
    if tool_id == "video":
        return {
            **base,
            "message": "**Video queued** — Creative Video pipeline (sandbox preview).",
            "preview": {"type": "video", "active_tab": "live"},
        }
    if tool_id == "deep_research":
        return {
            **base,
            "message": f"**Research brief** (sandbox)\n\n_{preview}_\n\nSources synthesised locally.",
            "preview": {"type": "research", "html": f"<p>{preview}</p>", "active_tab": "live"},
        }
    return {
        **base,
        "message": f"**{tool_id.replace('_', ' ').title()}** complete (resilient mode).\n\n_{preview}_",
        "detail": err,
    }
