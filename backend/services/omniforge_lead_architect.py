"""Lead Senior Architect — requirement analysis, DB recommendation, scaffold planning."""

from __future__ import annotations

import re
from typing import Any, Literal

from services.omniforge_polyglot_registry import DOMAIN_PROFILES, resolve_language

DatabaseChoice = Literal["mongodb", "postgresql", "mysql", "supabase", "firebase", "sqlite", "redis_cache"]


def _infer_domain(prompt: str, target_stack: str | None = None) -> str:
    low = prompt.lower()
    if target_stack == "game" or any(w in low for w in ("game", "unity", "unreal", "phaser")):
        return "game_2d" if "2d" in low else "game_3d"
    if target_stack == "business" or any(w in low for w in ("erp", "crm", "business", "admin")):
        return "enterprise"
    if any(w in low for w in ("mujhe", "banani", "banana", "chahiye", "bana do", "banao")):
        if any(w in low for w in ("website", "site", "web", "perfume", "shop", "store")):
            return "web_ecommerce"
    if any(w in low for w in ("ecommerce", "e-commerce", "shop", "store", "retail", "perfume", "commerce")):
        return "web_ecommerce"
    if any(w in low for w in ("flutter", "android", "ios", "mobile app")):
        return "mobile_flutter"
    if any(w in low for w in ("microservice", "api gateway", "kubernetes")):
        return "microservice"
    if any(w in low for w in ("data science", "ml", "machine learning", "jupyter")):
        return "data_science"
    if any(w in low for w in ("portfolio", "landing")):
        return "web_portfolio"
    if any(w in low for w in ("saas", "dashboard", "subscription")):
        return "web_saas"
    return "web_ecommerce"


def recommend_database(prompt: str, domain: str) -> dict[str, Any]:
    low = prompt.lower()
    scores: list[tuple[DatabaseChoice, int, str]] = []

    def add(db: DatabaseChoice, score: int, reason: str) -> None:
        scores.append((db, score, reason))

    if any(w in low for w in ("realtime", "chat", "flexible schema", "document", "json", "catalog", "reviews")):
        add("mongodb", 88, "Flexible document model for evolving product catalogs")
    if any(w in low for w in ("transaction", "orders", "inventory", "sql", "relational", "commerce", "retail", "perfume", "payment")):
        add("postgresql", 92, "Strong ACID transactions for orders, payments, and inventory")
    if any(w in low for w in ("mysql", "lamp", "wordpress")):
        add("mysql", 75, "Mature relational store for classic web stacks")
    if any(w in low for w in ("auth", "realtime", "supabase", "postgres")):
        add("supabase", 88, "Managed Postgres + Auth + Storage with instant REST/RPC")
    if any(w in low for w in ("firebase", "mobile", "push", "offline")):
        add("firebase", 80, "Realtime mobile sync and hosted auth")
    if domain in ("web_portfolio", "browser_extension") or "prototype" in low:
        add("sqlite", 70, "Zero-config local store for rapid prototypes")
    if any(w in low for w in ("cache", "session", "queue")):
        add("redis_cache", 65, "Hot cache and session layer alongside primary DB")

    if not scores:
        add("postgresql", 80, "Default full-stack relational choice for structured commerce data")
        add("mongodb", 70, "Alternative document store for flexible catalog schemas")

    scores.sort(key=lambda x: -x[1])
    primary = scores[0]
    alternatives = [{"id": s[0], "score": s[1], "reason": s[2]} for s in scores[1:4]]

    return {
        "recommended": primary[0],
        "score": primary[1],
        "reason": primary[2],
        "alternatives": alternatives,
        "requires_approval": True,
        "migration_ready": primary[0] in ("postgresql", "mysql", "sqlite", "mongodb"),
    }


