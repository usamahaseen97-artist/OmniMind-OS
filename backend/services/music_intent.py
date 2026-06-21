"""
Fast local music-intent detection — skip slow Gemini round-trip when obvious.
"""

from __future__ import annotations

import re
from typing import Optional

MUSIC_VERBS = re.compile(
    r"\b("
    r"play|listen|stream|sunao|suno|gaana|gana|song|music|chalao|bajao|"
    r"laga|lagao|start\s+music|put\s+on|chala|bajana|laga\s+do"
    r"|پلے|سنو|گانا|گانا|موسیقی"
    r")\b",
    re.I,
)

STRIP_PREFIX = re.compile(
    r"^(?:please\s+)?(?:"
    r"play|listen\s+to|stream|sunao|suno|gaana|gana|chalao|bajao|lagao|put\s+on"
    r")\s+",
    re.I,
)

STRIP_SUFFIX = re.compile(
    r"\s+(?:song|gaana|gana|music|please|ab|now|for\s+me)\.?$",
    re.I,
)


def extract_song_query(message: str) -> Optional[str]:
    """Return song keywords if message is clearly a play/listen request."""
    text = message.strip()
    if len(text) < 2 or len(text) > 200:
        return None
    if not MUSIC_VERBS.search(text):
        return None

    q = STRIP_PREFIX.sub("", text).strip()
    q = STRIP_SUFFIX.sub("", q).strip()
    q = re.sub(r'^["\']|["\']$', "", q).strip()

    if len(q) < 2:
        return None
    if q.lower() in ("music", "a song", "song", "gaana", "gana"):
        return None
    return q[:200]


def is_music_request(message: str) -> bool:
    return extract_song_query(message) is not None
