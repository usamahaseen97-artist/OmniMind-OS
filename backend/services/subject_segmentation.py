"""Portrait subject segmentation metadata for in-painting (ellipse mask)."""

from __future__ import annotations

from typing import Any


def default_portrait_segmentation() -> dict[str, Any]:
    return {
        "kind": "ellipse",
        "cx": 0.5,
        "cy": 0.44,
        "rx": 0.36,
        "ry": 0.4,
    }


def segmentation_from_size(width: int, height: int) -> dict[str, Any]:
    """Slightly taller ellipse for portrait aspect ratios."""
    seg = default_portrait_segmentation()
    if height > width * 1.1:
        seg["ry"] = 0.44
        seg["cy"] = 0.46
    return seg


def normalize_segmentation(raw: dict[str, Any] | None) -> dict[str, Any]:
    if not raw:
        return default_portrait_segmentation()
    base = default_portrait_segmentation()
    base.update({k: raw[k] for k in raw if k in base or k == "kind"})
    return base
