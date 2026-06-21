from __future__ import annotations

import re

from config import get_settings

SEARCH_PATTERNS = re.compile(
    r"\b("
    r"latest|today|news|current|live|search|find|lookup|look up|browse|google|"
    r"price|weather|headline|update|updates|compare|versus|vs\b|"
    r"who is|who's|what is|what's|where is|when did|how much|how many|"
    r"tell me about|explain|define|wiki|wikipedia|"
    r"kitna|kya hai|kab|kahan|kaun|taaza|khoj|dhundo|talash|"
    r"2024|2025|2026"
    r")\b",
    re.I,
)

QUESTION_START = re.compile(
    r"^(what|who|where|when|why|how|which|can you|could you|please find|search for)\b",
    re.I,
)


class AgentRouter:
    """Routes: Gemini (fast) · Tavily+LLM · LM Studio · cloud fallbacks."""

    @staticmethod
    def needs_web_search(message: str) -> bool:
        text = message.strip()
        if len(text) < 8:
            return False
        low = text.lower()
        if re.match(
            r"^(hi|hello|hey|salam|aoa|assalam|ok|okay|thanks|shukriya|bye)\b",
            low,
        ) and len(text.split()) <= 4:
            return False
        if SEARCH_PATTERNS.search(text):
            return True
        if text.endswith("?") and len(text.split()) >= 3:
            return True
        if QUESTION_START.search(text):
            return True
        return False

    @staticmethod
    def pick_provider(
        *,
        needs_search: bool,
        lm_studio_online: bool,
        has_gemini: bool,
    ) -> str:
        settings = get_settings()
        provider_pref = (settings.llm_provider or "auto").lower()

        if provider_pref == "gemini":
            if needs_search and has_gemini:
                return "tavily_gemini"
            return "gemini" if has_gemini else "mock"

        if provider_pref in ("lm_studio", "local"):
            if needs_search and settings.tavily_api_key:
                return "tavily_lm_studio"
            return "lm_studio"

        if has_gemini:
            if needs_search:
                return "tavily_gemini"
            return "gemini"

        if lm_studio_online:
            if needs_search and settings.tavily_api_key:
                return "tavily_lm_studio"
            return "lm_studio"

        return "mock"
