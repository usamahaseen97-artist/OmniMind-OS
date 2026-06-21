"""Resolve execution tool from message + chat history (confirmations, typos)."""

from __future__ import annotations

import re

from services.execution_triggers import detect_execution_tool

CONFIRM = frozenset(
    {
        "yes",
        "y",
        "ok",
        "okay",
        "sure",
        "go",
        "continue",
        "proceed",
        "both",
        "haan",
        "han",
        "ji",
        "theek",
        "start",
        "generate",
        "do it",
    }
)


def _normalize_typos(text: str) -> str:
    t = text
    t = re.sub(r"\bahorse\b", "horse", t, flags=re.I)
    t = re.sub(r"\bloin\b", "lion", t, flags=re.I)
    t = re.sub(r"\bpic\b", "picture", t, flags=re.I)
    return t


def resolve_execution_tool(
    message: str,
    history: list[dict] | None = None,
    *,
    force_tool: str | None = None,
    agent_id: str | None = None,
) -> str:
    history = history or []
    norm = _normalize_typos(message)
    tool = detect_execution_tool(norm, force_tool=force_tool, agent_id=agent_id)
    if tool != "chat":
        return tool

    low = message.strip().lower()
    if low in CONFIRM or (len(low) < 16 and low in CONFIRM):
        for turn in reversed(history):
            if turn.get("role") != "user":
                continue
            prev = _normalize_typos(turn.get("content", ""))
            prev_tool = detect_execution_tool(prev, agent_id=agent_id)
            if prev_tool != "chat":
                return prev_tool

    # "generate ahorse pic" style without explicit create verb
    if re.search(r"\b(generate|genrate|banao|banao|make)\b", norm, re.I) and re.search(
        r"\b(pic|picture|photo|image)\b", norm, re.I
    ):
        return "create_image"

    return "chat"


def execution_message_for_tool(message: str, history: list[dict], tool: str) -> str:
    if tool == "chat":
        return message
    if message.strip().lower() in CONFIRM:
        for turn in reversed(history):
            if turn.get("role") == "user" and len(turn.get("content", "")) > 8:
                return turn["content"]
    return message
