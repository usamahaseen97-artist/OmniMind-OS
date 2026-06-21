"""
OmniMind V11 — spatial architecture runtime (external + interior pipelines).
Isolated from dev code sandboxes; async-safe texture resolution.
"""

from __future__ import annotations

import asyncio
import json
import logging
import math
import uuid
import zipfile
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any, Literal

from services.architecture_blueprint import parse_architecture_specs, render_blueprint_svg
from services.tools.architect_tool import _recommendations, _spatial_matrix

logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
BLUEPRINT_VAULT = _BACKEND_ROOT / "data" / "spatial_blueprints"
EXPORT_VAULT = _BACKEND_ROOT / "data" / "spatial_exports"

SpatialModule = Literal["external", "interior"]
RenderMode = Literal["matrix", "cinematic"]

PBR_TEXTURES: dict[str, dict[str, str]] = {
    "marble": {
        "albedo": "https://cdn.polyhaven.com/asset_img/thumbs/marble_01.png",
        "normal": "https://cdn.polyhaven.com/asset_img/thumbs/rock_face.png",
        "roughness": "0.22",
    },
    "oak": {
        "albedo": "https://cdn.polyhaven.com/asset_img/thumbs/wood_floor.png",
        "normal": "https://cdn.polyhaven.com/asset_img/thumbs/wood_table.png",
        "roughness": "0.45",
    },
    "glass": {
        "albedo": "https://cdn.polyhaven.com/asset_img/thumbs/glass_block.png",
        "ior": "1.52",
        "roughness": "0.04",
    },
    "concrete": {
        "albedo": "https://cdn.polyhaven.com/asset_img/thumbs/concrete_floor.png",
        "roughness": "0.68",
    },
    "fabric": {
        "albedo": "https://cdn.polyhaven.com/asset_img/thumbs/fabric_pattern_07.png",
        "roughness": "0.82",
    },
}

EXTERIOR_ARCHETYPES = {
    "villa": {"label": "Luxury Villa", "massing": [2.8, 1.4, 2.2], "elevation": 3.2},
    "mall": {"label": "Commercial Mall", "massing": [5.5, 2.8, 4.2], "elevation": 2.4},
    "office": {"label": "Office Frontage", "massing": [4.0, 1.6, 3.0], "elevation": 2.8},
}

INTERIOR_ARCHETYPES = {
    "living": {"label": "Living Zone", "partition": [3.2, 2.6], "material": "fabric"},
    "kitchen": {"label": "Kitchen Layout", "partition": [2.4, 2.0], "material": "marble"},
    "bedroom": {"label": "Bedroom Suite", "partition": [2.8, 2.4], "material": "oak"},
}

# In-memory session trees (WebSocket coordination)
_sessions: dict[str, dict[str, Any]] = {}

DEFAULT_RENDER_DIALOG: dict[str, Any] = {
    "duration": 15,
    "transition": 3,
    "resolution": "1080p",
    "quality_samples": 256,
}


def _default_camera_path() -> dict[str, Any]:
    return {
        "start": {"x": -4.2, "y": 2.8, "z": 5.5, "fov": 52},
        "end": {"x": 2.1, "y": 1.9, "z": -3.2, "fov": 48},
    }


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _vec(x: float, y: float, z: float) -> dict[str, float]:
    return {"x": round(x, 4), "y": round(y, 4), "z": round(z, 4)}


def _detect_archetype(prompt: str, module: SpatialModule) -> str:
    low = prompt.lower()
    if module == "external":
        if any(k in low for k in ("mall", "commercial", "retail")):
            return "mall"
        if any(k in low for k in ("office", "frontage", "corporate")):
            return "office"
        return "villa"
    if "kitchen" in low:
        return "kitchen"
    if "bed" in low:
        return "bedroom"
    return "living"


async def _resolve_textures(material_keys: list[str]) -> dict[str, Any]:
    """Async texture lookup — prevents blocking the event loop."""
    await asyncio.sleep(0)  # yield control
    resolved: dict[str, Any] = {}
    for key in material_keys:
        if key in PBR_TEXTURES:
            resolved[key] = await asyncio.to_thread(lambda k=key: dict(PBR_TEXTURES[k]))
    return resolved


