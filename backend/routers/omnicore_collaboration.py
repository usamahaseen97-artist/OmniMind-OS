"""
OmniCore Collaboration API — Phase 5 enterprise org, permissions & admin stubs."""



from __future__ import annotations

import logging

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter

from lib.enterprise.dependencies import platform_router_dependencies
from schemas.platform_enterprise import InviteBody, OrganizationsSaveBody, PermissionCheckBody

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/collaboration",
    tags=["omnicore-collaboration"],
    dependencies=platform_router_dependencies(),
)

_organizations: list[dict[str, Any]] = [
    {
        "id": "org-1",
        "name": "OmniMind Labs",
        "slug": "omnimind-labs",
        "plan": "enterprise",
        "memberCount": 12,
        "settings": {"timezone": "UTC"},
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
]
_members: list[dict[str, Any]] = [
    {
        "id": "mem-1",
        "orgId": "org-1",
        "userId": "user-1",
        "email": "admin@omnimind.io",
        "name": "Admin User",
        "role": "owner",
        "customRoleId": None,
        "status": "active",
    }
]
_workspaces: list[dict[str, Any]] = [
    {
        "id": "ows-1",
        "orgId": "org-1",
        "name": "Product Team",
        "projectIds": ["uproj-001"],
        "storageUsedBytes": 2_400_000_000,
        "memberIds": ["mem-1"],
    }
]
_invitations: list[dict[str, Any]] = []
_activity: list[dict[str, Any]] = [
    {
        "id": "evt-1",
        "orgId": "org-1",
        "kind": "project",
        "action": "project.created",
        "actorId": "user-1",
        "targetId": "uproj-001",
        "summary": "Created project OmniCore Foundation",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
]
_audit: list[dict[str, Any]] = []
_notifications: list[dict[str, Any]] = []

_ROLE_PERMISSIONS: dict[str, list[str]] = {
    "owner": ["org:read", "org:write", "org:admin", "api-key:manage"],
    "administrator": ["org:read", "org:write", "org:admin"],
    "editor": ["project:read", "project:write", "comment:write"],
    "viewer": ["project:read"],
}


@router.get("/organizations")
def list_organizations() -> dict[str, Any]:
    return {"ok": True, "organizations": _organizations}


@router.put("/organizations")
def save_organizations(body: OrganizationsSaveBody) -> dict[str, Any]:
    global _organizations
    _organizations = body.organizations
    return {"ok": True}


@router.get("/organizations/{org_id}/members")
def list_members(org_id: str) -> dict[str, Any]:
    return {"ok": True, "members": [m for m in _members if m.get("orgId") == org_id]}


@router.get("/organizations/{org_id}/workspaces")
def list_workspaces(org_id: str) -> dict[str, Any]:
    return {"ok": True, "workspaces": [w for w in _workspaces if w.get("orgId") == org_id]}


@router.post("/invites")
def create_invite(body: InviteBody) -> dict[str, Any]:
    inv = {
        "id": f"inv-{uuid4().hex[:8]}",
        "orgId": body.orgId,
        "email": body.email,
        "role": body.role,
        "status": "pending",
        "invitedAt": datetime.now(timezone.utc).isoformat(),
    }
    _invitations.append(inv)
    return {"ok": True, "invitation": inv}


@router.get("/activity/{org_id}")
def list_activity(org_id: str) -> dict[str, Any]:
    return {"ok": True, "events": [e for e in _activity if e.get("orgId") == org_id]}


@router.get("/audit/{org_id}")
def list_audit(org_id: str) -> dict[str, Any]:
    return {"ok": True, "entries": [a for a in _audit if a.get("orgId") == org_id]}


@router.post("/permissions/check")
def check_permission(body: PermissionCheckBody) -> dict[str, Any]:
    member = next(
        (m for m in _members if m.get("userId") == body.userId and m.get("orgId") == body.orgId),
        None,
    )
    if not member:
        return {"ok": True, "allowed": False}
    role = member.get("role", "viewer")
    perms = _ROLE_PERMISSIONS.get(role, [])
    return {"ok": True, "allowed": body.permission in perms}


@router.get("/notifications/{user_id}")
def list_notifications(user_id: str) -> dict[str, Any]:
    return {"ok": True, "notifications": [n for n in _notifications if n.get("userId") == user_id]}


@router.get("/admin/{org_id}/dashboard")
def admin_dashboard(org_id: str) -> dict[str, Any]:
    org = next((o for o in _organizations if o.get("id") == org_id), None)
    members = [m for m in _members if m.get("orgId") == org_id]
    workspaces = [w for w in _workspaces if w.get("orgId") == org_id]
    storage = sum(w.get("storageUsedBytes", 0) for w in workspaces)
    return {
        "ok": True,
        "dashboard": {
            "org": org,
            "memberCount": len(members),
            "workspaceCount": len(workspaces),
            "storageBytes": storage,
        },
    }
