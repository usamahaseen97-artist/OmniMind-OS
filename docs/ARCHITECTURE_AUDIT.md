# OmniMind Production Sprint 1 — Architecture Audit

**Date:** June 2026  
**Role:** Chief Software Architect review  
**Scope:** Full stack — Frontend, Backend, SDK, OmniCore, Visionary Studio, OmniMusic, Medical Diagnostic, OmniForge, Shared Components  
**Constraint:** Extension and refactor only — no feature removal, no workflow changes

---

## Executive Summary

OmniMind is a **Next.js 15 + FastAPI** enterprise AI operating system (~1,900 files). The codebase follows a recognizable three-tier module pattern (`core/` → `lib/` → `components/`) for flagship products, but layer boundaries are inconsistently enforced. State is React Context + custom `useSyncExternalStore` stores (no Zustand). The backend is a monolithic FastAPI app with 85+ routers and 126 services.

| Area | Grade | Primary Issue |
|------|-------|---------------|
| Layer separation | B- | `core/` clean; `lib/` mixes application + infrastructure |
| Module consistency | B | OmniCore/Visionary/OmniMusic share patterns; medical uses `@/` only |
| API surface | C+ | Duplicate endpoints, triple chat stores, probe URL drift |
| Bundle / perf | C+ | Flagship workspaces eagerly imported (partially fixed Sprint 1) |
| Type safety | B+ | Strict TS; frontend/backend contract gaps in medical |
| SDK | A- | Clean browser/node/shared split; legacy re-exports remain |
| Technical debt | Medium | God-file `main.py`, duplicate fetch helpers, dead legacy files |

### Sprint 1 refactors applied

1. **Shared HTTP client** — `frontend/lib/shared/http-client.ts`; OmniCore API modules migrated
2. **Lazy flagship workspaces** — `dynamic-flagship-workspaces.tsx` + `ZoneContentRouter` code-split
3. **Backend probe fixes** — `tools_status.py` architect/omnimap/omnitv URLs corrected
4. **Dead code removal** — verified-unused `Sidebar`, `TopBar`, `RightPanel`, `IntegrationGrid`, `GlassCard`, `lib/types.ts`

---

