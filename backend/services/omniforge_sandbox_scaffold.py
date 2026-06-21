"""OmniForge isolated project sandbox — PRD folder tree + boilerplate."""

from __future__ import annotations

import json
from typing import Any

from services.omniforge_lead_architect import analyze_requirements


def _slug_title(prompt: str) -> str:
    analysis = analyze_requirements(prompt)
    return analysis.get("title", "OmniMind Project")


def _db_schema_files(database: str, title: str) -> list[dict[str, str]]:
    if database in ("postgresql", "mysql", "supabase"):
        sql = f"""-- {title} — relational schema
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  qty INT NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_name ON products(name);
"""
        return [
            {"path": "database/schema.sql", "content": sql, "language": "sql"},
            {"path": "database/migrations/001_init.sql", "content": sql, "language": "sql"},
            {"path": "database/README.md", "content": f"# Database — {database}\n\nRun migrations after approval.\n", "language": "markdown"},
        ]
    if database == "mongodb":
        schema = {
            "collections": {
                "products": {"indexes": ["name", "category"], "fields": {"name": "string", "price": "number", "stock": "int"}},
                "orders": {"indexes": ["userId", "status"], "fields": {"items": "array", "total": "number"}},
            }
        }
        return [
            {"path": "database/schemas/catalog.json", "content": json.dumps(schema, indent=2), "language": "json"},
            {"path": "database/README.md", "content": "# Database — MongoDB\n\nFlexible document catalog schema.\n", "language": "markdown"},
        ]
    return [
        {"path": "database/README.md", "content": "# Database\n\nAwaiting user approval to initialize schema.\n", "language": "markdown"},
    ]


