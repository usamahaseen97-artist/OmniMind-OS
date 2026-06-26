# OmniMind Production Sprint 1 — Technical Debt Report

**Date:** June 2026  
**Debt posture:** Medium (manageable with phased remediation)  
**Trend:** Improving — OmniCore phases 1–5 and Sprint 1 refactors add structure

---

## Debt Scorecard

| Category | Score (1=low, 5=high) | Trend |
|----------|----------------------|-------|
| Backend god-file | 5 | → Sprint 2 target |
| API duplication | 4 | → improving (http-client) |
| Frontend barrels | 4 | stable |
| Dual medical stack | 4 | documented |
| Chat persistence | 4 | open |
| Import inconsistency | 3 | open |
| Dead legacy code | 2 | ↓ Sprint 1 cleanup |
| SDK legacy re-exports | 2 | stable |
| Auth defaults | 3 | security debt |
| Test coverage | 4 | open |

---

## P0 — Correctness Debt (fix before production hardening)

### 1. Medical API contract mismatch

| Frontend | Backend |
|----------|---------|
| `lib/medical-enterprise/api-contracts.ts` → `GET /api/v1/medical-enterprise/patients` | **Route does not exist** |
| Sovereign registry probes `/patients` | Routers: `/his`, `/imaging`, `/laboratory`, `/multi-agent`, `/governance`, `/production` |

**Action:** Implement patients router OR update contracts to `/his/emr/{patient_id}` shapes.

**Owner:** Medical enterprise team  
**Effort:** 2–3 days

### 2. Router prefix collisions

| Prefix | Colliding routers |
|--------|-------------------|
| `/api/v1/tools` | `omni_tools.py`, `tools_status.py` |
| `/api/v1/business` | `business_automation.py`, `core_tools/business.py` |
| `/api/v1/marketing` | `marketing.py`, `core_tools/marketing.py`, `main.py` inline |

**Action:** Namespace `tools_status` → `/api/v1/tools-status/{slug}` or merge under registry.

**Effort:** 1 day

### 3. Sovereign tool enum drift

- `schemas/sovereign_tools.py`: 11 tools
- `tools_status.py`: claims `count: 16`
- `sovereign-tool-registry.ts`: extended slugs (omnimusic, omnitv, medical-suite, etc.)

**Action:** Single source of truth enum shared via OpenAPI or codegen.

---

## P1 — Structural Debt

### 4. `backend/main.py` (~1,400 lines)

Contains:
- CORS, middleware, exception handlers
- 75+ router mounts
- Inline routes: entertainment search, maps, theme, generate-ad, health checks
- `INTEGRATION_KEYS` hardcoded list
- `_DEV_ORIGINS` with LAN IP

**Action:** Extract inline routes; move constants to `config.py`.

### 5. Triple chat persistence

| Store | Path | Technology |
|-------|------|------------|
| Stream | `/api/chat` | Mongo + gemini stream |
| Sessions | `/api/chat/sessions` | SQLite (`chat_history_sql.py`) |
| v1 | `/api/v1/chats` | Mongo (`conversation_store.py`) |

**Action:** Canonical store + adapters; deprecate others with sunset headers.

### 6. Duplicate fetch helpers

**Status:** OmniCore APIs migrated to `createApiClient`.  
**Remaining:** 12+ module APIs (visionary, omnimusic-studio) + 28 flat `lib/*-api.ts`.

### 7. Mega components / hooks

| File | Lines | Debt |
|------|-------|------|
| `OmniChatShell.tsx` | ~1,530 | Unmaintainable monolith |
| `omnimind-ecosystem-context.tsx` | ~683 | God context |
| `use-omnicore-bridge.ts` | ~500 | God hook |
| `omniforge-api.ts` | ~499 | God API client |

### 8. Inconsistent error handling (backend)

Three tiers undocumented:
1. **Strict** — `HTTPException` + `StrictModel`
2. **Degraded** — entertainment returns HTTP 200 + `degraded: true`
3. **Stub** — enterprise routers always `ok: true` with in-memory dicts

**Action:** Document in `backend/docs/ERROR_POLICY.md`; apply consistently to new routes.

---

## P2 — Consistency Debt

### 9. Import path split

- 90% relative `../../`
- Medical uses `@/core/`, `@/lib/`
- SDK uses `@omnimind/sdk`

**Action:** Pick one cross-module convention; ESLint enforce.

### 10. Dual medical diagnostic stacks

