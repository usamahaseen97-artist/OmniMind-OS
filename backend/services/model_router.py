"""
Cursor-style model router — local-first with automatic cloud escalation.
Used by chat streaming, tool gateway, and the 19-tool execution matrix.
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Awaitable, Callable, Optional

from config import get_settings
from services.api_keys import key_active
from services.connection_controller import probe_local_llm, resolve_provider_chain
from services.provider_registry import (
    CHAT_PROVIDERS,
    TOOL_PROVIDER_CHAINS,
    ProviderSlot,
    _slot_active,
    gemini_available,
)

logger = logging.getLogger(__name__)

ToolExecutor = Callable[..., Awaitable[dict[str, Any]]]

# Per-modality cloud timeouts (seconds) before escalating to next provider
_TOOL_TIMEOUTS: dict[str, float] = {
    "chat": 22.0,
    "create_image": 8.0,
    "video": 45.0,
    "deep_research": 30.0,
    "web_search": 12.0,
    "maps": 15.0,
    "create_music": 20.0,
    "app_build": 25.0,
    "architecture": 25.0,
    "visionary_ai": 40.0,
    "vfx_editor": 40.0,
    "quantum_trading": 20.0,
    "nasa_solver": 15.0,
    "architect": 30.0,
}


def local_first_enabled() -> bool:
    env = os.getenv("OMNIMIND_LOCAL_FIRST", "1").strip().lower()
    if env in ("0", "false", "no"):
        return False
    return True


async def probe_local_stack(timeout: float = 0.9) -> dict[str, Any]:
    """LM Studio / local OpenAI-compatible stack probe."""
    lm = await probe_local_llm(timeout=timeout)
    return {
        "lm_studio": lm,
        "local_online": bool(lm.get("connected")),
        "ollama_compatible": bool(lm.get("connected")),
    }


def resolve_runtime_provider_chain(
    tool_id: str,
    *,
    lm_online: bool = False,
    local_first: bool | None = None,
) -> list[str]:
    """Ordered provider ids for runtime failover (not just first-active pick)."""
    lf = local_first_enabled() if local_first is None else local_first
    chain_slots: tuple[ProviderSlot, ...] = TOOL_PROVIDER_CHAINS.get(tool_id, CHAT_PROVIDERS)

    ordered: list[ProviderSlot] = []
    if lf:
        local_slots = [s for s in chain_slots if s.provider_id in ("lm_studio", "scaffold", "blueprint")]
        cloud_slots = [s for s in chain_slots if s not in local_slots]
        ordered = local_slots + cloud_slots
    else:
        ordered = list(chain_slots)

    out: list[str] = []
    seen: set[str] = set()
    for slot in ordered:
        if not _slot_active(slot, lm_online=lm_online) and slot.requires_key:
            continue
        if slot.provider_id not in seen:
            seen.add(slot.provider_id)
            out.append(slot.provider_id)

    if not out:
        for slot in chain_slots:
            if slot.provider_id not in seen:
                seen.add(slot.provider_id)
                out.append(slot.provider_id)
    return out


async def resolve_chat_provider_chain(
    *,
    needs_search: bool,
    provider_pref: str | None = None,
) -> tuple[list[str], dict[str, Any]]:
    """Chat-specific chain with local-first Cursor routing when enabled."""
    settings = get_settings()
    pref = (provider_pref or settings.llm_provider or "auto").lower()
    has_gemini = gemini_available()
    lf = local_first_enabled()

    lm_status: dict[str, Any]
    if lf or pref in ("lm_studio", "local"):
        lm_status = await probe_local_llm(timeout=0.9)
    elif has_gemini and pref in ("auto", "gemini", ""):
        lm_status = {"connected": False, "skipped": "cloud_priority"}
    else:
        lm_status = await probe_local_llm(timeout=0.9)

    lm_online = bool(lm_status.get("connected"))

    if lf and lm_online:
        chain = resolve_provider_chain(
            needs_search=needs_search,
            lm_online=True,
            has_gemini=has_gemini,
            provider_pref="local",
        )
        for pid in ("gemini", "tavily_gemini", "groq", "openrouter", "openai_cloud", "pollinations_openai"):
            if pid == "gemini" and not has_gemini:
                continue
            if pid == "tavily_gemini" and not has_gemini:
                continue
            if pid not in chain:
                chain.append(pid)
    else:
        chain = resolve_provider_chain(
            needs_search=needs_search,
            lm_online=lm_online,
            has_gemini=has_gemini,
            provider_pref=pref,
        )

    return chain, lm_status


async def execute_with_provider_fallback(
    tool_id: str,
    executor: ToolExecutor,
    *,
    user_id: str,
    message: str,
    lm_online: bool = False,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Try primary executor (local path), then hosted cloud APIs on timeout/socket errors.
    """
    chain = resolve_runtime_provider_chain(tool_id, lm_online=lm_online)
    timeout = _TOOL_TIMEOUTS.get(tool_id, 25.0)
    last_error: Optional[str] = None

    try:
        result = await asyncio.wait_for(
            executor(user_id=user_id, message=message, **kwargs),
            timeout=timeout,
        )
        if isinstance(result, dict):
            result.setdefault("provider_chain", chain)
            result.setdefault("routing", "primary")
        if isinstance(result, dict) and result.get("success") is False:
            last_error = str(result.get("error") or "primary returned success=false")
        else:
            return result
    except asyncio.TimeoutError:
        last_error = f"primary timeout ({timeout}s)"
        logger.debug("Tool %s primary timed out", tool_id)
    except (OSError, ConnectionError, PermissionError) as exc:
        last_error = f"socket: {type(exc).__name__}"
        logger.debug("Tool %s socket error: %s", tool_id, exc)
    except Exception as exc:
        last_error = str(exc)[:200]
        logger.debug("Tool %s primary failed: %s", tool_id, exc)

    cloud = await run_cloud_fallback(tool_id, user_id=user_id, message=message, **kwargs)
    if cloud:
        cloud.setdefault("provider_chain", chain)
        return cloud

    return {
        "success": False,
        "tool": tool_id,
        "error": last_error or "all providers exhausted",
        "routing": "exhausted",
        "provider_chain": chain,
    }


