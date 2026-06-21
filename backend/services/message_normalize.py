"""Normalize messy user input before LLM — infer intent despite typos."""

from __future__ import annotations

import re

# Common misspellings / Roman Urdu chat shorthand
_REPLACEMENTS: tuple[tuple[str, str], ...] = (
    (r"\bgemeni\b", "gemini"),
    (r"\bgemmini\b", "gemini"),
    (r"\bchatgtp\b", "chatgpt"),
    (r"\bchat gpt\b", "chatgpt"),
    (r"\bwhats\b", "what's"),
    (r"\bwht\b", "what"),
    (r"\bpls\b", "please"),
    (r"\bplz\b", "please"),
    (r"\bu\b", "you"),
    (r"\br\b", "are"),
    (r"\bthnx\b", "thanks"),
    (r"\bthx\b", "thanks"),
    (r"\bhw\b", "how"),
    (r"\babt\b", "about"),
    (r"\bbcoz\b", "because"),
    (r"\bcuz\b", "because"),
    (r"\bkese\b", "kaise"),
    (r"\bkesy\b", "kaise"),
    (r"\bbtao\b", "batao"),
    (r"\bbtao\b", "batao"),
    (r"\bsuno\b", "sunao"),
    (r"\bkrna\b", "karna"),
    (r"\bkrdo\b", "kar do"),
    (r"\bhai\?", "hai?"),
)


def normalize_user_message(text: str) -> str:
    t = (text or "").strip()
    if not t:
        return t
    t = re.sub(r"\s+", " ", t)
    for pattern, repl in _REPLACEMENTS:
        t = re.sub(pattern, repl, t, flags=re.I)
    return t
