# Master Architecture Report

**OmniMind Engineering Review** | 2026-06-17  
**Mode:** CTO / Principal Architect | Feature freeze

---

## Executive Summary

OmniMind is a **multi-service monorepo** with a production-ready **OmniCore V2 platform layer** and beta-grade vertical tools. Architecture follows a hub-and-spoke model: `omniCore` facade → domain modules → HTTP clients → FastAPI routers → MongoDB.

**Overall architecture grade: B+ (platform A-, monorepo B)**

---

## System Topology

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 15 (frontend/app)                                │
│  Providers → GlobalChrome → Shell routes / API routes       │
└───────────────────────────┬─────────────────────────────────┘
                            │ /omni-api rewrite
┌───────────────────────────▼─────────────────────────────────┐
│  backend/main.py — FastAPI V11 (:8001) — 83 routers         │
│  OmniCore · Medical · Visionary · OmniMusic · Entertainment │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    MongoDB            Redis (opt)        superapp_ai
         │                                     │
         └──────────────┬──────────────────────┘
                        ▼
              External LLM providers

Satellites (optional):
  backend-fastapi · gateway-go · core-python · frontend/server
```

---

## Layer Model

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Routes | `frontend/app` | Thin pages, API proxies |
| UI | `frontend/components` | React workspaces |
| Bridge | `frontend/lib` | Contexts, registries, hooks bridge |
| Domain | `frontend/core` | Business logic + ApiClients |
| API | `backend/routers` | REST + WebSocket |
| Persistence | `backend/lib` | Stores, executors |
| Services | `backend/services` | AI, integrations |

---

## Platform Modules (Production)

| Module | Facade | API Prefix |
|--------|--------|------------|
| OmniCore | `omniCore` | `/api/v1/omnicore` |
| AI Gateway | `omniCore.ai` | `/api/v1/omnicore/ai` |
| Ecosystem OS | `omniCore.ecosystem` | `/ecosystem` |
| Automation | `omniCore.automation` | `/automation` |
| Mission Control | `omniCore.missionControl` | `/mission-control` |
| OmniCloud | `omniCore.cloud` | `/omnicloud` |
| Security | `omniCore.security` | `/security` |

---

## Protected Modules (Unchanged)

- **OmniForge Engine** — `components/ide/`, `/omniforge-engine`
- **Architectural Designer** — `components/architect/`, `/architectural-designer`

---

## Architecture Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Dual HTTP clients (`lib/omnicore` vs `core`) | High | TD-001 consolidation sprint |
| Parallel backends (fastapi vs main) | Medium | Document canonical :8001 |
| Vertical stub UIs | Medium | Beta labels; phased hardening |
| `creative-visionary` vs `visionary-studio` overlap | Medium | Product unification plan |

---

## Integration Map

All platform integrations verified in engineering review:

Mission Control ✅ · Automation ✅ · OmniCloud ✅ · SDK ✅ · Plugins ✅ · Memory/AI ✅ · Ecosystem ✅

**OmniPilot:** No standalone module — fulfilled by Master Agent bridge + `omniCore.brain`.

---

## Folder Reports

See `docs/engineering-review/00-INDEX.md` for per-folder scores and changes.
