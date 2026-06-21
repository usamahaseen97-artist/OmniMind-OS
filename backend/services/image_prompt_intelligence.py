"""
Multimodal prompt interpretation: public figures, edit intents, subject/style extraction.
"""

from __future__ import annotations

import re
from typing import Any, Optional

from services.context_manager import MediaReference
from services.subject_segmentation import default_portrait_segmentation

PUBLIC_FIGURE_HINTS: dict[str, str] = {
    "younis khan": (
        "Younis Khan, legendary Pakistani cricketer, exact recognizable face, "
        "athletic build, professional sports portrait lighting, not a generic man"
    ),
    "yunus khan": (
        "Younis Khan, legendary Pakistani cricketer, exact recognizable face, "
        "professional cricket portrait"
    ),
    "youns khan": (
        "Younis Khan Pakistani cricketer, identifiable face, sports portrait"
    ),
    "younus khan cricketer": (
        "Younis Khan Pakistani cricketer captain, photorealistic official portrait"
    ),
    "younus khan crickter": (
        "Younis Khan, legendary Pakistani cricketer, exact recognizable face, "
        "green Pakistan cricket jersey optional, not a generic man"
    ),
    "yunus khan crickter": (
        "Younis Khan Pakistani cricketer, identifiable face, sports portrait"
    ),
    "babar azam": "Babar Azam, Pakistani cricketer, recognizable face, sports portrait",
    "imran khan": "Imran Khan, Pakistani cricketer and leader, recognizable portrait",
    "shahrukh khan": "Shah Rukh Khan Bollywood actor, iconic face, cinematic portrait",
    "elon musk": "Elon Musk, recognizable face, photorealistic portrait",
}

EDIT_INSTRUCTION_RE = re.compile(
    r"\b("
    r"background|piche|peeche|behind|baghair|change\s*krdo|change\s*karo|"
    r"replace|inpaint|in-paint|edit\s+the|modify|remove\s+background|"
    r"bungalow|gariyan|cars?\s+parked|isi\s*(pic|photo|image)|"
    r"last\s+image|previous\s+image|us\s*pic|is\s*photo|same\s+person|"
    r"keep\s+(him|her|face|subject)"
    r")\b",
    re.I,
)

REFERENCE_PREVIOUS_RE = re.compile(
    r"\b(last|previous|earlier|that|this|same)\s+(image|photo|picture|portrait|pic)\b|"
    r"\b(isi|us)\s+(pic|photo|tasveer|تصویر)\b|"
    r"\blast_generated_image\b",
    re.I,
)


def is_multimodal_image_request(message: str) -> bool:
    low = message.lower()
    if match_public_figure(message):
        return True
    if re.search(
        r"\b(pic|picture|photo|tasveer|portrait|image)\b.*\b(bana|banao|banado|bana do|generate|make)\b",
        low,
    ):
        return True
    if re.search(r"\bki\s+pic\b", low) or re.search(r"\bpic\s+bana", low):
        return True
    if re.search(r"\bcrickter\b|\bcricketer\b", low) and re.search(
        r"\b(pic|photo|portrait)\b", low
    ):
        return True
    return False


def match_public_figure(message: str) -> Optional[str]:
    low = message.lower().replace("crickter", "cricketer")
    for key, hint in PUBLIC_FIGURE_HINTS.items():
        if key in low:
            return hint
    m = re.search(
        r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(cricketer|actor|player|celebrity)\b",
        message,
    )
    if m:
        name = m.group(1)
        role = m.group(2)
        return (
            f"{name}, famous {role}, highly recognizable face and identity, "
            f"photorealistic portrait, not a generic lookalike"
        )
    return None


def is_image_edit_instruction(message: str) -> bool:
    return bool(EDIT_INSTRUCTION_RE.search(message))


def references_previous_image(message: str) -> bool:
    return bool(REFERENCE_PREVIOUS_RE.search(message)) or is_image_edit_instruction(message)


def extract_edit_description(message: str) -> str:
    text = message.strip()
    text = re.sub(
        r"^(please\s+)?(background|bg)\s*(change|replace|edit)\s*(krdo|karo|karein)?\s*",
        "",
        text,
        flags=re.I,
    )
    text = re.sub(r"^(make|change|edit|modify)\s+", "", text, flags=re.I)
    return text.strip() or message.strip()


def extract_style_tags(message: str) -> list[str]:
    tags: list[str] = []
    low = message.lower()
    if re.search(r"\b(photoreal|realistic|8k|hd)\b", low):
        tags.append("photorealistic 8k")
    if re.search(r"\b(portrait|headshot)\b", low):
        tags.append("professional portrait")
    if re.search(r"\b(cinematic|film)\b", low):
        tags.append("cinematic lighting")
    if re.search(r"\b(neon|cyber)\b", low):
        tags.append("neon accent lighting")
    return tags


def build_generation_prompt(
    message: str,
    *,
    last_media: Optional[MediaReference] = None,
    agent_id: str = "sovereign-core",
) -> dict[str, Any]:
    """Returns prompt, mode, subject_hint, is_edit."""
    figure = match_public_figure(message)
    styles = extract_style_tags(message)
    is_edit = is_image_edit_instruction(message) or (
        references_previous_image(message) and last_media is not None
    )

    if is_edit and last_media:
        edit_desc = extract_edit_description(message)
        subject = last_media.subject_hint or figure or "the same person from the reference portrait"
        prompt = (
            f"Inpainting edit — preserve subject identity ({subject}). "
            f"Change only background/scene: {edit_desc}. "
            f"Seamless photorealistic composite, original face unchanged."
        )
        if styles:
            prompt += " Style: " + ", ".join(styles) + "."
        seg = getattr(last_media, "subject_segmentation", None) or default_portrait_segmentation()
        return {
            "prompt": prompt,
            "mode": "inpaint",
            "subject_hint": subject,
            "is_edit": True,
            "source_url": last_media.url,
            "edit_description": edit_desc,
            "subject_segmentation": seg,
        }

    cleaned = re.sub(
        r"^(make|create|generate|draw)\s+(me\s+)?(an?\s+)?(image|picture|photo)\s+(of\s+)?",
        "",
        message,
        flags=re.I,
    ).strip() or message.strip()[:500]

    prompt = cleaned
    if figure:
        prompt = f"{figure}. {cleaned}"
    elif agent_id in ("sovereign-core", "general-chatbot", "dashboard"):
        if figure is None and re.search(r"\b(cricketer|actor|player)\b", message, re.I):
            prompt = (
                f"Named public figure portrait (not generic): {cleaned}. "
                "Exact recognizable identity."
            )

    if styles:
        prompt += " " + ", ".join(styles)

    subject_hint = figure or cleaned[:120]
    return {
        "prompt": prompt.strip(),
        "mode": "generate",
        "subject_hint": subject_hint,
        "is_edit": False,
        "source_url": None,
        "edit_description": None,
    }
