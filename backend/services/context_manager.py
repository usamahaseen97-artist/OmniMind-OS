"""
Global per-user context: active chat agent + last generated media reference.
MongoDB-safe anchors via user_id; in-memory store mirrors tool_context pattern.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class MediaReference:
    url: str
    prompt: str
    media_type: str = "image"
    subject_hint: str = ""
    provider: str = "pollinations"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class UserContextState:
    user_id: str
    active_chat_agent: str = "sovereign-core"
    last_generated_media_reference: Optional[MediaReference] = None


_states: dict[str, UserContextState] = {}


class ContextManager:
    """Tracks active_chat_agent and last_generated_media_reference per user."""

    @staticmethod
    def _state(user_id: str) -> UserContextState:
        if user_id not in _states:
            _states[user_id] = UserContextState(user_id=user_id)
        return _states[user_id]

    @classmethod
    def set_active_chat_agent(cls, user_id: str, agent_id: str) -> None:
        cls._state(user_id).active_chat_agent = (agent_id or "sovereign-core").strip().lower()

    @classmethod
    def get_active_chat_agent(cls, user_id: str) -> str:
        return cls._state(user_id).active_chat_agent

    @classmethod
    def set_last_generated_media(
        cls,
        user_id: str,
        *,
        url: str,
        prompt: str,
        media_type: str = "image",
        subject_hint: str = "",
        provider: str = "pollinations",
    ) -> MediaReference:
        ref = MediaReference(
            url=url,
            prompt=prompt,
            media_type=media_type,
            subject_hint=subject_hint,
            provider=provider,
        )
        cls._state(user_id).last_generated_media_reference = ref
        return ref

    @classmethod
    def get_last_generated_media(cls, user_id: str) -> Optional[MediaReference]:
        return cls._state(user_id).last_generated_media_reference

    @classmethod
    def snapshot(cls, user_id: str) -> dict:
        st = cls._state(user_id)
        ref = st.last_generated_media_reference
        return {
            "user_id": user_id,
            "active_chat_agent": st.active_chat_agent,
            "last_generated_media_reference": (
                {
                    "url": ref.url,
                    "prompt": ref.prompt,
                    "media_type": ref.media_type,
                    "subject_hint": ref.subject_hint,
                    "provider": ref.provider,
                }
                if ref
                else None
            ),
        }