async def run_cloud_fallback(
    tool_id: str,
    *,
    user_id: str,
    message: str,
    **kwargs: Any,
) -> dict[str, Any] | None:
    """Hosted cloud APIs — Together / Replicate / Fal-style tiered bridges."""
    try:
        if tool_id in ("create_image", "visionary_ai", "vfx_editor"):
            from services.image_generation import generate_image

            img = await generate_image(message, user_id=user_id, agent_id=kwargs.get("agent_id", "sovereign-core"))
            return {"success": True, "tool": tool_id, "routing": "cloud_image", **img}

        if tool_id == "video":
            from services.video_generation import generate_video

            clip = await generate_video(message, english_prompt=message, user_id=user_id)
            return {"success": True, "tool": tool_id, "routing": "cloud_video", **clip}

        if tool_id in ("deep_research", "web_search"):
            from services.tavily_search import tavily_search

            ctx = await tavily_search(message)
            if ctx:
                return {
                    "success": True,
                    "tool": tool_id,
                    "routing": "cloud_research",
                    "message": ctx[:8000],
                    "preview": {"type": "research", "html": f"<p>{ctx[:4000]}</p>", "active_tab": "live"},
                }

        if tool_id in ("architecture", "architect", "app_build"):
            from services.tools.architect_tool import parse_blueprint

            bp = await parse_blueprint(prompt=message)
            return {"success": True, "tool": tool_id, "routing": "cloud_architect", **bp}

        if tool_id in ("quantum_trading", "fintech"):
            from services.tools.trading_tool import execute_trading

            trade = await execute_trading(user_id=user_id, command=message, mode="MANUAL")
            return {"success": True, "tool": tool_id, "routing": "cloud_trading", **trade}

        if tool_id in ("nasa_solver", "physics"):
            from services.cloud_neural_agent import process_neural_query

            sci = await process_neural_query(prompt=message, subject="nasa-science-solver")
            return {"success": True, "tool": tool_id, "routing": "cloud_science", **sci}

        if tool_id == "chat":
            from services.cloud_neural_agent import process_neural_query

            chat = await process_neural_query(prompt=message, subject=user_id)
            return {"success": True, "tool": tool_id, "routing": "cloud_chat", **chat}
    except Exception as exc:
        logger.warning("Cloud fallback for %s failed: %s", tool_id, exc)
    return None
