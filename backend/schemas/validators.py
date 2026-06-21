"""Shared field validators for strict API models."""

from __future__ import annotations

from typing import Any

ALLOWED_CHAT_ROLES = frozenset({"user", "assistant", "system"})


def validate_non_blank_str(v: str) -> str:
    s = v.strip()
    if not s:
        raise ValueError("must not be empty or whitespace only")
    return s


def validate_chat_role(v: str) -> str:
    r = v.strip().lower()
    if r not in ALLOWED_CHAT_ROLES:
        raise ValueError(f"role must be one of: {', '.join(sorted(ALLOWED_CHAT_ROLES))}")
    return r


def reject_unknown_keys(data: Any, *, allowed: set[str], label: str = "body") -> None:
    if isinstance(data, dict):
        extra = set(data.keys()) - allowed
        if extra:
            raise ValueError(f"{label}: unknown field(s): {', '.join(sorted(extra))}")
