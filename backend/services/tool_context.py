"""
Per-user session context for OmniMind tools (videos, uploads, labs profile).
In-memory for dev; swap for MongoDB when Atlas is connected.
"""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional


@dataclass
class VideoRecord:
    id: str
    user_prompt: str
    english_visual_prompt: str
    verbal_language: str
    mode: str
    handle: str = "last_generated_video"
    preview_html: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class UserToolSession:
    user_id: str
    last_video: Optional[VideoRecord] = None
    video_history: list[VideoRecord] = field(default_factory=list)
    pending_video_queue: int = 0
    labs_profile: dict[str, Any] = field(default_factory=dict)
    uploads: list[dict[str, Any]] = field(default_factory=list)


_sessions: dict[str, UserToolSession] = {}


def get_session(user_id: str) -> UserToolSession:
    if user_id not in _sessions:
        _sessions[user_id] = UserToolSession(user_id=user_id)
    return _sessions[user_id]


def store_video(
    user_id: str,
    *,
    user_prompt: str,
    english_visual_prompt: str,
    verbal_language: str,
    mode: str,
    preview_html: str,
) -> VideoRecord:
    rec = VideoRecord(
        id=str(uuid.uuid4()),
        user_prompt=user_prompt,
        english_visual_prompt=english_visual_prompt,
        verbal_language=verbal_language,
        mode=mode,
        preview_html=preview_html,
    )
    sess = get_session(user_id)
    sess.last_video = rec
    sess.video_history.append(rec)
    if len(sess.video_history) > 20:
        sess.video_history = sess.video_history[-20:]
    return rec


def detect_verbal_language(text: str) -> str:
    """Heuristic verbal language for in-video speech (not the visual prompt language)."""
    if re.search(r"[\u0600-\u06FF\u0750-\u077F]", text):
        return "urdu"
    if re.search(r"[\u0900-\u097F]", text):
        return "hindi"
    if re.search(r"[\u4E00-\u9FFF]", text):
        return "chinese"
    if re.search(r"[\u0400-\u04FF]", text):
        return "russian"
    if re.search(r"\b(urdu|hindi|spanish|french|arabic|punjabi)\b", text, re.I):
        m = re.search(r"\b(urdu|hindi|spanish|french|arabic|punjabi)\b", text, re.I)
        return m.group(1).lower() if m else "english"
    return "english"


def count_video_requests(text: str) -> int:
    patterns = [
        r"(\d+)\s*videos?",
        r"(\d+)\s*clips?",
        r"make\s+(\d+)\s+",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.I)
        if m:
            n = int(m.group(1))
            return max(1, min(n, 10))
    if re.search(r"\b(two|2)\s+(videos?|clips?)\b", text, re.I):
        return 2
    if re.search(r"\b(three|3)\s+(videos?|clips?)\b", text, re.I):
        return 3
    return 1


def references_last_video(text: str) -> bool:
    keys = (
        "last_generated_video",
        "earlier_generated_video",
        "last video",
        "previous video",
        "that video",
        "the video we made",
        "edit the video",
        "modify the video",
        "replace the",
        "slow motion",
        "make it slower",
    )
    low = text.lower()
    return any(k in low for k in keys)
