"""Multi-agent swarm orchestrator — worker phases for OmniForge automation."""

from __future__ import annotations

from typing import Any, Literal

AgentId = Literal["frontend", "backend", "database", "devops", "optimization"]

AGENT_META: dict[AgentId, dict[str, str]] = {
    "frontend": {"label": "Frontend Agent", "role": "UI/UX layouts & components"},
    "backend": {"label": "Backend Agent", "role": "REST APIs & business logic"},
    "database": {"label": "Database Agent", "role": "Schema, migrations, connection pools"},
    "devops": {"label": "DevOps Agent", "role": "Hosting, CI/CD, env bindings"},
    "optimization": {"label": "Optimization Agent", "role": "Performance & security hardening"},
}


def swarm_phases(analysis: dict[str, Any]) -> list[dict[str, Any]]:
    db = analysis.get("database", {})
    return [
        {"agent": "frontend", "status": "running", "task": "Scaffolding UI layouts…", "progress": 10},
        {"agent": "backend", "status": "queued", "task": "Preparing API routers…", "progress": 0},
        {
            "agent": "database",
            "status": "awaiting_approval",
            "task": f"Awaiting DB approval: {db.get('recommended', 'postgresql')}",
            "progress": 0,
            "database": db,
        },
        {"agent": "devops", "status": "queued", "task": "Deployment manifests…", "progress": 0},
        {"agent": "optimization", "status": "queued", "task": "Security & perf review…", "progress": 0},
    ]


def roman_db_prompt(database: str) -> str:
    names = {
        "mongodb": "MongoDB",
        "postgresql": "PostgreSQL",
        "mysql": "MySQL",
        "supabase": "Supabase",
        "firebase": "Firebase",
        "sqlite": "SQLite",
    }
    label = names.get(database, database.upper())
    return f"Main {label} connect kar doon? (Yes/No)"


def diagnostics_for_analysis(analysis: dict[str, Any]) -> list[dict[str, str]]:
    tips: list[dict[str, str]] = []
    domain = analysis.get("domain", "")
    db = analysis.get("database", {}).get("recommended", "")

    if domain == "web_ecommerce":
        tips.append({"id": "nextjs", "text": "Next.js App Router would improve SEO for this commerce site."})
    if db == "mongodb":
        tips.append({"id": "index", "text": "Add compound indexes on product category + price for catalog queries."})
    elif db in ("postgresql", "mysql"):
        tips.append({"id": "index", "text": "Database index optimization suggested on orders(product_id, status)."})
    if "auth" in str(analysis.get("features", [])):
        tips.append({"id": "jwt", "text": "JWT + refresh rotation recommended for session security."})
    tips.append({"id": "deploy", "text": "One-click Vercel frontend + Railway API deploy is ready in deployment/."})
    return tips
