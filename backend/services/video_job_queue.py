"""
In-memory async video render jobs — progress polling for frontend.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Optional

ProgressFn = Callable[[str, int], None]

_jobs: dict[str, "VideoJob"] = {}


@dataclass
class VideoJob:
    id: str
    user_id: str
    status: str = "queued"  # queued | processing | completed | failed
    progress: int = 0
    message: str = "Queued for cinematic render…"
    video_url: str | None = None
    result: dict[str, Any] | None = None
    error: str | None = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)


def create_job(user_id: str) -> VideoJob:
    job = VideoJob(id=str(uuid.uuid4()), user_id=user_id)
    _jobs[job.id] = job
    return job


def get_job(job_id: str) -> VideoJob | None:
    return _jobs.get(job_id)


def job_snapshot(job_id: str) -> dict[str, Any] | None:
    job = get_job(job_id)
    if not job:
        return None
    return {
        "job_id": job.id,
        "status": job.status,
        "progress": job.progress,
        "message": job.message,
        "video_url": job.video_url,
        "error": job.error,
        "result": job.result,
    }


def update_job(job_id: str, *, message: str | None = None, progress: int | None = None) -> None:
    job = _jobs.get(job_id)
    if not job:
        return
    if message is not None:
        job.message = message
    if progress is not None:
        job.progress = max(0, min(100, progress))
    job.status = "processing"
    job.updated_at = time.time()


def complete_job(job_id: str, result: dict[str, Any]) -> None:
    job = _jobs.get(job_id)
    if not job:
        return
    job.status = "completed"
    job.progress = 100
    job.message = "Cinematic video ready"
    job.result = result
    job.video_url = result.get("video_url")
    job.updated_at = time.time()


def fail_job(job_id: str, error: str) -> None:
    job = _jobs.get(job_id)
    if not job:
        return
    job.status = "failed"
    job.error = error
    job.message = error[:500]
    job.updated_at = time.time()


def progress_callback_for_job(job_id: str | None) -> ProgressFn | None:
    if not job_id:
        return None

    def _cb(message: str, progress: int) -> None:
        update_job(job_id, message=message, progress=progress)

    return _cb