def build_sandbox_boilerplate(prompt: str, *, database: str | None = None, include_db_schema: bool = False) -> list[dict[str, str]]:
    title = _slug_title(prompt)
    analysis = analyze_requirements(prompt)
    db = database or analysis["database"]["recommended"]

    files: list[dict[str, str]] = [
        {
            "path": ".omniforge/workspace.json",
            "content": json.dumps(
                {
                    "sandbox": True,
                    "title": title,
                    "domain": analysis.get("domain"),
                    "database": db,
                    "structure": ["frontend", "backend", "database", "config", "ai-agents", "deployment"],
                },
                indent=2,
            ),
            "language": "json",
        },
        {
            "path": "frontend/package.json",
            "content": json.dumps(
                {"name": title.lower().replace(" ", "-"), "private": True, "scripts": {"dev": "vite", "build": "vite build"}},
                indent=2,
            ),
            "language": "json",
        },
        {
            "path": "frontend/src/App.jsx",
            "content": f'''export default function App() {{
  return (
    <main style={{{{ fontFamily: "system-ui", minHeight: "100vh", background: "#12141c", color: "#e4e4e7", padding: 24 }}}}>
      <h1 style={{{{ color: "#22d3ee" }}}}>{title}</h1>
      <p>OmniForge sandbox · frontend agent scaffold</p>
    </main>
  );
}}
''',
            "language": "javascript",
        },
        {
            "path": "frontend/src/main.jsx",
            "content": '''import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(<App />);
''',
            "language": "javascript",
        },
        {
            "path": "backend/main.py",
            "content": f'''"""FastAPI — {title}"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.api import router as api_router

app = FastAPI(title="{title}")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {{"ok": True, "database": "{db}"}}
''',
            "language": "python",
        },
        {
            "path": "backend/routers/api.py",
            "content": '''from fastapi import APIRouter

router = APIRouter()

@router.get("/items")
def list_items():
    return {"items": [], "source": "backend-agent"}
''',
            "language": "python",
        },
        {
            "path": "backend/requirements.txt",
            "content": "fastapi>=0.115.0\nuvicorn[standard]>=0.32.0\npython-dotenv>=1.0.0\n",
            "language": "text",
        },
        {
            "path": "config/.env.example",
            "content": f"DATABASE_URL=\nJWT_SECRET_KEY=\nFRONTEND_ORIGIN=http://localhost:3000\nDB_ENGINE={db}\n",
            "language": "text",
        },
        {
            "path": "ai-agents/manifest.json",
            "content": json.dumps(
                {
                    "agents": ["frontend", "backend", "database", "devops", "optimization"],
                    "orchestrator": "omniforge-swarm",
                },
                indent=2,
            ),
            "language": "json",
        },
        {
            "path": "ai-agents/frontend-agent.md",
            "content": "# Frontend Agent\n\nRole: UI/UX, React layouts, responsive viewport.\n",
            "language": "markdown",
        },
        {
            "path": "ai-agents/backend-agent.md",
            "content": "# Backend Agent\n\nRole: REST APIs, business logic, auth middleware.\n",
            "language": "markdown",
        },
        {
            "path": "ai-agents/database-agent.md",
            "content": f"# Database Agent\n\nRecommended: **{db}**\n\nAwaiting user Yes/No before schema execution.\n",
            "language": "markdown",
        },
        {
            "path": "ai-agents/devops-agent.md",
            "content": "# DevOps Agent\n\nRole: Vercel/Netlify/Railway deployment, env injection.\n",
            "language": "markdown",
        },
        {
            "path": "ai-agents/optimization-agent.md",
            "content": "# Optimization Agent\n\nRole: performance tuning, security headers, index hints.\n",
            "language": "markdown",
        },
        {
            "path": "deployment/vercel.json",
            "content": json.dumps({"buildCommand": "cd frontend && npm run build", "outputDirectory": "frontend/dist"}, indent=2),
            "language": "json",
        },
        {
            "path": "deployment/netlify.toml",
            "content": '[build]\n  base = "frontend"\n  command = "npm run build"\n  publish = "dist"\n',
            "language": "text",
        },
        {
            "path": "deployment/docker-compose.yml",
            "content": "services:\n  api:\n    build: ./backend\n    ports:\n      - '8001:8001'\n",
            "language": "yaml",
        },
        {
            "path": "README.md",
            "content": f"""# {title}

OmniForge Engine sandbox — autonomous multi-agent scaffold.

```
project/
├── frontend/
├── backend/
├── database/
├── config/
├── ai-agents/
├── deployment/
└── README.md
```

## Agents
- Frontend · Backend · Database · DevOps · Optimization

## Run
```bash
cd backend && uvicorn main:app --reload --port 8001
cd frontend && npm install && npm run dev
```
""",
            "language": "markdown",
        },
    ]

    if include_db_schema:
        files.extend(_db_schema_files(db, title))
    else:
        files.append(
            {
                "path": "database/README.md",
                "content": f"# Database ({db})\n\n⚠ Awaiting approval: connect {db}?\n",
                "language": "markdown",
            }
        )

    return files


def merge_sandbox_into_bundle(bundle: dict[str, Any], prompt: str) -> dict[str, Any]:
    """Merge PRD sandbox tree with existing app builder files (sandbox paths win on conflict)."""
    sandbox = build_sandbox_boilerplate(prompt, include_db_schema=False)
    by_path: dict[str, dict[str, str]] = {}
    for f in bundle.get("files") or []:
        if f.get("path"):
            by_path[str(f["path"])] = f
    for f in sandbox:
        by_path[f["path"]] = f
    # Ensure preview paths from bundle preserved
    for key in ("preview.html", "src/App.jsx", "src/main.jsx", "index.html"):
        for f in bundle.get("files") or []:
            if f.get("path") == key:
                by_path[key] = f
    merged = list(by_path.values())
    bundle["files"] = merged
    bundle["sandbox"] = True
    return bundle


def database_init_files(database: str, prompt: str) -> list[dict[str, str]]:
    title = _slug_title(prompt)
    files = _db_schema_files(database, title)
    files.append(
        {
            "path": "config/.env",
            "content": f"DATABASE_URL=postgresql://localhost:5432/omnimind\nDB_ENGINE={database}\n",
            "language": "text",
        }
    )
    return files
