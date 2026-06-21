"""Fast resilient replies when all remote LLM routes are slow — streams in ~1s."""

from __future__ import annotations

import asyncio
import re
from typing import AsyncGenerator

_KNOWLEDGE: list[tuple[re.Pattern[str], str]] = [
    (
        re.compile(r"\bcomputer\b", re.I),
        "**Computer** ek electronic machine hai jo data process karti hai — input leta hai, "
        "instructions (program) ke mutabiq calculate karta hai, aur output deta hai. "
        "Is mein CPU, memory (RAM), storage, aur I/O devices shamil hain. "
        "Aaj kal computers phones, servers, aur embedded systems sab jagah use hote hain.",
    ),
    (
        re.compile(r"\b(hello|hi|salam|assalam|hey)\b", re.I),
        "Wa alaikum assalam! **OmniMind V11** tayyar hai. "
        "Aap koi bhi tool left menu se khol sakte hain — Business Analytics, Medical, App Develop, waghera.",
    ),
    (
        re.compile(r"\b(python|pandas|data)\b", re.I),
        "**Data / Python:** Business Analytics tool mein Karachi retail dataset, bar charts, "
        "aur wastage metrics right panel par live dikhte hain. Menu se **Business Analytics** select karein.",
    ),
    (
        re.compile(r"\b(mongo|database|mongodb)\b", re.I),
        "**MongoDB:** App & Develop tool ke right panel mein connection URL, username, password "
        "daal kar **Connect Database** dabayein — staged console aur green badge dikhega.",
    ),
]


def _build_reply(message: str, system_prompt: str) -> str:
    text = message.strip()
    preview = text[:160]

    for pattern, answer in _KNOWLEDGE:
        if pattern.search(text):
            return answer

    role_hint = ""
    if "data scientist" in system_prompt.lower():
        role_hint = "Main aap ka **Data Scientist** hoon — metrics aur trends par focus karta hoon.\n\n"
    elif "medical" in system_prompt.lower():
        role_hint = "Main **Medical Consultant** mode mein hoon — clinical indicators par baat karta hoon.\n\n"

    return (
        f"{role_hint}**OmniMind V11**\n\n"
        f"Aap ne pucha: _{preview}_\n\n"
        "Main aap ka sawal process kar raha hoon. Tools ab bhi kaam karte hain: left ☰ menu se koi agent kholo — "
        "right **Live Sandbox** us tool ka interactive panel dikhata hai.\n\n"
        "Zyaada detail ke liye prompt thora expand karein ya koi specialized agent select karein."
    )


async def stream_instant_reply(
    message: str,
    system_prompt: str = "",
) -> AsyncGenerator[str, None]:
    reply = _build_reply(message, system_prompt)
    for word in reply.split(" "):
        yield word + " "
        await asyncio.sleep(0.012)
