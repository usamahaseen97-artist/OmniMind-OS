"""
OmniMind V11 — conditional dev workspace sandbox engine.
Isolated physical trees for business-web, app-web, and game-dev tools.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
import zipfile
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any, AsyncGenerator

from services.stream_sse import sse, sse_token
from services.superapp_ai import stream_completion

logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
SANDBOX_ROOT = _BACKEND_ROOT / "sandbox"
PROJECT_ARCHIVE_ROOT = _BACKEND_ROOT / "data" / "dev_projects"

TOOL_ALIASES: dict[str, str] = {
    "business-site-maker": "business-web",
    "business-website-development": "business-web",
    "business-web": "business-web",
    "app-builder": "app-web",
    "app-and-develop": "app-web",
    "app-web": "app-web",
    "game-dev": "game-dev",
    "game-app-architect": "game-dev",
    "game": "game-dev",
}

SCAFFOLDS: dict[str, dict[str, str]] = {
    "business-web": {
        "frontend/components/LandingHero.tsx": """\
export function LandingHero() {
  return (
    <section className="hero neon-grid">
      <h1>Dehli Mutton Pack</h1>
      <p>Premium cuts · dynamic pricing · same-day delivery</p>
    </section>
  );
}
""",
        "frontend/components/ProductCard.tsx": """\
export function ProductCard({ title, price }: { title: string; price: number }) {
  return (
    <article className="product-card">
      <h3>{title}</h3>
      <strong>${price.toFixed(2)}</strong>
    </article>
  );
}
""",
        "frontend/pages/checkout/index.tsx": """\
export default function CheckoutPage() {
  return (
    <main>
      <h1>Secure Checkout</h1>
      <p>Inventory-synced cart · encrypted payment rail</p>
    </main>
  );
}
""",
        "backend/routes/pricing.py": """\
from fastapi import APIRouter

router = APIRouter(prefix="/pricing", tags=["pricing"])


@router.get("/dynamic")
async def dynamic_pricing(sku: str = "mutton-pack"):
    return {"sku": sku, "price": 24.99, "currency": "USD", "engine": "dynamic"}
""",
        "backend/controllers/salesController.py": """\
class SalesController:
    def checkout(self, cart_id: str) -> dict:
        return {"cart_id": cart_id, "status": "confirmed", "channel": "ecommerce"}
""",
        "backend/models/inventory.db": "",
    },
    "app-web": {
        "src/app/page.tsx": """\
export default function Page() {
  return (
    <main className="omni-app-shell">
      <h1>OmniMind App</h1>
      <p>Full-stack Next.js · reactive routes</p>
    </main>
  );
}
""",
        "src/hooks/useAuth.ts": """\
import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  return { user, setUser, isAuthenticated: Boolean(user) };
}
""",
        "backend/routers/api.py": """\
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/health")
async def health():
    return {"ok": True, "service": "app-web"}
""",
        "backend/main.py": """\
from fastapi import FastAPI
from routers.api import router as api_router

app = FastAPI(title="OmniMind App API")
app.include_router(api_router)
""",
    },
    "game-dev": {
        "physics/collision_engine.js": """\
export function resolveCollisions(bodies) {
  for (const a of bodies) {
    for (const b of bodies) {
      if (a === b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < a.radius + b.radius) {
        const overlap = a.radius + b.radius - dist;
        a.x -= (dx / dist) * overlap * 0.5;
        b.x += (dx / dist) * overlap * 0.5;
      }
    }
  }
}
""",
        "scenes/Level1.js": """\
export const Level1 = {
  id: "level-1",
  spawn: [120, 340],
  platforms: [{ x: 0, y: 400, w: 800, h: 40 }],
  enemies: [{ x: 520, y: 360, patrol: 80 }],
};
""",
        "states/gameState.js": """\