def analyze_requirements(
    prompt: str,
    *,
    target_stack: str | None = None,
    mode: str = "vibe",
) -> dict[str, Any]:
    domain_id = _infer_domain(prompt, target_stack)
    domain = DOMAIN_PROFILES.get(domain_id)
    title_match = re.search(r"(?:build|create|make|bana)\s+(?:a|an|the)?\s*(.+?)(?:\s+website|\s+app|$)", prompt, re.I)
    title = (title_match.group(1).strip() if title_match else prompt.split("\n")[0][:80]).title()

    db = recommend_database(prompt, domain_id)
    folder_tree = _proposed_folder_tree(domain_id, db["recommended"])

    return {
        "title": title,
        "domain": domain_id,
        "domain_label": domain.label if domain else domain_id,
        "scaffold_adapter": domain.scaffold_adapter if domain else "app-builder",
        "preview_mode": domain.preview_mode if domain else "web_blob",
        "languages": list(domain.default_languages) if domain else ["typescript", "python"],
        "mode": mode,
        "target_stack": target_stack or "polyglot",
        "database": db,
        "folder_tree": folder_tree,
        "features": _detect_features(prompt),
        "auth": _detect_auth(prompt),
        "env_bindings": _proposed_env(db["recommended"]),
        "routing": {"frontend": "auto", "api_prefix": "/api/v1"},
    }


def _detect_features(prompt: str) -> list[str]:
    low = prompt.lower()
    feats: list[str] = []
    for kw, label in (
        ("admin", "admin_panel"),
        ("cart", "shopping_cart"),
        ("payment", "payments"),
        ("auth", "authentication"),
        ("blog", "blog"),
        ("search", "search"),
        ("dashboard", "dashboard"),
        ("api", "rest_api"),
        ("crud", "crud"),
    ):
        if kw in low:
            feats.append(label)
    return feats or ["landing", "crud", "responsive_ui"]


def _detect_auth(prompt: str) -> dict[str, Any]:
    low = prompt.lower()
    if any(w in low for w in ("oauth", "github login", "google login")):
        return {"strategy": "oauth2", "providers": ["github", "google"], "jwt": True}
    return {"strategy": "jwt", "providers": [], "jwt": True}


def _proposed_folder_tree(domain: str, database: str) -> list[str]:
    base = [
        ".omniforge/workspace.json",
        "preview.html",
        "package.json",
        "src/App.jsx",
        "src/main.jsx",
        "public/index.html",
    ]
    if domain.startswith("web"):
        base.extend(["src/components/", "src/pages/", "src/styles/"])
    if database in ("postgresql", "mysql", "sqlite"):
        base.extend(["backend/models/", "backend/migrations/", "backend/routers/"])
    elif database == "mongodb":
        base.extend(["backend/schemas/", "backend/repositories/"])
    if "admin" in domain or domain == "enterprise":
        base.append("src/admin/")
    return base


def _proposed_env(database: str) -> list[dict[str, str]]:
    common = [
        {"key": "JWT_SECRET_KEY", "scope": "auth"},
        {"key": "FRONTEND_ORIGIN", "scope": "cors"},
    ]
    db_keys = {
        "postgresql": [{"key": "DATABASE_URL", "scope": "database"}],
        "mysql": [{"key": "DATABASE_URL", "scope": "database"}],
        "mongodb": [{"key": "MONGODB_URI", "scope": "database"}],
        "supabase": [{"key": "SUPABASE_URL", "scope": "database"}, {"key": "SUPABASE_ANON_KEY", "scope": "database"}],
        "firebase": [{"key": "FIREBASE_PROJECT_ID", "scope": "database"}],
        "sqlite": [{"key": "DATABASE_URL", "scope": "database"}],
        "redis_cache": [{"key": "REDIS_URL", "scope": "cache"}],
    }
    return common + db_keys.get(database, [])


def build_scaffold_plan(analysis: dict[str, Any]) -> dict[str, Any]:
    return {
        "phases": [
            {"id": "analyze", "status": "complete"},
            {"id": "scaffold_files", "status": "running"},
            {"id": "wire_routes", "status": "pending"},
            {"id": "database_init", "status": "pending", "awaiting_approval": analysis["database"]["requires_approval"]},
            {"id": "auth_inject", "status": "pending"},
            {"id": "preview_live", "status": "pending"},
        ],
        "analysis": analysis,
    }
