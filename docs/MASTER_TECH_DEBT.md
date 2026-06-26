# OmniMind Master Technical Debt

**Date:** 2026-06-17  
**Total open items:** 24  
**Estimated paydown:** ~62 dev-days

---

## Summary

| Priority | Open | Resolved (audit cycle) |
|----------|------|----------------------|
| Critical | 0 | — |
| P1 High | 5 | 2 |
| P2 Medium | 12 | 1 |
| P3 Low | 7 | 0 |

---

## P1 — High (Blocks GA)

| ID | Item | Location | Effort | Status |
|----|------|----------|--------|--------|
| TD-001 | Dual OmniCore HTTP stacks | `lib/omnicore/*` vs `core/*ApiClient` | 5d | **Partial** — `omnicore-api`, `omnicore-ai-api` done |
| TD-002 | Backend phase stub routers | omnicore_assets, plugins, collaboration, verticals | 15d | Open |
| TD-003 | Music API prefix collisions | `entertainment/music.py`, `omnimusic_studio*` | 2d | Open |
| TD-004 | `creative-visionary` vs `visionary-studio` | Registry, routes, components | 3d | Open |
| TD-005 | Contract tests not in CI | `verify-contracts.ts`, `ci.yml` | 1d | **Partial** — local verify only |
| TD-006 | E2E not in CI | Playwright exists locally | 2d | Open |

---

## P2 — Medium

| ID | Item | Effort |
|----|------|--------|
| TD-007 | Visionary UI architecture stubs | 15d |
| TD-008 | OmniMusic `StubMusicAdapter` | 12d |
| TD-009 | Medical FHIR/HL7 parsers | 20d |
| TD-010 | Auth SSO/Passkey placeholders | 8d |
| TD-011 | Parallel backends (`backend-fastapi`, `gateway-go`) | 3d doc + deprecate |
| TD-012 | SDK browser/node duplication | 5d |
| TD-013 | SDK low adoption | 10d |
| TD-014 | Entertainment API duplication | 4d |
| TD-015 | `useOmniCore()` migration incomplete in OS chrome | 3d |
| TD-016 | pytest-cov not configured | 2d |
| TD-017 | Vitest global coverage gate | 2d |
| TD-018 | External APM (Sentry) | 2d |

---

## P3 — Low

| ID | Item |
|----|------|
| TD-019 | `omnicore-quality-api.ts` dead code |
| TD-020 | `generated/` folder confusion |
| TD-021 | Python slowapi deprecation |
| TD-022 | npm `devdir` config warning |
| TD-023 | OmniPilot module naming (Art. 5) |
| TD-024 | i18n expansion |

---

## Resolved This Audit Cycle

| ID | Resolution |
|----|------------|
| LIB-001 | `enterprise-analytics connectSource` → live API |
| TD-001a | `omnicore-api` → `omniCoreApiClient` |
| TD-001b | `omnicore-ai-api` → `omniAIApiClient` |
| PERF-001 | Root hub code split (389→219 kB FLJS) |

---

## Paydown Strategy

### Before RC (mandatory)
1. TD-006 — E2E in CI
2. TD-005 — Contract probe in CI with backend service
3. Reproduce/fix BUG-C01 build

### Before GA
1. TD-001 — Complete HTTP consolidation
2. TD-003, TD-004 — Route hygiene
3. TD-002 — Vertical stub exit or explicit beta manifest

### Ongoing
- TD-007–009 per product owner vertical roadmap

---

## Debt by Folder

| Folder | Debt Score (1=low, 10=high) |
|--------|----------------------------|
| `backend/routers/visionary_*` | 9 |
| `backend/routers/medical_*` | 9 |
| `backend/routers/omnimusic_*` | 8 |
| `frontend/lib/visionary/` | 8 |
| `frontend/lib/omnimusic-studio/` | 8 |
| `frontend/lib/omnicore/` | 5 |
| `frontend/core/omnicore/` | 3 |
| `frontend/core/omnicloud/` | 3 |
| `frontend/sdk/` | 7 |
| `docs/` | 2 |
