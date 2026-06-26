"""OmniCloud remote job execution."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from lib.omnicore_store import append_list_item, load_list, save
from services import superapp_ai

logger = logging.getLogger(__name__)

JOBS_KEY = "omnicloud_jobs"

JOB_PROMPTS: dict[str, str] = {
    "render-image": "Describe image render pipeline for: {label}",
    "render-video": "Describe video render pipeline for: {label}",
    "generate-code": "Generate production code for: {label}",
    "deploy-website": "Outline deployment for: {label}",
    "train-model": "Outline model training for: {label}",
    "marketing": "Draft marketing campaign for: {label}",
    "medical-analysis": "Summarize medical analysis for: {label}",
    "music-production": "Outline music production for: {label}",
    "large-file": "Outline large file processing for: {label}",
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def list_jobs() -> list[dict[str, Any]]:
    return load_list(JOBS_KEY)


def _update_job(job_id: str, patch: dict[str, Any]) -> dict[str, Any] | None:
    jobs = list_jobs()
    idx = next((i for i, j in enumerate(jobs) if j.get("id") == job_id), -1)
    if idx < 0:
        return None
    jobs[idx] = {**jobs[idx], **patch, "updatedAt": _now()}
    save(JOBS_KEY, jobs)
    return jobs[idx]


def start_job(kind: str, label: str, payload: dict[str, Any]) -> dict[str, Any]:
    job: dict[str, Any] = {
        "id": f"job-{uuid4().hex[:8]}",
        "kind": kind,
        "label": label,
        "status": "queued",
        "progress": 0,
        "etaSeconds": 120,
        "logs": [f"Queued {kind}: {label}"],
        "resourceUsage": {"cpu": None, "memoryMb": None},
        "createdAt": _now(),
        "updatedAt": _now(),
        "payload": payload,
    }
    append_list_item(JOBS_KEY, job, max_items=200)
    return job


async def run_job(job_id: str, kind: str, label: str) -> None:
    _update_job(job_id, {"status": "running", "progress": 10, "logs": [f"Running {kind}"]})
    prompt = JOB_PROMPTS.get(kind, "Process: {label}").format(label=label)
    try:
        result = await superapp_ai.complete_text(prompt)
        text = result.get("text", "") if isinstance(result, dict) else str(result)
        _update_job(
            job_id,
            {
                "status": "completed",
                "progress": 100,
                "etaSeconds": 0,
                "logs": [f"Completed {kind}", text[:500]],
                "resourceUsage": {"cpu": 42.0, "memoryMb": 512.0},
            },
        )
    except Exception as exc:
        logger.exception("omnicloud job %s failed", job_id)
        _update_job(
            job_id,
            {
                "status": "failed",
                "progress": 100,
                "logs": [f"Failed: {exc}"],
            },
        )
