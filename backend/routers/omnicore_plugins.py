"""
OmniCore Extension Platform API — Phase 4 plugin SDK stubs."""



from __future__ import annotations

import logging

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter

from lib.enterprise.dependencies import platform_router_dependencies
from schemas.platform_enterprise import PluginInstallBody, PluginUninstallBody, RegistrySaveBody, VersionSaveBody

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/omnicore/plugins",
    tags=["omnicore-plugins"],
    dependencies=platform_router_dependencies(),
)

_registry: list[dict[str, Any]] = [
    {"id": "ext-theme-dark-pro", "name": "Dark Pro Theme", "version": "1.0.0", "type": "theme", "verified": True, "enabled": True},
    {"id": "ext-ai-assistant-plus", "name": "AI Assistant Plus", "version": "2.1.0", "type": "ai", "verified": True, "enabled": False},
]
_marketplace: list[dict[str, Any]] = [
    {"id": "lst-1", "pluginId": "ext-theme-dark-pro", "price": 0, "enterprise": False, "downloads": 5000},
]
_developers: list[dict[str, Any]] = [
    {"id": "dev-omnimind", "name": "OmniMind Official", "verified": True},
]
_analytics: dict[str, dict[str, Any]] = {}
_versions: dict[str, list[dict[str, Any]]] = {}


@router.get("/registry")
def list_registry() -> dict[str, Any]:
    return {"ok": True, "plugins": _registry}


@router.put("/registry")
def save_registry(body: RegistrySaveBody) -> dict[str, Any]:
    global _registry
    _registry = body.registry
    return {"ok": True}


@router.get("/marketplace")
def browse_marketplace() -> dict[str, Any]:
    return {"ok": True, "listings": _marketplace, "developers": _developers}


@router.post("/install")
def install_plugin(body: PluginInstallBody) -> dict[str, Any]:
    for p in _registry:
        if p.get("id") == body.pluginId:
            p["enabled"] = True
            _analytics.setdefault(body.pluginId, {"activations": 0, "errors": 0})
            _analytics[body.pluginId]["activations"] = _analytics[body.pluginId].get("activations", 0) + 1
            return {"ok": True, "plugin": p}
    return {"ok": False, "error": "Plugin not found"}


@router.post("/uninstall")
def uninstall_plugin(body: PluginUninstallBody) -> dict[str, Any]:
    for p in _registry:
        if p.get("id") == body.pluginId:
            p["enabled"] = False
            return {"ok": True}
    return {"ok": False}


@router.get("/developers")
def list_developers() -> dict[str, Any]:
    return {"ok": True, "developers": _developers}


@router.get("/analytics/{plugin_id}")
def plugin_analytics(plugin_id: str) -> dict[str, Any]:
    return {"ok": True, "analytics": _analytics.get(plugin_id, {"activations": 0, "errors": 0})}


@router.get("/versions/{plugin_id}")
def plugin_versions(plugin_id: str) -> dict[str, Any]:
    return {"ok": True, "versions": _versions.get(plugin_id, [])}


@router.post("/versions")
def save_version(body: VersionSaveBody) -> dict[str, Any]:
    payload = body.model_dump()
    pid = payload.get("pluginId", "")
    payload["savedAt"] = datetime.now(timezone.utc).isoformat()
    _versions.setdefault(pid, []).insert(0, payload)
    return {"ok": True}
