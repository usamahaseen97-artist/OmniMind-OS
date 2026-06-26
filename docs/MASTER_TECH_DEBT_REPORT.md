# Master Technical Debt Report

**OmniMind Engineering Review** | 2026-06-17

---

## Debt Summary

| Priority | Open Items | Est. Effort |
|----------|------------|-------------|
| P1 | 6 | ~19 days |
| P2 | 9 | ~43 days |
| P3 | 7 | ~3 days |
| **Total** | **22** | **~65 dev-days** |

---

## P1 — High Priority

| ID | Item | Location |
|----|------|----------|
| TD-001 | Dual OmniCore HTTP stacks | `core/` vs `lib/omnicore/` |
| TD-002 | Backend phase stub routers | omnicore_assets, plugins, etc. |
| TD-003 | Route prefix collisions | music APIs |
| TD-004 | visionary-studio vs creative-visionary | Two codebases |
| TD-005 | Contract tests not in CI | `contract-validator.ts` — **partial:** `verify:contracts` in `verify` |
| TD-006 | SDK adoption minimal | `sdk/browser/packages/` |

---

## P2 — Medium (Vertical + Infra)

| ID | Item |
|----|------|
| TD-007 | Visionary UI architecture stubs |
| TD-008 | OmniMusic StubMusicAdapter |
| TD-009 | Medical FHIR/HL7 parsers |
| ~~LIB-001~~ | ~~`enterprise-analytics connectSource` sample data~~ — **resolved Cycle 2** |
| TD-010–015 | Auth stubs, parallel backends, entertainment API dup |

---

## Debt by Folder (Review Scores)

| Folder | Tech Debt Score (higher = more debt) |
|--------|--------------------------------------|
| `generated/` | 40 |
| `backend-fastapi/` | 45 |
| `visionary/`, `omnimusic/` components | 35 |
| `frontend/lib/` | 30 |
| `frontend/sdk/` | 28 |
| `frontend/app/` | 15 |
| `frontend/hooks/` | 12 |

---

## Resolved This Review Cycle

TD-R01 through TD-R09 — see `docs/MASTER_REFACTOR_REPORT.md`

---

## Paydown Strategy

1. **Sprint 1:** TD-001, TD-005, TD-011
2. **Sprint 2:** TD-003, TD-004
3. **Sprint 3+:** Vertical hardening per product owner

Full register: `docs/TECHNICAL_DEBT.md`
