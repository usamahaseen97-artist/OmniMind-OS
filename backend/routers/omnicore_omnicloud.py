"""
OmniCloud Platform API — V2.0 cloud-native AI platform."""



from __future__ import annotations

import logging

from typing import Any

from fastapi import APIRouter, BackgroundTasks

from lib.enterprise.dependencies import platform_router_dependencies
from lib.omnicloud import store
from lib.omnicloud.remote_executor import list_jobs, run_job
from schemas.platform_enterprise import (
    ConflictResolveBody,
    MemoryCloudBody,
    OfflineQueueBody,
    RemoteJobBody,
    SnapshotBody,
    SyncBody,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/omnicloud",
    tags=["omnicore-omnicloud"],
    dependencies=platform_router_dependencies(),
)


@router.get("/account")
def cloud_account() -> dict[str, Any]:
    return {"ok": True, "account": store.get_account()}


@router.post("/devices")
def cloud_register_device(body: EnterpriseDocument) -> dict[str, Any]:
    device = store.register_device(body)
    return {"ok": True, "device": device}


@router.post("/sync")
def cloud_sync_all(body: SyncBody | None = None) -> dict[str, Any]:
    domains = body.model_dump().get("domains") if body else None
    results = store.sync_domains(domains)
    return {"ok": True, "results": results}


@router.post("/sync/{domain}")
def cloud_sync_domain(domain: str) -> dict[str, Any]:
    results = store.sync_domains([domain])
    result = results[0] if results else {"domain": domain, "status": "synced", "itemCount": 0, "at": ""}
    return {"ok": True, "result": result}


@router.post("/sync/conflicts/resolve")
def cloud_resolve_conflict(body: ConflictResolveBody) -> dict[str, Any]:
    return {"ok": True, "domain": body.model_dump().get("domain")}


@router.get("/projects/{project_id}/snapshots")
def cloud_list_snapshots(project_id: str) -> dict[str, Any]:
    return {"ok": True, "snapshots": store.list_snapshots(project_id)}


@router.post("/projects/{project_id}/snapshots")
def cloud_save_snapshot(project_id: str, body: SnapshotBody | None = None) -> dict[str, Any]:
    label = body.model_dump().get("label") if body else None
    snap = store.save_snapshot(project_id, label)
    return {"ok": True, "snapshot": snap}


@router.post("/projects/{project_id}/snapshots/{snapshot_id}/restore")
def cloud_restore_snapshot(project_id: str, snapshot_id: str) -> dict[str, Any]:
    ok = store.restore_snapshot(project_id, snapshot_id)
    return {"ok": ok}


@router.get("/memory")
def cloud_list_memory(scope: str | None = None) -> dict[str, Any]:
    return {"ok": True, "entries": store.list_memory(scope)}


@router.put("/memory")
def cloud_save_memory(body: MemoryCloudBody) -> dict[str, Any]:
    store.save_memory(body.entries)
    return {"ok": True}


@router.post("/remote/jobs")
async def cloud_enqueue_job(body: RemoteJobBody, background_tasks: BackgroundTasks) -> dict[str, Any]:
    payload = body.model_dump()
    job = store.enqueue_job(
        str(payload.get("kind", "large-file")),
        str(payload.get("label", "Remote job")),
        payload.get("payload") if isinstance(payload.get("payload"), dict) else {},
    )
    background_tasks.add_task(run_job, job["id"], job["kind"], job["label"])
    return {"ok": True, "job": job}


@router.get("/remote/jobs")
def cloud_list_jobs() -> dict[str, Any]:
    return {"ok": True, "jobs": list_jobs()}


@router.get("/storage")
def cloud_storage() -> dict[str, Any]:
    return {"ok": True, "buckets": store.storage_buckets()}


@router.get("/admin/dashboard")
def cloud_admin_dashboard() -> dict[str, Any]:
    return {"ok": True, "dashboard": store.admin_dashboard()}


@router.post("/offline/queue")
def cloud_offline_queue(body: OfflineQueueBody) -> dict[str, Any]:
    entry = store.push_offline_queue(body.model_dump())
    return {"ok": True, "item": entry}