export const gameState = {
  score: 0,
  lives: 3,
  level: "Level1",
  paused: false,
};
""",
        "assets/sprites/player.png": "PNG_PLACEHOLDER",
    },
}

# Runtime diagnostics + terminal lines (per workspace)
_workspace_state: dict[str, dict[str, Any]] = {}
_watch_snapshots: dict[str, dict[str, float]] = {}
_error_stacks: dict[str, list[str]] = {}


def normalize_tool_type(tool_type: str) -> str:
    key = tool_type.strip().lower().replace(" ", "-")
    if key not in TOOL_ALIASES:
        raise ValueError(f"Unknown tool_type: {tool_type}")
    return TOOL_ALIASES[key]


def workspace_root(tool_type: str) -> Path:
    slug = normalize_tool_type(tool_type)
    return SANDBOX_ROOT / slug


def ensure_workspace(tool_type: str) -> dict[str, Any]:
    slug = normalize_tool_type(tool_type)
    root = workspace_root(tool_type)
    created: list[str] = []
    scaffold = SCAFFOLDS.get(slug, {})
    for rel_path, content in scaffold.items():
        full = root / rel_path
        full.parent.mkdir(parents=True, exist_ok=True)
        if not full.exists():
            full.write_text(content, encoding="utf-8")
            created.append(rel_path)
        elif full.stat().st_size == 0 and content:
            full.write_text(content, encoding="utf-8")
            created.append(rel_path)
    _workspace_state.setdefault(slug, {})
    _workspace_state[slug].update(
        {
            "initialized_at": datetime.now(timezone.utc).isoformat(),
            "root": str(root),
            "file_count": len(list_files(tool_type)),
        }
    )
    _log_terminal(slug, f"✓ Workspace scaffold ready · {slug} · {len(created)} new paths")
    return {"tool_type": slug, "root": str(root), "created": created, "files": list_files(tool_type)}


def list_files(tool_type: str) -> list[dict[str, Any]]:
    root = workspace_root(tool_type)
    if not root.exists():
        return []
    out: list[dict[str, Any]] = []
    for p in sorted(root.rglob("*")):
        if p.is_file():
            rel = p.relative_to(root).as_posix()
            out.append(
                {
                    "path": rel,
                    "size": p.stat().st_size,
                    "modified": p.stat().st_mtime,
                }
            )
    return out


def read_file(tool_type: str, relative_path: str) -> str:
    root = workspace_root(tool_type)
    target = (root / relative_path.lstrip("/")).resolve()
    if not str(target).startswith(str(root.resolve())):
        raise ValueError("Path escapes sandbox")
    if not target.is_file():
        raise FileNotFoundError(relative_path)
    return target.read_text(encoding="utf-8")


def write_file(tool_type: str, relative_path: str, content: str) -> dict[str, Any]:
    slug = normalize_tool_type(tool_type)
    root = workspace_root(tool_type)
    target = (root / relative_path.lstrip("/")).resolve()
    if not str(target).startswith(str(root.resolve())):
        raise ValueError("Path escapes sandbox")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    _log_terminal(slug, f"✓ Patched {relative_path} ({len(content)} bytes)")
    return {"path": relative_path, "size": len(content), "modified": target.stat().st_mtime}


def _log_terminal(slug: str, line: str) -> None:
    stacks = _error_stacks.setdefault(slug, [])
    stacks.append(line)
    if len(stacks) > 120:
        del stacks[:-120]


def _infer_target_file(slug: str, prompt: str, active_file: str) -> str:
    if active_file and active_file.strip():
        return active_file.lstrip("/")
    low = prompt.lower()
    defaults = {
        "business-web": "frontend/components/LandingHero.tsx",
        "app-web": "src/app/page.tsx",
        "game-dev": "scenes/Level1.js",
    }
    if "checkout" in low:
        return "frontend/pages/checkout/index.tsx"
    if "pricing" in low or "inventory" in low:
        return "backend/routes/pricing.py"
    if "physics" in low or "collision" in low:
        return "physics/collision_engine.js"
    if "level" in low or "scene" in low:
        return "scenes/Level1.js"
    if "auth" in low or "hook" in low:
        return "src/hooks/useAuth.ts"
    if "api" in low or "router" in low:
        return "backend/routers/api.py" if slug == "app-web" else "backend/routes/pricing.py"
    return defaults.get(slug, "README.md")


def _template_code(slug: str, prompt: str, target: str) -> str:
    """Deterministic fallback when LLM unavailable."""
    snippet = prompt.strip()[:200].replace('"', "'")
    ext = Path(target).suffix.lower()
    if ext in (".tsx", ".ts", ".jsx", ".js"):
        return (
            f"// OmniMind generated — {slug}\n"
            f"// Prompt: {snippet}\n\n"
            f"export const omniGenerated = {{\n"
            f"  tool: '{slug}',\n"
            f"  target: '{target}',\n"
            f"  note: `{snippet}`,\n"
            f"  updatedAt: '{datetime.now(timezone.utc).isoformat()}',\n"
            f"}};\n"
        )
    if ext == ".py":
        return (
            f'"""OmniMind generated — {slug}"""\n\n'
            f"PROMPT = {snippet!r}\n\n"
            f"def run():\n"
            f"    return {{'tool': '{slug}', 'target': '{target}', 'prompt': PROMPT}}\n"
        )
    return f"# {snippet}\n"


def _basic_syntax_check(path: str, content: str) -> list[str]:
    issues: list[str] = []
    if path.endswith(".py"):
        try:
            compile(content, path, "exec")
        except SyntaxError as e:
            issues.append(f"Python syntax error in {path}: {e.msg} (line {e.lineno})")
    if path.endswith((".js", ".ts", ".tsx", ".jsx")):
        if content.count("{") != content.count("}"):
            issues.append(f"Brace mismatch in {path}")
        if content.count("(") != content.count(")"):
            issues.append(f"Parenthesis mismatch in {path}")
    return issues


async def stream_execute_prompt(
    *,
    tool_type: str,
    user_prompt: str,
    active_file: str,
) -> AsyncGenerator[str, None]:
    slug = normalize_tool_type(tool_type)
    ensure_workspace(tool_type)
    target = _infer_target_file(slug, user_prompt, active_file)
    system = (
        f"You are OmniMind V11 Dev Engine for workspace '{slug}'. "
        f"Return ONLY raw source code for file '{target}'. No markdown fences."
    )
    message = f"User prompt:\n{user_prompt}\n\nTarget file: {target}\n\nWrite complete file contents."

    yield sse({"meta": {"status": "compiling", "tool_type": slug, "target": target}})
    _log_terminal(slug, f"$ execute-prompt --tool {slug} --file {target}")

    accumulated = ""
    try:
        async for token in stream_completion(
            message=message,
            system_prompt=system,
            history=[],
            temperature=0.35,
            max_tokens=4096,
        ):
            accumulated += token
            yield sse_token(token)
            await asyncio.sleep(0)
    except Exception as exc:
        logger.warning("LLM stream failed, using template: %s", exc)
        _log_terminal(slug, f"⚠ LLM fallback: {exc}")

    code = accumulated.strip()
    if not code or len(code) < 12:
        code = _template_code(slug, user_prompt, target)
    code = re.sub(r"^```[\w]*\n?", "", code)
    code = re.sub(r"\n?```$", "", code)

    issues = _basic_syntax_check(target, code)
    for issue in issues:
        _log_terminal(slug, f"✗ {issue}")

    write_file(tool_type, target, code)
    yield sse(
        {
            "file_written": {"path": target, "content": code, "tool_type": slug},
            "build": {"status": "hot_reload", "target": target},
        }
    )
    yield sse({"done": True, "tool_type": slug, "active_file": target})


def snapshot_mtimes(tool_type: str) -> dict[str, float]:
    root = workspace_root(tool_type)
    if not root.exists():
        return {}
    return {
        p.relative_to(root).as_posix(): p.stat().st_mtime
        for p in root.rglob("*")
        if p.is_file()
    }


async def stream_watch_build(tool_type: str) -> AsyncGenerator[str, None]:
    slug = normalize_tool_type(tool_type)
    ensure_workspace(tool_type)
    key = slug
    _watch_snapshots[key] = snapshot_mtimes(tool_type)
    yield sse({"meta": {"status": "watching", "tool_type": slug, "root": str(workspace_root(tool_type))}})
    try:
        while True:
            await asyncio.sleep(0.45)
            current = snapshot_mtimes(tool_type)
            prev = _watch_snapshots.get(key, {})
            changed = [path for path, mt in current.items() if prev.get(path) != mt]
            new_files = [path for path in current if path not in prev]
            if changed or new_files:
                _watch_snapshots[key] = current
                for path in changed:
                    try:
                        content = read_file(tool_type, path)
                    except OSError:
                        content = ""
                    yield sse(
                        {
                            "hot_reload": {
                                "path": path,
                                "tool_type": slug,
                                "modified": current[path],
                                "preview": content[:1200],
                            }
                        }
                    )
                    _log_terminal(slug, f"↻ hot-reload signal → {path}")
            yield sse({"heartbeat": time.time(), "tool_type": slug})
    except asyncio.CancelledError:
        yield sse({"meta": {"status": "watch_stopped", "tool_type": slug}})
        raise


def save_project(tool_type: str, *, label: str = "") -> dict[str, Any]:
    slug = normalize_tool_type(tool_type)
    ensure_workspace(tool_type)
    root = workspace_root(tool_type)
    PROJECT_ARCHIVE_ROOT.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    archive_dir = PROJECT_ARCHIVE_ROOT / slug
    archive_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, Any] = {
        "tool_type": slug,
        "label": label or f"{slug}-{ts}",
        "saved_at": datetime.now(timezone.utc).isoformat(),
        "files": {},
    }
    for meta in list_files(tool_type):
        rel = meta["path"]
        try:
            manifest["files"][rel] = read_file(tool_type, rel)
        except OSError:
            continue

    manifest_path = archive_dir / f"{ts}.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    zip_buf = BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for rel, content in manifest["files"].items():
            zf.writestr(rel, content)
    zip_path = archive_dir / f"{ts}.zip"
    zip_path.write_bytes(zip_buf.getvalue())

    _log_terminal(slug, f"💾 Project saved → {manifest_path.name}")
    return {
        "ok": True,
        "tool_type": slug,
        "manifest": str(manifest_path.relative_to(_BACKEND_ROOT)),
        "archive": str(zip_path.relative_to(_BACKEND_ROOT)),
        "file_count": len(manifest["files"]),
    }


def get_diagnostics(tool_type: str) -> dict[str, Any]:
    slug = normalize_tool_type(tool_type)
    root = workspace_root(tool_type)
    ensure_workspace(tool_type)
    files = list_files(tool_type)
    terminal = _error_stacks.get(slug, [])
    syntax_issues: list[str] = []
    for meta in files:
        rel = meta["path"]
        if not rel.endswith((".py", ".js", ".ts", ".tsx", ".jsx")):
            continue
        try:
            content = read_file(tool_type, rel)
            syntax_issues.extend(_basic_syntax_check(rel, content))
        except OSError:
            syntax_issues.append(f"Unreadable file: {rel}")

    return {
        "tool_type": slug,
        "workspace_root": str(root),
        "exists": root.exists(),
        "file_count": len(files),
        "ports": {
            "backend_api": 8001,
            "frontend_dev": 3000,
            "vite_default": 5173,
        },
        "syntax_issues": syntax_issues,
        "terminal_lines": terminal[-40:],
        "streaming": _workspace_state.get(slug, {}).get("streaming", False),
        "last_build": _workspace_state.get(slug, {}).get("last_build"),
    }
