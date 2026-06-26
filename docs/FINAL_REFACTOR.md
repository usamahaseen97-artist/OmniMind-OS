# Final Refactor Plan

**Quality Gate:** V2.0 Production Freeze  
**Date:** 2026-06-17  
**Principle:** Improve, connect, optimize, stabilize — no new tools, no UI redesign

---

## Completed Refactors (This Sprint)

### 1. Automation SDK deduplication

**Before:** `frontend/sdk/automation/index.ts` duplicated fetch logic  
**After:** Delegates to `omniAutomationApiClient` from `core/automation/`  
**Impact:** Single HTTP implementation; plugin trigger hooks preserved

### 2. Navigation stabilization

**Before:** Ecosystem registry linked to `/dashboard` (redirect to `/`)  
**After:** Direct links to `/`, `/?tab=docs`, `/?settings=1`  
**Impact:** Fewer redirects; correct breadcrumbs for root hub

### 3. API contract expansion

**Before:** 3 contract checks  
**After:** 9 checks covering mission-control, automation, omnicloud, ecosystem, quality, healthz  
**File:** `frontend/lib/qa/contract-validator.ts`

---

## Approved Refactors (Next — No New Features)

### Phase A: HTTP Client Consolidation (3 days)

**Goal:** One client per domain in `frontend/core/`

| Step | Action |
|------|--------|
| A1 | Audit all `lib/omnicore/*-api.ts` consumers |
| A2 | Migrate `use-omnicore-bridge.ts` to `omniCore.*` facades |
| A3 | Deprecate `lib/omnicore/omnicore-api.ts` family |
| A4 | Keep thin re-exports for backward compat one release |

**Do not touch:** OmniForge engine HTTP, Architectural Designer APIs

### Phase B: Route & API Hygiene (2 days)

| Step | Action |
|------|--------|
| B1 | Resolve `/api/v1/tools` dual-router collision |
| B2 | Document canonical music API (`/api/v1/music`) |
| B3 | Add `ecosystemToolByPath` cases for `/omnicloud`, `/mission-control`, `/automation-engine` |
| B4 | Verify `sovereign-tool-registry.ts` `apiProbe` paths against live backend |

### Phase C: CI Hardening (1 day)

| Step | Action |
|------|--------|
| C1 | Add `checkContracts` to root `verify` script (backend required) |
| C2 | Add `frontend/coverage/` to `.gitignore` if not already |
| C3 | Ensure `tsconfig.tsbuildinfo` gitignored |

### Phase D: Naming Clarity (0.5 day)

| Step | Action |
|------|--------|
| D1 | Rename plugin `OmniAutomationSDK` → `OmniPluginAutomationSDK` |
| D2 | Rename collaboration `OmniSecurityCenter` → `OmniCollabSecurityCenter` |

### Phase E: Vertical Tool Hardening (Per product — post-freeze)

| Tool | Refactor focus |
|------|----------------|
| Visionary Studio | Replace architecture stub labels with real pipelines or "Beta" badges |
| OmniMusic | Replace `StubMusicAdapter` with provider routing |
| Medical Enterprise | Implement FHIR/HL7 parsers or gate behind enterprise flag |
| Entertainment | Consolidate inline `main.py` handlers into routers |

**These are not OS-layer refactors — schedule per vertical owner.**

---

## Explicit Non-Goals

- Do not redesign OmniForge Engine UI or internals
- Do not redesign Architectural Designer
- Do not remove legacy redirect routes
- Do not delete `backend-fastapi/` without migration plan
- Do not remove mock fallbacks until real providers wired
- Do not merge `creative-visionary` into `visionary-studio` without product decision

---

## Connection Map (Target State)

```
User
  │
  ▼
app/(shell)/* ──► components/* ──► omniCore.<module>
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              OmniCoreApiClient  OmniCloudApiClient  Tool-specific
                    │                 │              (unchanged)
                    └────────┬────────┘
                             ▼
                    /api/v1/omnicore/*
                             ▼
                    backend/lib/* + services/
                             ▼
                         MongoDB
```

---

## File Change Summary (This Sprint)

| File | Change |
|------|--------|
| `frontend/sdk/automation/index.ts` | Consolidated to core API client |
| `frontend/lib/omnimind-ecosystem-registry.ts` | `/` navigation (verified) |
| `frontend/lib/qa/contract-validator.ts` | Extended contracts |
| `docs/MASTER_AUDIT.md` | Created |
| `docs/CODE_QUALITY.md` | Created |
| `docs/SYSTEM_HEALTH.md` | Created |
| `docs/TECHNICAL_DEBT.md` | Created |
| `docs/BUG_TRACKER.md` | Created |
| `docs/PERFORMANCE_BENCHMARK.md` | Created |
| `docs/FINAL_REFACTOR.md` | This document |

---

## Release Sign-Off Criteria

| Criterion | Met |
|-----------|-----|
| Lint clean | Yes |
| 68 tests pass | Yes |
| Production build | Yes |
| Platform APIs respond | Yes (8/8) |
| No S1 bugs | Yes |
| OmniForge/Architect untouched | Yes |
| 7 quality docs generated | Yes |

**OmniMind V2.0 platform layer is cleared for enterprise production release.**

Vertical tools ship with documented beta/stub limitations per `BUG_TRACKER.md` LIM-* entries.

---

## Post-Release Monitoring

1. Run `npm run verify` on every merge to main
2. Weekly contract probe against staging backend
3. Track bundle size on root `/` — alert if > 400 kB First Load
4. Review `TECHNICAL_DEBT.md` P1 items each sprint planning
