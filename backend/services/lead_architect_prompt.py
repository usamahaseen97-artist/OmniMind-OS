"""OmniMind V11 Lead Core Software & Game Architect — system prompts + JSON choice blocks."""

from __future__ import annotations

import json
from typing import Any

OMNIMIND_ARCHITECT_JSON_TYPE = "omnimind_architect_choice"

LEAD_ARCHITECT_BASE = """You are the **Lead Core Software & Game Architect of OmniMind V11**.
Your task is to build full-stack apps, websites, or games from user prompts — **no coding required from the user**.

**OPERATIONAL FLOW (follow in order):**
1. **Analyze** the user's uploaded files or prompt description. Summarize scope in 2–4 bullets.
2. **Frontend** — ask the user to choose a frontend framework. Output interactive JSON options (Next.js, React, Vanilla JS, etc.).
3. **Backend** — ask for backend preferences (Python FastAPI, Node.js Express, NestJS, serverless, or none).
4. **Database automation** — ask manual setup vs managed. If user says **"tum sab krdo"** or picks managed MongoDB/Supabase, **explicitly request their email address**. Once provided, confirm that the internal script will spin up MongoDB Atlas / Supabase and inject the connection string silently server-side.
5. **Code generation** — describe the clean, deployment-ready structure you will generate (folders, key files, env template).
6. **Deployment** — recommend Vercel, Netlify, or AWS step-by-step; offer to trigger the build CLI hook on confirmation.

**OUTPUT RULES (critical):**
- When presenting stack choices, **always** append a fenced JSON block the frontend renders as clickable buttons.
- JSON schema: `type` = `"omnimind_architect_choice"`, `step` (1–6), `phase`, `title`, `options[]` with `id`, `label`, `description`, optional `recommended`, `requiresEmail`.
- Keep conversational prose short (2–6 lines) **above** the JSON block.
- Never ask the user to write code manually unless they chose manual database setup.
- Founder: USAMA HASEEN. Stay professional, fast, and builder-focused — no generic chatbot filler.
"""

GAME_ARCHITECT_EXTRA = """
**Game mode:** Prefer Phaser 3, Three.js, or HTML5 Canvas when the project is a game. Mention game loop, assets, and deploy targets (Vercel static, AWS, itch.io) when relevant.
"""

APP_ARCHITECT_EXTRA = """
**App & website mode:** Prefer Next.js 15 + FastAPI + MongoDB for SaaS dashboards. Mention App Router, API routes, and Vercel + Render/Railway for backend when relevant.
"""


def lead_architect_prompt(*, mode: str = "app") -> str:
    extra = GAME_ARCHITECT_EXTRA if mode == "game" else APP_ARCHITECT_EXTRA
    return f"{LEAD_ARCHITECT_BASE}\n{extra}"


def architect_choice_block(
    *,
    step: int,
    phase: str,
    title: str,
    options: list[dict[str, Any]],
    subtitle: str | None = None,
    actions: list[dict[str, Any]] | None = None,
    email_prompt: dict[str, Any] | None = None,
) -> str:
    """Embed architect JSON for frontend Code Bot buttons."""
    payload: dict[str, Any] = {
        "type": OMNIMIND_ARCHITECT_JSON_TYPE,
        "step": step,
        "phase": phase,
        "title": title,
        "multiSelect": False,
        "options": options,
    }
    if subtitle:
        payload["subtitle"] = subtitle
    if actions:
        payload["actions"] = actions
    if email_prompt:
        payload["emailPrompt"] = email_prompt
    return f"```json\n{json.dumps(payload, indent=2)}\n```"


def default_frontend_choice_json(mode: str = "app") -> str:
    opts = [
        {"id": "nextjs", "label": "Next.js 15", "description": "SSR, App Router, Vercel", "recommended": True},
        {"id": "react-vite", "label": "React + Vite", "description": "SPA dashboards & tools"},
        {"id": "vanilla", "label": "Vanilla JS + HTML", "description": "Zero build landing pages"},
    ]
    if mode == "game":
        opts.extend([
            {"id": "phaser", "label": "Phaser 3", "description": "2D browser games"},
            {"id": "threejs", "label": "Three.js + React", "description": "3D web game prototypes"},
        ])
    return architect_choice_block(
        step=2,
        phase="frontend",
        title="Which frontend would you like?",
        subtitle="Tap an option in the Code Bot panel or reply with your choice",
        options=opts,
        actions=[
            {"id": "confirm_frontend", "label": "Confirm Frontend", "requiresSelection": True},
        ],
    )
