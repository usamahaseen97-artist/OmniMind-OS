# OmniMind Production Sprint 4 — Coverage Report

**Date:** 2026-06-17  
**Tool:** Vitest + `@vitest/coverage-v8`  
**Include scope:** `core/**/*.ts`, `lib/shared/**/*.ts`, `lib/qa/**/*.ts`

---

## Overall

| Metric | Value |
|--------|-------|
| **Statements** | **11.81%** |
| Branches | 48.42% |
| Functions | 23.19% |
| Lines | 11.81% |

> Low overall percentage is expected: coverage scope includes the entire `core/` tree (medical, brain, agent, tool-framework) while Sprint 4 tests focus on security, collaboration, OmniCore boot, HTTP, and AI validation smoke paths.

---

## High-Value Module Coverage

| Module | Statements | Notes |
|--------|------------|-------|
| `core/omnicore/OmniCore.ts` | **100%** | Boot + snapshot fully exercised |
| `core/quality/OmniAIValidator.ts` | **98.21%** | Smoke test runs prompt pipeline |
| `core/quality/constants.ts` | **100%** | Catalog constants |
| `core/security/OmniZeroTrustEngine.ts` | **89.28%** | Security tests |
| `core/security/OmniAuthorizationEngine.ts` | **86.66%** | RBAC unit + security tests |
| `core/security/OmniComplianceCenter.ts` | **100%** | Indirect via boot |
| `lib/shared/http-client.ts` | **77.98%** | Unit tests (GET cache, errors, retry) |
| `lib/qa/api-error-handler.ts` | **71.87%** | ApiError mapping tests |
| `core/quality/OmniQuality.ts` | **82.50%** | Integration boot |
| `core/quality/` (aggregate) | **49.84%** | Quality platform |
| `core/security/` (aggregate) | **44.90%** | Security platform |
| `core/ai/` (aggregate) | **48.83%** | Pulled in by AI validator smoke |

---

## Uncovered Critical Paths (Priority)

| Area | Current | Target | Gap |
|------|---------|--------|-----|
| `lib/qa/crash-logger.ts` | 0% | 80% | Needs jsdom / error boundary test |
| `lib/qa/contract-validator.ts` | 0% | 70% | API contract unit tests |
| `lib/shared/offline-queue.ts` | 0% | 60% | Offline recovery tests |
| `core/security/OmniAuthEngine.ts` | 24.61% | 50% | OAuth/passkey flow mocks |
| `core/brain/**` | 0% | 30% | Brain orchestrator smoke |
| Medical enterprise APIs | 0% | 25% | Contract tests (known tech debt) |

---

## Backend Coverage

Backend pytest does not yet emit coverage reports. Recommended:

```bash
pip install pytest-cov
pytest tests/ --cov=lib --cov=routers --cov-report=term-missing
```

**Endpoints exercised:** 7 routes across auth, security, quality, and projects.

---

## HTML Report

After `npm run test:coverage --prefix frontend`:

- **HTML:** `frontend/coverage/index.html`
- **Summary:** `frontend/coverage/coverage-summary.json` (when generated)

---

## Coverage Goals (Production Readiness)

| Phase | Statement % (scoped) | Timeline |
|-------|---------------------|----------|
| Sprint 4 (current) | 12% global / 50% quality+security | ✅ Baseline |
| Sprint 5 | 25% global / 70% platform libs | Target |
| GA | 40% global / 85% auth+http+quality | Target |

**Scoped modules for GA gate:** `core/quality`, `core/security`, `lib/shared`, `lib/qa`, `core/omnicore/OmniCore.ts`.
