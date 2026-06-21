"""
Parse architectural briefs and emit interactive SVG floor-plan blueprints.
"""

from __future__ import annotations

import re
from typing import Any


def parse_architecture_specs(message: str) -> dict[str, Any]:
    low = message.lower()
    dims = re.search(r"(\d+)\s*[x×]\s*(\d+)", low)
    width_ft = int(dims.group(1)) if dims else 40
    depth_ft = int(dims.group(2)) if dims else 60

    bed = re.search(r"(\d+)\s*bed", low)
    bedrooms = int(bed.group(1)) if bed else 3

    return {
        "width_ft": width_ft,
        "depth_ft": depth_ft,
        "bedrooms": bedrooms,
        "courtyard": "courtyard" in low or "court yard" in low,
        "parking": "parking" in low or "garage" in low,
        "kitchen": "kitchen" in low or True,
        "living": "living" in low or True,
    }


def render_blueprint_svg(specs: dict[str, Any]) -> str:
    w = specs["width_ft"]
    d = specs["depth_ft"]
    scale = 6
    W, H = w * scale, d * scale
    pad = 24
    svg_w, svg_h = W + pad * 2, H + pad * 2 + 40

    rooms: list[tuple[str, int, int, int, int, str]] = []
    x0, y0 = pad, pad + 20
    cell_w = W // 3
    cell_h = H // 3

    rooms.append(("Living", x0, y0, cell_w * 2 - 4, cell_h - 4, "#0ea5e9"))
    for i in range(min(specs["bedrooms"], 3)):
        rooms.append(
            (f"Bed {i + 1}", x0 + i * (cell_w + 2), y0 + cell_h + 2, cell_w - 6, cell_h - 4, "#22c55e")
        )
    if specs.get("kitchen"):
        rooms.append(("Kitchen", x0 + cell_w * 2, y0, cell_w - 4, cell_h - 4, "#f59e0b"))
    if specs.get("courtyard"):
        cx = x0 + cell_w
        cy = y0 + cell_h + 2
        rooms.append(("Courtyard", cx, cy, cell_w - 4, cell_h - 4, "#00ff88"))
    if specs.get("parking"):
        rooms.append(("Parking", x0, y0 + cell_h * 2 + 4, W - 4, cell_h - 8, "#a78bfa"))

    rects = []
    for label, rx, ry, rw, rh, color in rooms:
        rects.append(
            f'<rect x="{rx}" y="{ry}" width="{rw}" height="{rh}" fill="{color}22" stroke="{color}" stroke-width="2" rx="4"/>'
            f'<text x="{rx + rw/2}" y="{ry + rh/2}" fill="#e4e4e7" font-size="11" text-anchor="middle" dominant-baseline="middle">{label}</text>'
        )

    grid_lines = []
    for i in range(1, 3):
        grid_lines.append(
            f'<line x1="{x0 + i * cell_w}" y1="{y0}" x2="{x0 + i * cell_w}" y2="{y0 + H}" stroke="#ffffff18" stroke-width="1"/>'
        )
        grid_lines.append(
            f'<line x1="{x0}" y1="{y0 + i * cell_h}" x2="{x0 + W}" y2="{y0 + i * cell_h}" stroke="#ffffff18" stroke-width="1"/>'
        )

    outer = f'<rect x="{x0}" y="{y0}" width="{W}" height="{H}" fill="none" stroke="#00ff88" stroke-width="2" rx="6"/>'
    title = f"{w}×{d} ft · {specs['bedrooms']} BR"
    if specs.get("courtyard"):
        title += " · Courtyard"
    if specs.get("parking"):
        title += " · Parking"

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_w} {svg_h}" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#060807"/>
  <text x="{svg_w/2}" y="18" fill="#00ff88" font-size="14" font-weight="bold" text-anchor="middle">{title}</text>
  {outer}
  {''.join(grid_lines)}
  {''.join(rects)}
  <text x="{svg_w/2}" y="{svg_h - 8}" fill="#71717a" font-size="10" text-anchor="middle">OmniMind Blueprint · scale 1:{scale} px/ft</text>
</svg>"""


def build_blueprint(message: str) -> dict[str, Any]:
    specs = parse_architecture_specs(message)
    svg = render_blueprint_svg(specs)
    html = f'<div style="padding:8px;background:#060807;height:100%">{svg}</div>'
    return {
        "specs": specs,
        "svg": svg,
        "preview": {
            "html": html,
            "type": "blueprint",
            "svg": svg,
            "active_tab": "blueprint",
        },
    }