## Target Enterprise Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION     app/, components/, design-system/         │
│  (React UI, pages, shells, panels)                          │
├─────────────────────────────────────────────────────────────┤
│  APPLICATION      lib/*-context.tsx, use-*-bridge.ts        │
│  (React integration, orchestration, hooks)                  │
├─────────────────────────────────────────────────────────────┤
│  DOMAIN           core/                                     │
│  (pure TS engines, facades, business rules — no React)      │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE   lib/*-api.ts, lib/shared/, backend/       │
│  (HTTP, persistence, external services)                     │
├─────────────────────────────────────────────────────────────┤
│  SHARED           design-system/, lib/shared/, hooks/       │
│  (cross-cutting UI primitives, HTTP client, utilities)      │
└─────────────────────────────────────────────────────────────┘
```

### Current mapping

| Layer | Canonical path | Notes |
|-------|----------------|-------|
| Presentation | `frontend/components/`, `frontend/app/` | Domain-grouped (`omnimusic/`, `visionary/`, `medical-enterprise/`) |
| Application | `frontend/lib/*-context.tsx`, `use-*-bridge.ts` | 22 context providers; bridges compose domain engines |
| Domain | `frontend/core/` | `omnicore/`, `ai/`, `assets/`, `collaboration/`, `plugins/`, `brain/`, `medical-enterprise/` |
| Infrastructure | `frontend/lib/*-api.ts`, `backend/` | 45+ API client files; monolithic FastAPI |
| Shared | `frontend/design-system/`, `frontend/lib/shared/`, `frontend/hooks/` | New `http-client` in Sprint 1 |
| SDK | `frontend/sdk/{shared,browser,node}/` | Official `@omnimind/sdk` package |

---

## Module Architecture

### OmniCore (Phases 1–5)

```
core/omnicore/          → OS foundation (projects, layout, dock, session)
core/ai/                → Universal AI platform
core/assets/            → Asset & storage platform
core/plugins/omnicore-platform/  → Extension platform (separate from legacy core/plugins/)
core/collaboration/     → Enterprise org/RBAC/realtime

lib/omnicore/           → React bridge + REST clients
```

**Pattern:** `omniCore.<subsystem>` facade; `useOmniCoreBridge()` exposes React slice.

### Visionary Studio

```
components/visionary/   → UI (editor, vfx, marketing, 3d, automation)
lib/visionary/          → 7 nested contexts + per-submodule engines + APIs
app/(shell)/visionary-studio/
```

**Issue:** `lib/visionary/index.ts` mega-barrel prevents tree-shaking.

### OmniMusic (dual product)

| Product | Route | Stack |
|---------|-------|-------|
| DAW Studio | `/omnimusic` | `components/omnimusic/` + `lib/omnimusic-studio/` |
| Entertainment player | OS shell | `components/entertainment/OmniMusicView.tsx` + `lib/omnimusic-api.ts` |

**Issue:** Three music API names (`omnimusic-api`, `music-tool-api`, `studio-api`) confuse ownership.

### Medical (dual stack)

| Stack | Route | Components | API |
|-------|-------|------------|-----|
| Legacy diagnostic | `/medical-diagnostic` | `components/medical/` | `medical-diagnostic-api.ts` |
| Enterprise suite | `/medical-diagnostic-suite` | `components/medical-enterprise/` | `core/medical-enterprise/` + hooks |

**Issue:** `api-contracts.ts` documents `/patients` routes that do not exist on backend.

### OmniForge

```
components/ide/layouts/omniforge/  → IDE shell, comms, mobile
lib/omniforge-api.ts               → Large multi-domain client (~500 lines)
backend/services/omniforge_*         → Architect, swarm, sandbox engines
```

### SDK

```
frontend/sdk/shared/    → types, validation
frontend/sdk/browser/   → OmniMindSDK, UniversalAPI (client-safe)
frontend/sdk/node/      → CLI, generators
```

Legacy root re-exports (`sdk/OmniMindSDK.ts`, `sdk/types.ts`) remain for compatibility.

---

## Duplicate Inventory

### Intentional mirrors (UI + engine)

OmniMusic and Visionary use `Component.tsx` + `*Core.ts` / `lib/*Engine.ts` pairs. This is **by design** — not duplication to remove, but to document.

### True duplicates to consolidate (future sprints)

| Category | Instances | Action |
|----------|-----------|--------|
| `request()` fetch helper | 17+ `*-api.ts` files | Migrate to `createApiClient` (OmniCore done) |
| `NotificationCenter` | omnicore, collaboration, visionary automation | Namespace via module path; no rename needed |
| `ModelRouter` | omnimusic, visionary, core/ai | Domain-specific; document distinction |
| Marketing API | `marketing-campaign-api.ts`, `visionary/marketing-api.ts` | Unify or namespace |
| Chat persistence | Mongo, SQLite, inline | Pick canonical store |
| `main.py` inline routes | entertainment, maps, theme, ads | Extract to routers |

---

## Import Path Standard

| Style | Usage | Recommendation |
|-------|-------|----------------|
| Relative `../../` | ~90% of codebase | Keep for intra-module imports |
| `@/` alias | Medical enterprise only | Extend to all modules OR revert medical to relative |
| `@omnimind/sdk` | SDK internals | Enforce via ESLint boundary rule |

**Target:** `@/core/*`, `@/lib/*`, `@/components/*` for cross-module; relative within module folders.

---

## State Management

| Pattern | Count | Location |
|---------|-------|----------|
| React Context | 22 | `lib/*-context.tsx` |
| `useSyncExternalStore` | 10 | `lib/*-store.ts` |
| Bridge hooks | 7+ | `use-omnicore-bridge`, `use-*-bridge` (OmniMusic) |
| Singleton engines | Many | `core/**/index.ts` exports |

**Risk:** 7-level provider tree in `app/providers.tsx` — any context update can cascade re-renders.

---

## Backend Architecture

| Metric | Value |
|--------|-------|
| Routers | 85 modules |
| Services | 126 modules |
| Schemas | 4 files (under-scoped) |
| `main.py` | ~1,400 lines |

**Critical routing issues:**
- `/api/v1/tools` shared by `omni_tools.py` and `tools_status.py`
- `/api/v1/business` shared by `business_automation.py` and `core_tools/business.py`
- `/api/v1/marketing` — three parallel ad pipelines

---

## Actionable Recommendations (Prioritized)

### P0 — Correctness
1. Align medical `api-contracts.ts` with backend `medical_enterprise_*.py` routes
2. Resolve `/api/v1/tools` router prefix collision
3. Fix remaining `tools_status` probes as routes evolve

### P1 — Structure (Sprint 2)
4. Migrate remaining `*-api.ts` to `createApiClient`
5. Extract `main.py` inline routes into dedicated routers
6. Add `backend/schemas/{domain}.py` for shared Pydantic models
7. Break `lib/visionary/index.ts` and `components/omnimusic/index.ts` barrels

### P2 — Consistency
8. Standardize `@/` imports project-wide
9. Document dual medical stack migration path
10. ESLint: `no-restricted-imports` for SDK legacy paths

### P3 — Scale
11. Split `OmniChatShell.tsx` (~1,530 lines)
12. Split `use-omnicore-bridge.ts` (~500 lines) into subsystem bridges
13. Lazy-load Visionary sub-workspaces in `VisionaryStudioLayout.tsx`

---

## Verification

```bash
npm run lint
npm run typecheck
```

Both pass after Sprint 1 refactors.

---

*See also: `REFACTOR_REPORT.md`, `PERFORMANCE_REPORT.md`, `TECH_DEBT_REPORT.md`*
