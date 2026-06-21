"""
Visual Context Manager — multi-turn image reference, media IDs, subject segmentation.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional

from services.context_manager import ContextManager, MediaReference
from services.subject_segmentation import default_portrait_segmentation, normalize_segmentation


@dataclass
class VisualMediaReference(MediaReference):
    media_id: str = ""
    subject_segmentation: dict[str, Any] = field(default_factory=default_portrait_segmentation)
    background_description: str = ""


_registry: dict[str, tuple[str, VisualMediaReference]] = {}
_user_last_media_id: dict[str, str] = {}


class VisualContextManager:
    @classmethod
    def set_active_chat_agent(cls, user_id: str, agent_id: str) -> None:
        ContextManager.set_active_chat_agent(user_id, agent_id)

    @classmethod
    def get_active_chat_agent(cls, user_id: str) -> str:
        return ContextManager.get_active_chat_agent(user_id)

    @classmethod
    def register_media(
        cls,
        user_id: str,
        *,
        url: str,
        prompt: str,
        subject_hint: str = "",
        provider: str = "pollinations",
        subject_segmentation: dict[str, Any] | None = None,
        background_description: str = "",
        media_id: str | None = None,
    ) -> VisualMediaReference:
        mid = media_id or str(uuid.uuid4())
        seg = normalize_segmentation(subject_segmentation)
        ref = VisualMediaReference(
            url=url,
            prompt=prompt,
            media_type="image",
            subject_hint=subject_hint,
            provider=provider,
            media_id=mid,
            subject_segmentation=seg,
            background_description=background_description,
        )
        _registry[mid] = (user_id, ref)
        _user_last_media_id[user_id] = mid
        ContextManager.set_last_generated_media(
            user_id,
            url=url,
            prompt=prompt,
            subject_hint=subject_hint,
            provider=provider,
        )
        return ref

    @classmethod
    def get_media(cls, media_id: str) -> Optional[VisualMediaReference]:
        entry = _registry.get(media_id)
        return entry[1] if entry else None

    @classmethod
    def get_last_media(cls, user_id: str) -> Optional[VisualMediaReference]:
        mid = _user_last_media_id.get(user_id)
        if mid and mid in _registry:
            return _registry[mid][1]
        base = ContextManager.get_last_generated_media(user_id)
        if not base:
            return None
        return VisualMediaReference(
            url=base.url,
            prompt=base.prompt,
            subject_hint=base.subject_hint,
            provider=base.provider,
            media_id="",
            subject_segmentation=default_portrait_segmentation(),
        )

    @classmethod
    def build_inpaint_payload(
        cls,
        user_id: str,
        message: str,
        *,
        reference_media_id: str | None = None,
        background_description: str | None = None,
        subject_segmentation: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        ref = (
            cls.get_media(reference_media_id)
            if reference_media_id
            else cls.get_last_media(user_id)
        )
        if not ref:
            return {
                "mode": "generate",
                "message": message,
                "reference_media_id": None,
            }
        bg = (background_description or message).strip()
        seg = normalize_segmentation(subject_segmentation or ref.subject_segmentation)
        return {
            "mode": "inpaint",
            "message": message,
            "reference_media_id": ref.media_id or reference_media_id,
            "reference_image_url": ref.url,
            "background_description": bg,
            "subject_segmentation": seg,
            "subject_hint": ref.subject_hint,
            "source_prompt": ref.prompt,
        }

    @classmethod
    def snapshot(cls, user_id: str) -> dict[str, Any]:
        snap = ContextManager.snapshot(user_id)
        last = cls.get_last_media(user_id)
        snap["visual_context"] = (
            {
                "media_id": last.media_id,
                "url": last.url,
                "subject_segmentation": last.subject_segmentation,
                "subject_hint": last.subject_hint,
            }
            if last
            else None
        )
        return snap
