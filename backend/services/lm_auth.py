"""
LM Studio authentication helpers.

LM Studio with server auth enabled requires a real sk-lm-* token from Manage Tokens.
Sending placeholder values (e.g. Bearer lm-studio) causes HTTP 401.
"""

from __future__ import annotations

from typing import Optional

from config import get_settings

# Placeholder keys — never send as Bearer (LM Studio returns 401 Malformed token)
_DUMMY_LM_KEYS = frozenset(
    {
        "",
        "lm-studio",
        "lm_studio",
        "not-needed",
        "not_needed",
        "dummy",
        "none",
        "local",
        "sk-none",
        "your-token-here",
        "replace-with-a-long-random-token",
    }
)


def is_placeholder_lm_key(key: str) -> bool:
    k = (key or "").strip().lower()
    if not k:
        return True
    if k in _DUMMY_LM_KEYS:
        return True
    if k.startswith("replace") or k in ("xxxx", "xxx", "sk-your-token-here"):
        return True
    return False


def resolve_lm_api_key() -> Optional[str]:
    """
    Return a real LM Studio Bearer token, or None to omit Authorization.
    Checks LOCAL_LLM_API_KEY first, then OPENAI_API_KEY (legacy).
    """
    settings = get_settings()
    for raw in (settings.local_llm_api_key, settings.openai_api_key):
        key = (raw or "").strip()
        if is_placeholder_lm_key(key):
            continue
        return key
    return None


def auth_headers() -> dict[str, str]:
    """Headers for httpx — empty when no real sk-lm-* token."""
    token = resolve_lm_api_key()
    if not token:
        return {}
    return {"Authorization": f"Bearer {token}"}


def lm_studio_auth_hint() -> str:
    token = resolve_lm_api_key()
    if token:
        return "Using configured LM Studio API token."
    return (
        "LM Studio requires an API token: LM Studio → Server → Manage Tokens → "
        "set LOCAL_LLM_API_KEY=sk-lm-... in backend/.env "
        "(do not use 'lm-studio' when server auth is on)."
    )
