"""Polyglot script-matching and concise-response rules for OmniForge chat."""

from __future__ import annotations

import re
from typing import Literal

ScriptMode = Literal["latin", "devanagari", "arabic", "standard"]

DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")
ARABIC_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")
LATIN_RE = re.compile(r"[A-Za-z]")
ROMAN_URDU_MARKERS = re.compile(
    r"\b(mujhe|mujhay|banani|banana|chahiye|chahte|k liye|ke liye|hy|hai|hain|krna|karna|website|kapray|kapde|dukan|business|bana|bano|banaye|karo|krdo)\b",
    re.I,
)
LATIN_ONLY_RE = re.compile(r"^[\x00-\x7F\s\d.,!?\"'@#$%^&*()[\]{}:;+\-/\\]+$")
EXPLICIT_DEVANAGARI_REQ = re.compile(
    r"\b(devanagari|hindi\s*(me|mai|mein|script)|देवनागरी)\b",
    re.I,
)
EXPLICIT_ARABIC_REQ = re.compile(
    r"\b(urdu\s*script|nastaliq|اردو|arabic\s*script)\b",
    re.I,
)

OMNIFORGE_BASE_SYSTEM = """You are OmniMind — the OmniForge workspace AI agent for web/app development.

**Response style (critical):**
- Be concise and conversational: 1–4 short paragraphs or a tight bullet list. No encyclopedic essays.
- Answer directly; skip long preambles, disclaimers, and filler.
- Use markdown only when it clearly helps (short lists, one code block).

**POLYGLOT RULE — strict language & script matching:**
- Detect BOTH the language AND the script (character set) of the user's message.
- ALWAYS reply in the SAME language AND SAME script as the user.
- If the user writes in Roman Latin script (Roman English / Roman Urdu), reply ONLY in Roman Latin — never switch to Devanagari (हिंदी) or Nastaliq/Arabic Urdu script unless the user explicitly requests that script.
- If the user writes in Devanagari, reply in Devanagari. If in Arabic-script Urdu, reply in Arabic script.
- Roman Urdu examples: "theek hai", "mujhe website chahiye" — keep all output in Latin letters only.
- FORBIDDEN: auto-transliterating Roman input into Hindi/Urdu native scripts.

Founder: USAMA HASEEN."""


def detect_input_script(text: str) -> ScriptMode:
    t = text.strip()
    if not t:
        return "standard"
    if DEVANAGARI_RE.search(t):
        return "devanagari"
    if ARABIC_RE.search(t):
        return "arabic"
    if ROMAN_URDU_MARKERS.search(t) or (LATIN_ONLY_RE.match(t) and LATIN_RE.search(t)):
        return "latin"
    if LATIN_RE.search(t):
        return "latin"
    return "standard"


def wants_native_script(text: str) -> bool:
    return bool(EXPLICIT_DEVANAGARI_REQ.search(text) or EXPLICIT_ARABIC_REQ.search(text))


def script_matching_rule(text: str) -> str:
    if wants_native_script(text):
        return ""
    mode = detect_input_script(text)
    if mode == "latin":
        return (
            "\n\n**Active turn — script lock:** User message is Roman Latin script. "
            "Reply ONLY using the Latin alphabet (Roman English or Roman Urdu). "
            "Do NOT output Devanagari, Arabic, or Nastaliq characters."
        )
    if mode == "devanagari":
        return "\n\n**Active turn — script lock:** User writes in Devanagari. Reply in Devanagari."
    if mode == "arabic":
        return "\n\n**Active turn — script lock:** User writes in Arabic-script Urdu. Reply in Arabic script."
    return ""


def compose_system_prompt(user_message: str) -> str:
    return OMNIFORGE_BASE_SYSTEM + script_matching_rule(user_message)


def strip_leading_language_prefix(message: str) -> str:
    """Remove frontend [Language rule: ...] prefix if present."""
    if message.startswith("[Language rule:"):
        end = message.find("]\n")
        if end != -1:
            return message[end + 2 :]
    return message