def _build_exterior_nodes(specs: dict[str, Any], archetype: str) -> list[dict[str, Any]]:
    arch = EXTERIOR_ARCHETYPES[archetype]
    w, d, h = arch["massing"]
    nodes: list[dict[str, Any]] = [
        {
            "id": "massing_primary",
            "type": "volume",
            "label": arch["label"],
            "layer": "exterior",
            "position": _vec(0, h / 2, 0),
            "scale": _vec(w, h, d),
            "rotation": _vec(0, 0, 0),
            "elevation_scale": arch["elevation"],
        },
        {
            "id": "facade_glazing",
            "type": "glazing",
            "label": "Curtain Wall",
            "layer": "exterior",
            "position": _vec(0, h * 0.55, d / 2 + 0.02),
            "scale": _vec(w * 0.82, h * 0.45, 0.08),
            "rotation": _vec(0, 0, 0),
        },
    ]
    if specs.get("courtyard") or "pool" in str(specs).lower():
        nodes.append(
            {
                "id": "pool_volume",
                "type": "pool",
                "label": "Pool Deck",
                "layer": "landscape",
                "position": _vec(0, 0.05, d * 0.65),
                "scale": _vec(w * 0.42, 0.1, d * 0.28),
                "rotation": _vec(0, 0, 0),
            }
        )
    nodes.append(
        {
            "id": "landscape_ring",
            "type": "landscape",
            "label": "Perimeter Landscape",
            "layer": "landscape",
            "position": _vec(0, 0, 0),
            "scale": _vec(w * 1.35, 0.02, d * 1.35),
            "rotation": _vec(0, 0, 0),
        }
    )
    return nodes


def _build_interior_nodes(specs: dict[str, Any], archetype: str) -> list[dict[str, Any]]:
    arch = INTERIOR_ARCHETYPES[archetype]
    pw, pd = arch["partition"]
    matrix = _spatial_matrix(specs)
    nodes: list[dict[str, Any]] = []
    for i, cell in enumerate(matrix):
        nodes.append(
            {
                "id": cell["id"],
                "type": "partition",
                "label": cell["label"],
                "layer": "interior",
                "position": _vec(cell["x"] + cell["w"] / 2, 1.2, cell["y"] + cell["h"] / 2),
                "scale": _vec(cell["w"] / 10, 2.4, cell["h"] / 10),
                "rotation": _vec(0, 0, 0),
                "material": arch["material"] if i == 0 else "fabric",
            }
        )
    furniture_layout = [
        ("sofa_matrix", "Sofa", -pw * 0.25, 0.4, -pd * 0.15),
        ("dining_matrix", "Dining", pw * 0.2, 0.4, pd * 0.1),
        ("light_rig_a", "Accent Light", 0, 2.1, 0),
    ]
    for fid, label, x, y, z in furniture_layout:
        nodes.append(
            {
                "id": fid,
                "type": "furniture",
                "label": label,
                "layer": "interior",
                "position": _vec(x, y, z),
                "scale": _vec(0.8, 0.8, 0.8),
                "rotation": _vec(0, math.degrees(math.atan2(z, x + 0.001)), 0),
                "material": "oak" if "dining" in fid else "fabric",
            }
        )
    return nodes


