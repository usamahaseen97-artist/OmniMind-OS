from __future__ import annotations

import re

BUILD_VERBS = re.compile(
    r"\b(build|create|make|design|generate|develop|render|scan|analyze|edit|trade)\b",
    re.I,
)

AGENT_CLARIFICATIONS: dict[str, list[str]] = {
    "web-architect": [
        "Describe your **app or website** in one message (features, users, pages).",
        "Use the **Code Bot panel** on the right to pick frontend → backend → database.",
        "Say **tum sab krdo** for managed MongoDB — I'll ask for your email next.",
    ],
    "game-app-architect": [
        "What **game or interactive app** do you want? (genre, platform, 2D vs 3D)",
        "Use **Code Bot** buttons: Phaser, Three.js, Next.js, etc.",
        "Upload design docs or paste GDD — I'll scaffold code + deploy steps.",
    ],
    "architect": [
        "What is the **plot size** (e.g. 500 sq yd) and facing direction?",
        "How many **rooms** (beds, baths, kitchen, lounge)?",
        "Preferred **style**: modern, tropical, or classic?",
    ],
    "data-science": [
        "Upload **Excel/CSV** or paste sample columns.",
        "Which **metrics** matter most? (sales trend, top products, margins)",
        "Output: **Plotly live chart** or Power BI style dashboard?",
    ],
    "trade-oracle": [
        "Which **symbols**? (BTC, ETH, AAPL, custom list)",
        "Timeframe: **intraday**, weekly, or long-term?",
        "Show **Finnhub equities** or **CoinGecko crypto** on live screen?",
    ],
    "medical-specialist": [
        "Upload a **report image** or describe symptoms.",
        "Enable **vision scan** for skin tone / eye color cues?",
        "Sandbox only — not a diagnosis. Confirm to proceed.",
    ],
    "creative-visionary": [
        "Image, **video VFX**, or both?",
        "Target platform: YouTube, Reels, or web hero?",
        "Mood / color grade reference?",
    ],
    "video-vfx": [
        "Paste **YouTube URL** or upload clip path.",
        "Cuts: auto scene detect or manual timestamps?",
        "VFX level: subtle polish or cinematic?",
    ],
}

AGENT_ALIASES: dict[str, str] = {
    "sovereign-core": "web-architect",
    "architect": "architect",
    "data-science": "data-science",
    "trade-oracle": "trade-oracle",
    "bio-heal": "medical-specialist",
    "creative-visionary": "creative-visionary",
    "logic-translator": "web-architect",
    "game-app-architect": "game-app-architect",
}


def _is_vague(message: str) -> bool:
    return len(message.split()) < 12 and not re.search(r"\d{2,}", message)


def needs_clarification(agent_id: str, message: str) -> bool:
    from services.execution_triggers import IMAGE_HINTS, APP_HINTS, detect_execution_tool

    # General Chatbot = free conversation (Gemini / ChatGPT style), no build questionnaire
    if agent_id in ("sovereign-core", "dashboard"):
        return False

    if detect_execution_tool(message) != "chat":
        return False
    if IMAGE_HINTS.search(message) or APP_HINTS.search(message):
        return False
    if re.search(r"\b(pic|picture|photo|video|website|app)\b", message, re.I):
        return False
    low = message.strip().lower()
    if low in ("yes", "ok", "okay", "go", "continue", "both", "haan", "ji"):
        return False
    if not BUILD_VERBS.search(message):
        return False
    if not _is_vague(message):
        return False
    key = AGENT_ALIASES.get(agent_id, agent_id)
    return key in AGENT_CLARIFICATIONS


def proactive_prompt(agent_id: str) -> str:
    key = AGENT_ALIASES.get(agent_id, agent_id)
    questions = AGENT_CLARIFICATIONS.get(key, AGENT_CLARIFICATIONS["web-architect"])
    lines = "\n".join(f"- {q}" for q in questions)
    return (
        "**Proactive OmniMind V11** — before I build on the Live Screen, I need a few details:\n\n"
        f"{lines}\n\n"
        "_Reply with your choices and I'll generate + preview instantly._"
    )
