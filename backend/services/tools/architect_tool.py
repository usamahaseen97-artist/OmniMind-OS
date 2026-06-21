"""Tools 3 & 5 — Architectural 3D Designer spatial blueprint parser."""

from __future__ import annotations

import logging
from typing import Any, Optional
from uuid import uuid4

from services.architecture_blueprint import parse_architecture_specs, render_blueprint_svg
from services.mongo_pools import save_module_record

logger = logging.getLogger(__name__)


def _spatial_matrix(specs: dict[str, Any]) -> list[dict[str, Any]]:
    w, d = specs["width_ft"], specs["depth_ft"]
    cell_w, cell_h = w / 3, d / 3
    nodes = [
        {"id": "living", "label": "Living", "x": 0, "y": 0, "w": cell_w * 2, "h": cell_h, "layer": "interior"},
        {"id": "kitchen", "label": "Kitchen", "x": cell_w * 2, "y": 0, "w": cell_w, "h": cell_h, "layer": "interior"},
    ]
    for i in range(min(specs.get("bedrooms", 3), 3)):
        nodes.append(
            {
                "id": f"bed_{i+1}",
                "label": f"Bedroom {i+1}",
                "x": i * cell_w,
                "y": cell_h,
                "w": cell_w,
                "h": cell_h,
                "layer": "interior",
            }
        )
    if specs.get("courtyard"):
        nodes.append({"id": "courtyard", "label": "Courtyard", "x": cell_w, "y": cell_h, "w": cell_w, "h": cell_h, "layer": "exterior"})
    if specs.get("parking"):
        nodes.append({"id": "parking", "label": "Parking", "x": 0, "y": cell_h * 2, "w": w, "h": cell_h, "layer": "exterior"})
    return nodes


def _recommendations(specs: dict[str, Any], mode: str) -> list[str]:
    recs = [
        f"Optimize {specs['width_ft']}×{specs['depth_ft']} ft footprint for natural light",
        "Place wet zones (kitchen/bath) on service spine",
    ]
    if specs.get("courtyard"):
        recs.append("Courtyard enables cross-ventilation — recommend glass sliders on two axes")
    if mode == "interior":
        recs.append("Interior palette: warm neutrals with accent emerald trim")
    else:
        recs.append("Exterior massing: split roof planes with deep overhangs")
    return recs


async def parse_blueprint(
    *,
    prompt: str,
    mode: str = "exterior",
    yard_area: Optional[float] = None,
    room_dimensions: Optional[dict[str, Any]] = None,
    features: Optional[list[str]] = None,
    user_id: str = "anonymous",
) -> dict[str, Any]:
    job_id = str(uuid4())
    specs = parse_architecture_specs(prompt)
    if yard_area:
        specs["yard_sq_yards"] = yard_area
    if room_dimensions:
        specs["rooms"] = room_dimensions
    if features:
        specs["features"] = features

    spatial = {
        "units": "feet",
        "footprint": {"width": specs["width_ft"], "depth": specs["depth_ft"]},
        "nodes": _spatial_matrix(specs),
        "asset_positions": [
            {"asset": "door_main", "x": specs["width_ft"] / 2, "y": 0, "rotation": 0},
            {"asset": "window_south", "x": specs["width_ft"] / 2, "y": specs["depth_ft"], "rotation": 180},
        ],
    }
    svg = render_blueprint_svg(specs)
    recommendations = _recommendations(specs, mode)

    record = {
        "id": job_id,
        "user_id": user_id,
        "mode": mode,
        "specs": specs,
        "spatial": spatial,
        "recommendations": recommendations,
    }
    await save_module_record("architect", record)
    logger.info("Architect blueprint job=%s mode=%s", job_id, mode)

    return {
        "ok": True,
        "job_id": job_id,
        "mode": mode,
        "specs": specs,
        "spatial_object": spatial,
        "svg_preview": svg,
        "recommendations": recommendations,
        "canvas_assets": ["door", "window", "plant", "pool", "sofa", "wall_tile"],
    }


async def save_architect_project(
    *,
    user_id: str,
    project_name: str,
    scene_tree: dict[str, Any],
    folder_path: Optional[str] = None,
) -> dict[str, Any]:
    """Serialize drag-and-drop canvas JSON into Mongo folder structure."""
    job_id = str(uuid4())
    storage_path = folder_path or f"projects/{user_id}/{project_name.replace(' ', '_').lower()}"

    nodes = scene_tree.get("nodes") or scene_tree.get("assets") or []
    serialized = {
        "walls": [n for n in nodes if n.get("type") == "wall"],
        "doors": [n for n in nodes if n.get("type") == "door"],
        "windows": [n for n in nodes if n.get("type") == "window"],
        "pool": next((n for n in nodes if n.get("type") == "pool"), None),
        "raw_nodes": nodes,
    }

    record = {
        "id": job_id,
        "user_id": user_id,
        "project_name": project_name,
        "storage_path": storage_path,
        "scene_tree": scene_tree,
        "serialized": serialized,
        "asset_count": len(nodes),
    }
    await save_module_record("architect", record)
    logger.info("Architect project saved job=%s path=%s assets=%s", job_id, storage_path, len(nodes))

    return {
        "ok": True,
        "job_id": job_id,
        "project_name": project_name,
        "storage_path": storage_path,
        "folder_structure": {
            "root": storage_path,
            "scene.json": f"{storage_path}/scene.json",
            "assets": f"{storage_path}/assets/",
        },
        "serialized": serialized,
        "terminal_log": [
            f"$ architect save-project --path {storage_path}",
            f"✓ Serialized {len(nodes)} canvas nodes",
            "✓ Wrote scene.json to Mongo folder storage",
        ],
    }
