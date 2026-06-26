# OmniMind Production Sprint 4 — Bug Report

**Date:** 2026-06-17  
**Sprint:** Production Sprint 4 — QA + Testing + Reliability

---

## Summary

| Severity | Found | Fixed | Open |
|----------|-------|-------|------|
| Critical | 0 | 0 | 0 |
| High | 1 | 1 | 1* |
| Medium | 2 | 2 | 2 |
| Low | 2 | 2 | 1 |
| **Total** | **5** | **5** | **4** |

\*ERR-001 (medical API mismatch) pre-dates Sprint 4; documented, not introduced by QA work.

---

## Fixed This Sprint

### BUG-001 — Test module resolution failures

| Field | Value |
|-------|-------|
| **ID** | BUG-001 |
| **Severity** | High |
| **Component** | `frontend/tests/integration`, `security`, `smoke` |
| **Description** | Vitest could not resolve `../../../core/...` imports |
| **Reproduction** | `npm run test --prefix frontend` |
| **Root cause** | Wrong relative path depth from test subdirectories |
| **Fix** | Changed imports to `../../core/...` |
| **Verified** | ✅ All 6 frontend test files pass |

### BUG-002 — Unhandled ApiError rejection in Vitest

| Field | Value |
|-------|-------|
| **ID** | BUG-002 |
| **Severity** | Medium |
| **Component** | `lib/shared/http-client.ts`, `tests/unit/shared/http-client.test.ts` |
| **Description** | Test run reported unhandled rejection for ApiError |
| **Root cause** | Inflight promise tracking on uncached GET requests |
| **Fix** | Guard inflight with `cacheTtlMs > 0`; explicit try/catch in test |
| **Verified** | ✅ Clean test run, exit code 0 |

### BUG-003 — Zero-trust operator test incorrect setup

| Field | Value |
|-------|-------|
| **ID** | BUG-003 |
| **Severity** | Low |
| **Component** | `tests/security/zero-trust.test.ts` |
| **Description** | Test expected allow without trusted device |
| **Root cause** | ABAC `device_trust` check requires registered fingerprint |
| **Fix** | Register device + pass `deviceFingerprint` attribute |
| **Verified** | ✅ Security tests pass; confirms correct product behavior |

### BUG-004 — HTTP retry loop ambiguity

| Field | Value |
|-------|-------|
| **ID** | BUG-004 |
| **Severity** | Low |
| **Component** | `lib/shared/http-client.ts` |
| **Description** | Last retry attempt did not break cleanly |
| **Fix** | `if (attempt >= retries \|\| !retryable) break` |
| **Verified** | ✅ Unit tests pass |

### BUG-005 — Root verify script missing tests

| Field | Value |
|-------|-------|
| **ID** | BUG-005 |
| **Severity** | Medium |
| **Component** | Root `package.json` |
| **Description** | `npm run verify` did not run test suite |
| **Fix** | Added `test`, `test:frontend`, `test:backend`; updated `verify` |
| **Verified** | ✅ `npm run test` runs 19 tests |

---

## Open Bugs

### ERR-001 — Medical enterprise API contract mismatch

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Status** | Open (pre-existing) |
| **Reference** | `docs/TECH_DEBT_REPORT.md` |
| **Impact** | Medical production admin may hit 404 or schema drift |
| **Next step** | Contract tests in `lib/qa/contract-validator.ts` |

### ERR-002 — Crash logger untested

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | Open |
| **Impact** | Error boundary regression risk |
| **Next step** | React Testing Library + jsdom test |

### ERR-003 — slowapi Python 3.14 deprecation

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Status** | Open (upstream) |
| **Impact** | Warning in pytest output only |
| **Next step** | Track slowapi release |

### ERR-004 — No production crash export

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | Open (by design this sprint) |
| **Impact** | Crashes only in sessionStorage / memory |
| **Next step** | Sentry or `/quality/crashes` ingest endpoint |

---

## Regression Test Matrix

| Bug ID | Regression test |
|--------|-----------------|
| BUG-001 | `tests/integration/omnicore-boot.test.ts` |
| BUG-002 | `tests/unit/shared/http-client.test.ts` |
| BUG-003 | `tests/security/zero-trust.test.ts` |
| BUG-004 | `tests/unit/shared/http-client.test.ts` |
| BUG-005 | Root `npm run test` in CI |

---

## How to Report New Bugs

1. Add entry to this file with severity, component, repro steps
2. Add failing test in appropriate `frontend/tests/` suite
3. Link fix PR to regression test
4. Update `QUALITY_SCORE.md` if gate status changes