| Stack | Status |
|-------|--------|
| Legacy `/medical-diagnostic` | Active — `MedicalStudioShell`, WebSocket API |
| Enterprise `/medical-diagnostic-suite` | Active — full HIS/imaging/lab |

**Action:** Publish migration guide; avoid building new features on legacy stack.

### 11. Music API naming confusion

| File | Purpose |
|------|---------|
| `omnimusic-api.ts` | Entertainment streaming catalog |
| `music-tool-api.ts` | Chat Spotify/YouTube search |
| `omnimusic-studio/studio-api.ts` | DAW `/api/v1/omnimusic/studio` |

**Action:** Rename to `omnimusic-streaming-api.ts`, `music-chat-search-api.ts` (aliases for compat).

### 12. Marketing API duplication

- `marketing-campaign-api.ts` — `MarketingHubWorkspace` only
- `visionary/marketing/marketing-api.ts` — Visionary submodule
- Backend: 3+ ad generation pipelines with different payload shapes (`ad_copy` vs `ad_copywriting`)

### 13. Unused / orphan code (remaining)

| File | Status |
|------|--------|
| `lib/medical-enterprise/use-clinical-intelligence.ts` | Zero code importers (docs only) |
| `sdk/OmniMindSDK.ts` (root) | Deprecated re-export |
| `backend/sandbox/**` | Demo-only, not mounted |
| `generated/omnimind-app/backend/` | Stale artifact |
| `core_engine/Dockerfile` | Duplicate of `backend/Dockerfile` |

**Sprint 1 removed:** Sidebar, TopBar, RightPanel, IntegrationGrid, GlassCard, lib/types.ts

---

## P3 — Security & Ops Debt

### 14. JWT enforcement off by default

`jwt_enforce_middleware` defaults `false`. Public path allowlist maintained separately from routers.

**Action:** Production checklist: `JWT_ENFORCE=true` + document required env vars.

### 15. In-memory enterprise stubs

All `omnicore_*.py`, `medical_enterprise_*.py`, most `visionary_studio_*.py` use module-level dicts — no persistence, no multi-instance safety.

**Action:** Expected for architecture phase; wire to Mongo/Postgres before production tenancy.

### 16. Configuration sprawl

- `backend/.env.example` ~150 vars
- `INTEGRATION_KEYS` duplicated in `main.py`, `integration_gateway.py`
- `FAST_STREAM_SETTINGS` in app state, not Settings

---

## P4 — Developer Experience Debt

### 17. Missing cross-module pattern doc

OmniMusic/Visionary UI+engine mirror pattern undocumented (now noted in ARCHITECTURE_AUDIT).

**Action:** Create `frontend/docs/MODULE_PATTERN.md`.

### 18. Test coverage gaps

No systematic unit tests for:
- `core/omnicore/*` engines
- `core/collaboration/*` permission engine
- Bridge hooks

**Action:** Vitest for domain layer; Playwright for sovereign route smoke tests.

### 19. OpenAPI / contract sharing

Frontend types hand-written; backend Pydantic inline. No codegen pipeline.

**Action:** Export OpenAPI from FastAPI → `openapi-typescript` for API clients.

---

## Debt Paydown Roadmap

```
Sprint 1 (DONE)     ████░░░░░░  Shared HTTP client, lazy workspaces, dead code, probes
Sprint 2            ██████░░░░  API migration, main.py extract, Visionary lazy load
Sprint 3            ████████░░  Medical contract align, chat unify, barrel break
Sprint 4            ██████████  Schema package, OpenAPI codegen, JWT prod defaults
```

---

## Quick Wins (< 1 day each)

1. Add `@deprecated` JSDoc to `use-clinical-intelligence.ts`
2. `.gitignore` `generated/`, `__pycache__`, duplicate `main.py` artifacts
3. Rename music API files with re-export aliases (no import breakage)
4. Add `optimizePackageImports: ['lucide-react']` to `next.config.ts`
5. Cap all unbounded in-memory logs in collaboration engines (audit done — most capped)

---

## Items Explicitly NOT Debt

| Item | Reason |
|------|--------|
| UI + `*Core.ts` engine pairs | Intentional separation of presentation and domain |
| `core/plugins/` vs `omnicore-platform/` | Intentional — legacy universal vs OmniCore extension |
| Multiple sovereign tool routes | Product requirement — 16+ tools |
| Deep provider tree | Required for modular OS; optimize with split contexts later |

---

*Track remediation in sprint boards. Re-audit after Sprint 2 refactors.*
