"""OmniCloud platform persistence and sync."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from lib.omnicore_store import append_list_item, load, load_list, save

ACCOUNT_KEY = "omnicloud_account"
DEVICES_KEY = "omnicloud_devices"
SNAPSHOTS_KEY = "omnicloud_snapshots"
MEMORY_KEY = "omnicloud_memory"
JOBS_KEY = "omnicloud_jobs"
OFFLINE_QUEUE_KEY = "omnicloud_offline_queue"
SYNC_LOG_KEY = "omnicloud_sync_log"

SYNC_DOMAINS = [
    "projects",
    "ai-chats",
    "ai-memory",
    "settings",
    "themes",
    "plugins",
    "sdk",
    "templates",
    "assets",
    "images",
    "videos",
    "music",
    "documents",
    "workspaces",
    "shortcuts",
    "preferences",
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def default_account() -> dict[str, Any]:
    return {
        "id": "omnimind-user",
        "email": "user@omnimind.cloud",
        "displayName": "OmniMind User",
        "plan": "pro",
        "devices": load_list(DEVICES_KEY),
        "sessions": [],
    }


def get_account() -> dict[str, Any]:
    return load(ACCOUNT_KEY, default_account())


def register_device(device: dict[str, Any]) -> dict[str, Any]:
    entry = {
        "id": f"dev-{uuid4().hex[:8]}",
        "name": device.get("name", "Device"),
        "kind": device.get("kind", "web"),
        "trusted": bool(device.get("trusted", True)),
        "lastSeenAt": _now(),
        "fingerprint": device.get("fingerprint", ""),
    }
    devices = load_list(DEVICES_KEY)
    devices = [d for d in devices if d.get("fingerprint") != entry["fingerprint"]]
    devices.insert(0, entry)
    save(DEVICES_KEY, devices)
    account = get_account()
    account["devices"] = devices
    save(ACCOUNT_KEY, account)
    return entry


def sync_domains(domains: list[str] | None = None) -> list[dict[str, Any]]:
    selected = domains or SYNC_DOMAINS
    results: list[dict[str, Any]] = []
    for domain in selected:
        result = {
            "domain": domain,
            "status": "synced",
            "itemCount": len(load_list(f"sync_{domain}")) if domain in ("projects", "assets") else 1,
            "at": _now(),
        }
        results.append(result)
        append_list_item(SYNC_LOG_KEY, result, max_items=200)
    return results


def list_snapshots(project_id: str) -> list[dict[str, Any]]:
    items = load_list(SNAPSHOTS_KEY)
    return [s for s in items if s.get("projectId") == project_id]


def save_snapshot(project_id: str, label: str | None = None) -> dict[str, Any]:
    snap = {
        "id": f"snap-{uuid4().hex[:8]}",
        "projectId": project_id,
        "version": len(list_snapshots(project_id)) + 1,
        "label": label or f"Snapshot {_now()}",
        "createdAt": _now(),
        "sizeBytes": 0,
    }
    append_list_item(SNAPSHOTS_KEY, snap, max_items=500)
    return snap


def restore_snapshot(project_id: str, snapshot_id: str) -> bool:
    snaps = list_snapshots(project_id)
    return any(s.get("id") == snapshot_id for s in snaps)


def list_memory(scope: str | None = None) -> list[dict[str, Any]]:
    items = load_list(MEMORY_KEY)
    if scope:
        return [e for e in items if e.get("scope") == scope]
    return items


def save_memory(entries: list[dict[str, Any]]) -> bool:
    save(MEMORY_KEY, entries)
    return True


def list_jobs() -> list[dict[str, Any]]:
    return load_list(JOBS_KEY)


def enqueue_job(kind: str, label: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    from lib.omnicloud.remote_executor import start_job

    return start_job(kind, label, payload or {})


def storage_buckets() -> list[dict[str, Any]]:
    quota = 50 * 1024**3
    used = sum(e.get("sizeBytes", 0) for e in load_list(SNAPSHOTS_KEY))
    return [
        {"id": "files", "kind": "files", "usedBytes": used, "quotaBytes": quota, "cdnEnabled": True},
        {"id": "assets", "kind": "assets", "usedBytes": used, "quotaBytes": quota * 2, "cdnEnabled": True},
        {"id": "media", "kind": "media", "usedBytes": used // 2, "quotaBytes": quota * 4, "cdnEnabled": True},
        {"id": "backup", "kind": "backup", "usedBytes": used // 3, "quotaBytes": quota, "cdnEnabled": False},
        {"id": "encrypted", "kind": "encrypted", "usedBytes": used // 4, "quotaBytes": quota, "cdnEnabled": False},
    ]


def admin_dashboard() -> dict[str, Any]:
    account = get_account()
    buckets = storage_buckets()
    return {
        "usage": {
            "storageBytes": sum(b["usedBytes"] for b in buckets),
            "bandwidthBytes": 0,
            "apiCalls": len(load_list(SYNC_LOG_KEY)),
        },
        "devices": len(account.get("devices", [])),
        "organizations": 1,
        "subscriptions": [{"plan": account.get("plan", "pro"), "active": True}],
        "securityEvents": 0,
    }


def push_offline_queue(item: dict[str, Any]) -> dict[str, Any]:
    entry = {**item, "id": f"off-{uuid4().hex[:8]}", "queuedAt": _now()}
    append_list_item(OFFLINE_QUEUE_KEY, entry, max_items=200)
    return entry
