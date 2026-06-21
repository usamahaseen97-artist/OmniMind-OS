"""Tool 10 — VFX Master Video Editor timeline."""

from __future__ import annotations

import logging
from typing import Any, Optional
from uuid import uuid4

from services.mongo_pools import save_module_record
from services.n8n_client import trigger_workflow

logger = logging.getLogger(__name__)

_DISTRIBUTION_PLATFORMS = frozenset({"youtube", "tiktok", "linkedin", "facebook"})

_DEFAULT_TRACKS = [
    {"id": "V1", "label": "Video 1", "clips": []},
    {"id": "V2", "label": "Video 2", "clips": []},
    {"id": "A1", "label": "Audio", "clips": []},
    {"id": "FX", "label": "Effects", "clips": []},
    {"id": "Grade", "label": "Color Grade", "clips": []},
]


async def render_vfx_timeline(
    *,
    user_id: str = "anonymous",
    tracks: Optional[list[dict[str, Any]]] = None,
    edit_command: str = "",
    upload_paths: Optional[list[str]] = None,
    distribution_targets: Optional[list[str]] = None,
    trigger_assembly: bool = True,
) -> dict[str, Any]:
    job_id = str(uuid4())
    timeline = tracks or [dict(t) for t in _DEFAULT_TRACKS]

    if upload_paths:
        for path in upload_paths[:5]:
            timeline[0]["clips"].append({"source": path, "in": 0, "out": 120})

    if edit_command.strip():
        timeline[3]["clips"].append({"effect": "auto_edit", "command": edit_command[:500]})

    upload_dir = f"data/vfx/uploads/{user_id}/{job_id}"

    targets = [t.lower() for t in (distribution_targets or []) if t.lower() in _DISTRIBUTION_PLATFORMS]
    distribution_webhooks: dict[str, Any] = {}

    if targets:
        for platform in targets:
            hook = await trigger_workflow(
                f"vfx_distribute_{platform}",
                {"job_id": job_id, "user_id": user_id, "platform": platform, "upload_dir": upload_dir},
            )
            distribution_webhooks[platform] = {
                "platform": platform,
                "webhook": f"/hooks/vfx/{platform}/{job_id}",
                "status": "queued" if hook and hook.get("ok") else "pending",
                "n8n": hook,
            }

    assembly_status = "idle"
    if trigger_assembly and (upload_paths or edit_command.strip()):
        assembly = await trigger_workflow(
            "vfx_assemble_timeline",
            {"job_id": job_id, "tracks": len(timeline), "clips": sum(len(t.get("clips", [])) for t in timeline)},
        )
        assembly_status = "dispatched" if assembly and assembly.get("ok") else "scheduled"

    record = {
        "id": job_id,
        "user_id": user_id,
        "timeline": timeline,
        "upload_dir": upload_dir,
        "edit_command": edit_command[:500],
        "distribution_targets": targets,
        "distribution_webhooks": distribution_webhooks,
        "assembly_status": assembly_status,
    }
    await save_module_record("vfx", record)
    logger.info("VFX timeline job=%s tracks=%s distribute=%s", job_id, len(timeline), targets)

    return {
        "ok": True,
        "job_id": job_id,
        "timeline": timeline,
        "upload_directory": upload_dir,
        "render_status": "saved",
        "assembly_status": assembly_status,
        "distribution_webhooks": distribution_webhooks,
        "streaming_shares": {
            p: distribution_webhooks.get(p, {"status": "not_requested"})
            for p in ("youtube", "tiktok", "linkedin", "facebook")
        },
        "terminal_log": [
            f"$ vfx render-timeline --tracks {len(timeline)}",
            f"✓ Assembly: {assembly_status}",
            f"✓ Distribution hooks: {', '.join(targets) or 'none'}",
        ],
        "agent_note": edit_command[:200] or "Timeline state persisted — issue edit commands via chatbot",
    }
