"""
Shared execution-intent detection (Make / Create / Build / Generate / Hindi).
"""

from __future__ import annotations

import re

EXECUTION_VERBS = re.compile(
    r"\b("
    r"make|makes|making|create|creates|creating|build|builds|building|"
    r"generate|generates|generating|design|designs|designing|draw|draws|"
    r"produce|render|compose|develop|craft|"
    r"बनाओ|बनाना|बना कर|तैयार कर|"
    r"पिक्चर|तस्वीर|ऐप|वेबसाइट|banao"
    r")\b",
    re.I,
)

PIC_BANAO = re.compile(
    r"pic\s*banao|picture\s*banao|photo\s*banao|"
    r"पिक्चर\s*बनाओ|तस्वीर\s*बनाओ|"
    r"ki\s+pic\s+bana|pic\s+bana\s+do|"
    r"tasveer\s+bana|photo\s+bana\s+do",
    re.I,
)

IMAGE_HINTS = re.compile(
    r"\b(image|images|picture|pictures|photo|photos|pic|illustration|poster|"
    r"horse|lion|ahorse|loin|logo|icon|wallpaper|artwork|"
    r"पिक्चर|तस्वीर|चित्र)\b",
    re.I,
)

QUICK_IMAGE = re.compile(
    r"\b(generate|make|create|draw|banao|banao)\b.*\b(pic|picture|photo|image)\b|"
    r"\b(pic|picture|photo)\b.*\b(generate|make|create|banao)\b",
    re.I,
)

APP_HINTS = re.compile(
    r"\b(app|apps|website|web\s*site|webapp|portal|saas|dashboard|"
    r"mutton|ecommerce|e-commerce|store|shop|"
    r"package\.json|react|next\.js|boilerplate|"
    r"ऐप|वेबसाइट|साइट)\b",
    re.I,
)

ARCH_HINTS = re.compile(
    r"\b(blueprint|floor\s*plan|floorplan|architecture|architectural|"
    r"layout|schematic|courtyard|bedroom|bedrooms|parking|"
    r"\d+\s*[x×]\s*\d+|ft\b|feet|sqft|plot)\b",
    re.I,
)


def wants_execution(message: str) -> bool:
    return bool(EXECUTION_VERBS.search(message))


VIDEO_HINTS = re.compile(
    r"\b(video|videos|clip|clips|animate|animation|cartoon|vfx|cinematic|"
    r"image\s*to\s*video|text\s*to\s*video|last_generated_video|"
    r"iski\s*video|ki\s*video|वीडियो)\b",
    re.I,
)

SOVEREIGN_AGENTS = frozenset({"sovereign-core", "general-chatbot", "dashboard"})
CREATIVE_VIDEO_AGENTS = frozenset({"creative-visionary", "creative-video"})


def detect_execution_tool(
    message: str,
    *,
    force_tool: str | None = None,
    agent_id: str | None = None,
) -> str:
    if force_tool:
        return force_tool
    low = message.lower().strip()
    agent = (agent_id or "sovereign-core").strip().lower()
    sovereign = agent in SOVEREIGN_AGENTS
    creative_video = agent in CREATIVE_VIDEO_AGENTS

    if creative_video:
        from services.video_prompt_intelligence import creative_video_should_run

        if creative_video_should_run(message, has_image=bool(IMAGE_HINTS.search(message))):
            return "video"
        if (
            VIDEO_HINTS.search(message)
            or re.search(r"\b(humpty|dumpty|cartoon)\b.*\b(video|animate)\b", low)
            or re.search(
                r"\b(iso|isko|is\s*ko|banao|bana\s*do|background|dubai|animate|motion)\b",
                low,
            )
            or wants_execution(message)
        ):
            return "video"

    if sovereign:
        if message.strip().lower().startswith("/video"):
            return "video"
        if message.strip().lower().startswith("/image"):
            return "create_image"
        if VIDEO_HINTS.search(message):
            return "video"

    if not sovereign and any(
        k in low for k in ("video", "clip", "animate", "last_generated_video")
    ):
        return "video"
    if any(k in low for k in ("research report", "deep research", "detailed report")):
        return "deep_research"
    if any(k in low for k in ("search the web", "web search", "latest news", "current news")):
        return "web_search"
    if low.startswith("think:") or "think step by step" in low:
        return "thinking"
    if low.startswith("labs:") or "personal intelligence" in low:
        return "personal_intelligence"

    if sovereign:
        from services.image_prompt_intelligence import is_multimodal_image_request

        if is_multimodal_image_request(message):
            return "create_image"
        if re.search(
            r"\b(background|piche|peeche|change\s*krdo|inpaint|bungalow|gariyan|"
            r"edit\s+the|replace\s+background|isi\s+pic)\b",
            low,
        ):
            return "create_image"
        if QUICK_IMAGE.search(message):
            return "create_image"
        if PIC_BANAO.search(message) or (
            re.search(r"\bbanao\b", low) and IMAGE_HINTS.search(message)
        ):
            return "create_image"
        if IMAGE_HINTS.search(message) and re.search(
            r"\b(pic|picture|photo|image)\b", low
        ):
            return "create_image"
        if IMAGE_HINTS.search(message) and (
            wants_execution(message)
            or any(k in low for k in ("create image", "generate image", "draw ", "picture of"))
        ):
            return "create_image"
        if any(k in low for k in ("create image", "generate image", "draw ", "picture of")):
            return "create_image"
        return "chat"

    if ARCH_HINTS.search(message) and (
        wants_execution(message) or "bedroom" in low or re.search(r"\d+\s*[x×]\s*\d+", low)
    ):
        return "architecture"

    if QUICK_IMAGE.search(message):
        return "create_image"
    if PIC_BANAO.search(message) or (
        re.search(r"\bbanao\b", low) and IMAGE_HINTS.search(message)
    ):
        return "create_image"
    if IMAGE_HINTS.search(message) and re.search(
        r"\b(pic|picture|photo|image)\b", low
    ):
        return "create_image"

    if APP_HINTS.search(message) and wants_execution(message):
        return "app_build"

    if IMAGE_HINTS.search(message) and (
        wants_execution(message)
        or any(k in low for k in ("create image", "generate image", "draw ", "picture of"))
    ):
        return "create_image"

    if wants_execution(message):
        if IMAGE_HINTS.search(message):
            return "create_image"
        if APP_HINTS.search(message):
            return "app_build"
        if ARCH_HINTS.search(message):
            return "architecture"

    if any(k in low for k in ("create image", "generate image", "draw ", "picture of")):
        return "create_image"
    if any(k in low for k in ("create music", "compose", "soundtrack", "beat ")):
        return "create_music"

    return "chat"
