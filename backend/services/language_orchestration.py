"""Polyglot script-matching rules — shared across OmniMind agent routes."""

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

POLYGLOT_RULE_BLOCK = """
**POLYGLOT RULE — strict language & script matching:**
- Detect BOTH the language AND the script (character set) of the user's input.
- ALWAYS reply in the SAME language AND SAME script as the user.
- Roman English / Roman Urdu (Latin alphabet only) → reply ONLY in Roman Latin. STRICTLY FORBIDDEN: Devanagari or Nastaliq/Arabic Urdu unless explicitly requested.
- Devanagari input → Devanagari output. Arabic-script Urdu input → Arabic-script output.
- FORBIDDEN: auto-transliterating Roman input into native Hindi/Urdu scripts.

**Response style:** Concise, conversational, direct — 1–4 short paragraphs max. No encyclopedic blocks."""


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
            "\n**Active turn — script lock:** User writes Roman Latin. "
            "Reply ONLY in Latin alphabet. No Devanagari or Nastaliq."
        )
    if mode == "devanagari":
        return "\n**Active turn — script lock:** Reply in Devanagari."
    if mode == "arabic":
        return "\n**Active turn — script lock:** Reply in Arabic-script Urdu."
    return ""


def augment_system_prompt(base: str, user_message: str) -> str:
    return f"{base.strip()}\n{POLYGLOT_RULE_BLOCK}{script_matching_rule(user_message)}"
