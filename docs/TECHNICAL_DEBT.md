# Technical Debt Register

**Quality Gate:** V2.0  
**Date:** 2026-06-17  
**Policy:** Feature freeze — document and prioritize; no new modules

---

## P0 — Release Blockers (None)

All platform tests pass. No P0 blockers for OmniCore V2.0 release.

---

## P1 — High Priority (Next Sprint)

| ID | Debt | Location | Impact | Effort |
|----|------|----------|--------|--------|
| TD-001 | Dual OmniCore HTTP stacks | `core/*ApiClient` vs `lib/omnicore/*-api` | Divergent behavior, double maintenance | 3d |
| TD-002 | Backend phase stub routers | `omnicore_assets`, `plugins`, `collaboration`, `security`, `quality` | Docstrings say "stubs" | 5d |
| TD-003 | Route prefix collisions | `/api/v1/tools`, `/api/spatial`, music APIs | Wrong handler risk | 2d |
| TD-004 | `creative-visionary` vs `visionary-studio` overlap | Two routes, two codebases | User confusion, duplicate maintenance | 5d |
| TD-005 | Contract tests not in CI | `lib/qa/contract-validator.ts` | Regressions undetected | 1d |
| TD-006 | SDK adoption minimal | `sdk/browser/packages/*` | Large unused surface | 3d |

---

## P2 — Medium Priority

| ID | Debt | Location | Impact | Effort |
|----|------|----------|--------|--------|
| TD-007 | Visionary UI architecture stubs | `components/visionary/**` | Incomplete feel | 10d |
| TD-008 | OmniMusic StubMusicAdapter | `lib/omnimusic-studio/ai/ModelRouter.ts` | No real inference | 8d |
| TD-009 | Medical enterprise stub parsers | `LabImportPipeline.ts` FHIR/HL7 | Production clinical gap | 10d |
| TD-010 | Auth WebAuthn stubs | `backend/auth/router.py` | Passkey not real | 5d |
| TD-011 | `OmniAutomationSDK` name collision | sdk vs plugins | Developer confusion | 0.5d |
| TD-012 | `backend-fastapi/` parallel service | Separate folder | Ops complexity | 3d |
| TD-013 | No root `.env.example` | Repo root | Onboarding friction | 0.5d |
| TD-014 | Unified log correlation ID | FE + BE | Debug difficulty | 2d |
| TD-015 | Entertainment API duplication | `main.py` inline + routers | Inconsistent responses | 2d |

---

## P3 — Low Priority

| ID | Debt | Location | Impact | Effort |
|----|------|----------|--------|--------|
| TD-016 | Deprecated SDK re-exports | `sdk/api/`, `sdk/generators/` | Clutter | 1d |
| TD-017 | `OmniMindOSRootLayout` deprecated | `components/os/` | Dead export | 0.5d |
| TD-018 | Coverage HTML artifacts | `frontend/coverage/` | Repo bloat | 0.1d |
| TD-019 | `tsconfig.tsbuildinfo` tracked | `frontend/` | Noise in git | 0.1d |
| TD-020 | Legacy redirects | `game-dev`, `app-builder` | Keep — intentional aliases | 0d |
| TD-021 | webpack critical dependency warning | `lib/server/omnitv-events.ts` | Build warning | 1d |
| TD-022 | Python 3.16 asyncio deprecation | slowapi | Future break | External |

---

## Resolved This Sprint

| ID | Resolution |
|----|------------|
| TD-R01 | `sdk/automation` consolidated to `omniAutomationApiClient` |
| TD-R02 | Ecosystem registry `/dashboard` → `/` (direct navigation) |
| TD-R03 | Contract validator extended to 9 platform endpoints |

---

## Debt by Domain

```
OmniCore platform     ████░░░░░░  40% of P1
Vertical tools        ███████░░░  70% of P2
Infrastructure        ███░░░░░░░  30% of P1+P2
SDK / Developer       █████░░░░░  50% of P1+P2
```

---

## Paydown Strategy

1. **Sprint 1 (post-freeze):** TD-001, TD-005, TD-011 — consolidate clients, CI contracts
2. **Sprint 2:** TD-003, TD-004 — route cleanup, visionary unification plan
3. **Sprint 3+:** TD-007, TD-008, TD-009 — vertical hardening per product owner

**Do not pay down** by deleting OmniForge or Architectural Designer internals.

---

## Total Estimated Debt

| Priority | Items | Effort |
|----------|-------|--------|
| P1 | 6 | ~19 days |
| P2 | 9 | ~43 days |
| P3 | 7 | ~3 days |
| **Total** | **22 open** | **~65 dev-days** |

Vertical tool debt (Visionary, Music, Medical) accounts for ~60% of remaining effort.