def _wireframe_vectors(nodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []
    for n in nodes:
        p = n["position"]
        s = n["scale"]
        hx, hy, hz = s["x"] / 2, s["y"] / 2, s["z"] / 2
        corners = [
            _vec(p["x"] - hx, p["y"] - hy, p["z"] - hz),
            _vec(p["x"] + hx, p["y"] - hy, p["z"] - hz),
            _vec(p["x"] + hx, p["y"] + hy, p["z"] - hz),
            _vec(p["x"] - hx, p["y"] + hy, p["z"] - hz),
            _vec(p["x"] - hx, p["y"] - hy, p["z"] + hz),
            _vec(p["x"] + hx, p["y"] - hy, p["z"] + hz),
            _vec(p["x"] + hx, p["y"] + hy, p["z"] + hz),
            _vec(p["x"] - hx, p["y"] + hy, p["z"] + hz),
        ]
        wire_pairs = [(0, 1), (1, 2), (2, 3), (3, 0), (4, 5), (5, 6), (6, 7), (7, 4), (0, 4), (1, 5), (2, 6), (3, 7)]
        for a, b in wire_pairs:
            edges.append({"from": corners[a], "to": corners[b], "node_id": n["id"]})
    return edges


def _illumination_for_mode(mode: RenderMode, module: SpatialModule) -> dict[str, Any]:
    if mode == "matrix":
        return {
            "ambient": 0.55,
            "directional": 0.75,
            "ray_tracing_level": 0,
            "exposure": 1.0,
            "atmosphere": "grid",
        }
    return {
        "ambient": 0.28,
        "directional": 1.15,
        "ray_tracing_level": 3 if module == "interior" else 2,
        "exposure": 1.12,
        "atmosphere": "golden_hour_interior" if module == "interior" else "cinematic_exterior",
        "ssao": True,
        "bloom": 0.18,
    }


def _config_text(module: SpatialModule, mode: RenderMode, specs: dict[str, Any], nodes: list[dict[str, Any]]) -> str:
    lines = [
        f"# OmniMind Spatial · {module} · {mode}",
        f"footprint: {specs['width_ft']}x{specs['depth_ft']} ft",
        f"bedrooms: {specs.get('bedrooms', 3)}",
        f"nodes: {len(nodes)}",
        "",
    ]
    for n in nodes:
        p = n["position"]
        s = n["scale"]
        lines.append(
            f"{n['id']}: pos=({p['x']},{p['y']},{p['z']}) scale=({s['x']},{s['y']},{s['z']}) layer={n.get('layer','')}"
        )
    return "\n".join(lines) + "\n"


async def build_directive_payload(
    *,
    module: SpatialModule,
    prompt: str,
    render_mode: RenderMode,
    session_id: str | None = None,
) -> dict[str, Any]:
    specs = parse_architecture_specs(prompt)
    archetype = _detect_archetype(prompt, module)
    sid = session_id or str(uuid.uuid4())

    if module == "external":
        nodes = _build_exterior_nodes(specs, archetype)
        material_keys = ["concrete", "glass", "marble"]
    else:
        nodes = _build_interior_nodes(specs, archetype)
        material_keys = ["oak", "fabric", "marble", "glass"]

    textures = await _resolve_textures(material_keys) if render_mode == "cinematic" else {}
    vectors = _wireframe_vectors(nodes) if render_mode == "matrix" else []
    illumination = _illumination_for_mode(render_mode, module)
    config_text = _config_text(module, render_mode, specs, nodes)

    payload: dict[str, Any] = {
        "schema": "omnimind.spatial.directive.v1",
        "session_id": sid,
        "module": module,
        "render_mode": render_mode,
        "archetype": archetype,
        "specs": specs,
        "coordinates": nodes,
        "vectors": vectors,
        "textures": textures,
        "illumination": illumination,
        "config_text": config_text,
        "generated_at": _now(),
        "recommendations": _recommendations(specs, "interior" if module == "interior" else "exterior"),
    }

    _sessions[sid] = {
        "session_id": sid,
        "module": module,
        "render_mode": render_mode,
        "specs": specs,
        "nodes": nodes,
        "config_text": config_text,
        "prompt": prompt,
        "render_dialog_state": dict(DEFAULT_RENDER_DIALOG),
        "camera_path": _default_camera_path(),
        "updated_at": _now(),
    }
    return payload


async def toggle_render_payload(
    *,
    module: SpatialModule,
    render_mode: RenderMode,
    session_id: str | None = None,
    prompt: str = "",
) -> dict[str, Any]:
    session = _sessions.get(session_id or "") if session_id else None
    base_prompt = session.get("prompt", prompt) if session else prompt
    if not base_prompt.strip():
        base_prompt = (
            "Luxury villa exterior with pool and landscape"
            if module == "external"
            else "Scandinavian minimalist living room with ray-tracing lighting"
        )
    payload = await build_directive_payload(
        module=module,
        prompt=base_prompt,
        render_mode=render_mode,
        session_id=session_id or (session.get("session_id") if session else None),
    )
    payload["transition"] = {
        "from": session.get("render_mode") if session else None,
        "to": render_mode,
        "instant": render_mode == "matrix",
    }
    return payload


def recalculate_layout(
    *,
    session_id: str,
    asset_id: str,
    x: float,
    y: float,
    z: float,
) -> dict[str, Any]:
    session = _sessions.get(session_id)
    if not session:
        raise KeyError(f"Unknown session: {session_id}")

    nodes: list[dict[str, Any]] = session["nodes"]
    target = next((n for n in nodes if n["id"] == asset_id), None)
    if not target:
        nodes.append(
            {
                "id": asset_id,
                "type": "placed_asset",
                "label": asset_id,
                "layer": session.get("module", "exterior"),
                "position": _vec(x, y, z),
                "scale": _vec(0.5, 0.5, 0.5),
                "rotation": _vec(0, 0, 0),
            }
        )
    else:
        target["position"] = _vec(x, y, z)

    module: SpatialModule = session["module"]
    mode: RenderMode = session["render_mode"]
    specs = session["specs"]
    config_text = _config_text(module, mode, specs, nodes)
    session["nodes"] = nodes
    session["config_text"] = config_text
    session["updated_at"] = _now()

    return {
        "schema": "omnimind.spatial.sync.v1",
        "session_id": session_id,
        "asset_id": asset_id,
        "position": _vec(x, y, z),
        "structure_tree": nodes,
        "config_text": config_text,
        "vectors": _wireframe_vectors(nodes) if mode == "matrix" else [],
    }


def get_or_create_session(module: SpatialModule, session_id: str | None = None) -> str:
    if session_id and session_id in _sessions:
        return session_id
    sid = session_id or str(uuid.uuid4())
    if sid not in _sessions:
        _sessions[sid] = {
            "session_id": sid,
            "module": module,
            "render_mode": "matrix",
            "specs": parse_architecture_specs(""),
            "nodes": [],
            "config_text": "",
            "prompt": "",
            "render_dialog_state": dict(DEFAULT_RENDER_DIALOG),
            "camera_path": _default_camera_path(),
            "updated_at": _now(),
        }
    return sid


def _partition_nodes(nodes: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    wall_types = {"volume", "partition", "glazing"}
    walls = [n for n in nodes if n.get("type") in wall_types]
    assets = [n for n in nodes if n.get("type") not in wall_types]
    return walls, assets


def _build_hybrid_sync(
    session: dict[str, Any],
    *,
    textures: dict[str, Any] | None = None,
    illumination: dict[str, Any] | None = None,
) -> dict[str, Any]:
    module: SpatialModule = session.get("module", "external")
    mode: RenderMode = session.get("render_mode", "matrix")
    nodes: list[dict[str, Any]] = session.get("nodes") or []
    walls, assets = _partition_nodes(nodes)
    tex = textures if textures is not None else {}
    if not tex and mode == "cinematic":
        tex = PBR_TEXTURES  # type: ignore[assignment]
    illum = illumination if illumination is not None else _illumination_for_mode(mode, module)
    render_dialog = session.get("render_dialog_state") or dict(DEFAULT_RENDER_DIALOG)
    camera_path = session.get("camera_path") or _default_camera_path()
    texture_mappings = [{"material": key, **val} for key, val in tex.items() if isinstance(val, dict)]
    return {
        "ok": True,
        "session_id": session.get("session_id", ""),
        "module": module,
        "render_mode": mode,
        "config_text": session.get("config_text", ""),
        "active_matrix_coordinates": {
            "walls": walls,
            "assets": assets,
            "camera_path": camera_path,
        },
        "cinematic_asset_bundle": {
            "texture_mappings": texture_mappings,
            "lighting_vectors": illum,
        },
        "render_dialog_state": render_dialog,
    }


def _apply_manual_adjustments(session: dict[str, Any], adjustments: dict[str, Any]) -> None:
    adj_type = adjustments.get("type", "settings")
    if adj_type == "drag":
        recalculate_layout(
            session_id=session["session_id"],
            asset_id=str(adjustments.get("asset_id", "")),
            x=float(adjustments.get("x", 0)),
            y=float(adjustments.get("y", 0.4)),
            z=float(adjustments.get("z", 0)),
        )
        return
    if adj_type == "spawn_asset":
        nodes: list[dict[str, Any]] = session.setdefault("nodes", [])
        asset_id = str(adjustments.get("asset_id") or f"asset-{uuid.uuid4().hex[:8]}")
        nodes.append(
            {
                "id": asset_id,
                "type": str(adjustments.get("asset_type", "placed_asset")),
                "label": str(adjustments.get("label", asset_id)),
                "layer": session.get("module", "exterior"),
                "position": _vec(
                    float(adjustments.get("x", 0)),
                    float(adjustments.get("y", 0.4)),
                    float(adjustments.get("z", 0)),
                ),
                "scale": _vec(0.6, 0.6, 0.6),
                "rotation": _vec(0, 0, 0),
                "material": adjustments.get("material"),
            }
        )
        module: SpatialModule = session["module"]
        mode: RenderMode = session["render_mode"]
        specs = session["specs"]
        session["config_text"] = _config_text(module, mode, specs, nodes)
        session["updated_at"] = _now()
        return
    if adj_type == "camera":
        camera = session.setdefault("camera_path", _default_camera_path())
        for key in ("start", "end"):
            if key in adjustments and isinstance(adjustments[key], dict):
                camera[key] = {**camera.get(key, {}), **adjustments[key]}
        session["updated_at"] = _now()
        return
    if adj_type == "material_apply":
        material = str(adjustments.get("material", "marble"))
        target_id = adjustments.get("node_id")
        for node in session.get("nodes", []):
            if target_id is None or node.get("id") == target_id:
                node["material"] = material
        session["updated_at"] = _now()
        return
    # generic settings merge
    for key, val in adjustments.items():
        if key in ("type", "asset_id"):
            continue
        if key == "render_settings" and isinstance(val, dict):
            dialog = session.setdefault("render_dialog_state", dict(DEFAULT_RENDER_DIALOG))
            dialog.update(val)
        elif key == "render_mode" and val in ("matrix", "cinematic"):
            session["render_mode"] = val


async def process_directive_hybrid(
    *,
    execution_type: Literal["ai_agent", "manual"],
    module: SpatialModule,
    parameters: dict[str, Any],
) -> dict[str, Any]:
    session_id = str(parameters.get("session_id") or "")
    sid = get_or_create_session(module, session_id or None)
    session = _sessions[sid]
    session["session_id"] = sid
    render_settings = parameters.get("render_settings") or {}
    if isinstance(render_settings, dict) and render_settings:
        dialog = session.setdefault("render_dialog_state", dict(DEFAULT_RENDER_DIALOG))
        dialog.update(render_settings)
        if "render_mode" in render_settings:
            session["render_mode"] = render_settings["render_mode"]

    directive: dict[str, Any] | None = None
    if execution_type == "ai_agent":
        prompt = str(parameters.get("prompt") or "").strip()
        if not prompt:
            raise ValueError("prompt required for ai_agent execution")
        render_mode: RenderMode = session.get("render_mode", "matrix")
        directive = await build_directive_payload(
            module=module,
            prompt=prompt,
            render_mode=render_mode,
            session_id=sid,
        )
        session = _sessions[sid]
    else:
        adjustments = parameters.get("adjustments") or {}
        if isinstance(adjustments, dict) and adjustments:
            _apply_manual_adjustments(session, adjustments)
        session = _sessions[sid]

    textures = directive.get("textures") if directive else None
    illumination = directive.get("illumination") if directive else None
    return _build_hybrid_sync(session, textures=textures, illumination=illumination)


async def save_blueprint_vault(
    *,
    module: SpatialModule,
    session_id: str | None = None,
    label: str = "",
    blueprint: dict[str, Any] | None = None,
) -> dict[str, Any]:
    session = _sessions.get(session_id or "") if session_id else None
    data = blueprint or {
        "module": module,
        "session_id": session_id,
        "specs": session.get("specs") if session else {},
        "nodes": session.get("nodes") if session else [],
        "config_text": session.get("config_text") if session else "",
        "illumination": _illumination_for_mode(
            session.get("render_mode", "matrix") if session else "matrix",
            module,
        ),
        "saved_at": _now(),
    }
    BLUEPRINT_VAULT.mkdir(parents=True, exist_ok=True)
    sub = BLUEPRINT_VAULT / module
    sub.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    name = label or f"{module}-{ts}"
    path = sub / f"{ts}.json"
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return {
        "ok": True,
        "module": module,
        "label": name,
        "vault_path": str(path.relative_to(_BACKEND_ROOT)),
        "node_count": len(data.get("nodes") or data.get("coordinates") or []),
    }


async def export_render_package(
    *,
    module: SpatialModule,
    session_id: str | None = None,
    render_mode: RenderMode = "cinematic",
    prompt: str = "",
) -> dict[str, Any]:
    session = _sessions.get(session_id or "") if session_id else None
    specs = session.get("specs") if session else parse_architecture_specs(prompt)
    nodes = session.get("nodes") if session else []
    svg = render_blueprint_svg(specs)

    EXPORT_VAULT.mkdir(parents=True, exist_ok=True)
    sub = EXPORT_VAULT / module
    sub.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    bundle = {
        "schema": "omnimind.spatial.export.v1",
        "module": module,
        "render_mode": render_mode,
        "specs": specs,
        "coordinates": nodes,
        "svg_preview": svg,
        "illumination": _illumination_for_mode(render_mode, module),
        "textures": await _resolve_textures(["marble", "oak", "glass", "fabric"]),
        "exported_at": _now(),
    }

    json_path = sub / f"{ts}.json"
    json_path.write_text(json.dumps(bundle, indent=2), encoding="utf-8")

    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("manifest.json", json.dumps(bundle, indent=2))
        zf.writestr("preview.svg", svg)
        zf.writestr("config.txt", session.get("config_text", "") if session else "")
    zip_path = sub / f"{ts}.zip"
    zip_path.write_bytes(zip_buf.getvalue())

    return {
        "ok": True,
        "module": module,
        "render_mode": render_mode,
        "json": str(json_path.relative_to(_BACKEND_ROOT)),
        "archive": str(zip_path.relative_to(_BACKEND_ROOT)),
        "download_name": f"omnimind-{module}-render-{ts}.json",
        "package": bundle,
        "svg_preview": svg[:4000],
    }
