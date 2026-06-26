# OmniMind Master Bug List

**Date:** 2026-06-17  
**Total issues:** 47 catalogued (4 Critical, 12 High, 18 Medium, 13 Low)

---

## Critical

| ID | Area | Issue | Location | Impact |
|----|------|-------|----------|--------|
| **BUG-C01** | Build | `next build` failed: `PageNotFoundError` for `/creative-visionary`, `/digital-marketing-hub` during audit | `app/(shell)/*/page.tsx` | Blocks release pipeline; may be `.next`/dev conflict — must reproduce clean |
| **BUG-C02** | Constitution | Vertical tool backends return architecture stubs presented as live workspaces | `backend/routers/visionary_*`, `omnimusic_*`, `medical_*` | Violates Art. 3 — not end-to-end |
| **BUG-C03** | CI/CD | Playwright E2E not in `.github/workflows/ci.yml` | `.github/workflows/ci.yml` | Violates Art. 9, 12 |
| **BUG-C04** | Release | `FINAL_CHECKLIST.md` Pre-GA items unchecked (E2E CI, vault, k6, medical contracts) | `docs/FINAL_CHECKLIST.md` | RC gate incomplete |

---

## High

| ID | Area | Issue | Location |
|----|------|-------|----------|
| BUG-H01 | Architecture | TD-001 dual HTTP stacks — 4 of 6 lib facades still independent | `lib/omnicore/*-api.ts` |
| BUG-H02 | Routes | `creative-visionary` vs `visionary-studio` duplicate surfaces | Registry, `ZoneContentRouter.tsx` |
| BUG-H03 | API | Music route prefix collision (`/api/music`, `/api/v1/music`, `/api/v1/omnimusic`) | `backend/routers/entertainment/music.py` |
| BUG-H04 | Security | npm audit: 12 vulnerabilities (4 high); CI non-blocking | `frontend/package-lock.json`, `ci.yml` |
| BUG-H05 | Security | pip-audit non-blocking in CI | `ci.yml` |
| BUG-H06 | Security | Passkey challenge returns `passkey-stub-challenge` | `omnicore_security.py:72` |
| BUG-H07 | Security | SSO redirect to `sso.placeholder.omnimind.io` | `OmniEnterpriseSettings.ts` |
| BUG-H08 | CI | `verify:contracts` not in GitHub Actions | `ci.yml` |
| BUG-H09 | AI | `StubMusicAdapter` used for all music AI workflows | `lib/omnimusic-studio/ai/ModelRouter.ts` |
| BUG-H10 | Visionary | `ProductStudioEngine` returns `stub-complete` | `lib/visionary/marketing/ProductStudioEngine.ts` |
| BUG-H11 | Testing | No statement coverage gate | Vitest/pytest config |
| BUG-H12 | Constitution | No `OmniPilot` module — Art. 5 integration gap | Codebase-wide |

---

## Medium

| ID | Area | Issue |
|----|------|-------|
| BUG-M01 | Performance | `omnitv-events.ts` dynamic require webpack warning |
| BUG-M02 | Performance | Marketplace route 215 kB First Load JS |
| BUG-M03 | Backend | Python 3.16 `asyncio.iscoroutinefunction` deprecation (slowapi) |
| BUG-M04 | Security | CSRF/HMAC placeholders in `OmniAPIProtection.ts` |
| BUG-M05 | Security | At-rest encryption hooks placeholder | `OmniDataProtection.ts` |
| BUG-M06 | SDK | Minimal adoption — 2 components use browser SDK |
| BUG-M07 | SDK | Duplicate browser/node SDK trees | `sdk/browser/`, `sdk/node/` |
| BUG-M08 | Medical | FHIR/HL7 parsers incomplete | `core/medical-enterprise/` |
| BUG-M09 | Analytics | `sampleDataset()` auto-loads on analytics mount | `enterprise-analytics-context.tsx` |
| BUG-M10 | Cloud | Mongo in-memory fallback without persistent warning in all UIs |
| BUG-M11 | Accessibility | Uneven ARIA — strong in medical/visionary, sparse on entertainment |
| BUG-M12 | Docs | `FINAL_CHECKLIST.md` claims 25 tests; actual 78 |
| BUG-M13 | Docs | Test count drift across reports |
| BUG-M14 | Automation | Natural language workflow builder not contract-tested E2E |
| BUG-M15 | Forge | Protected — no bugs filed; maintain only |
| BUG-M16 | Architect | Protected — no bugs filed; maintain only |
| BUG-M17 | Dead code | `omnicore-quality-api.ts` unused | `lib/omnicore/` |
| BUG-M18 | Parallel | `backend-fastapi/`, `gateway-go/`, `core-python/` undocumented primary vs secondary |

---

## Low

| ID | Area | Issue |
|----|------|-------|
| BUG-L01 | DX | `npm warn Unknown env config "devdir"` |
| BUG-L02 | UI | `EQStudio` displays "Architecture stub — no DSP" | `components/omnimusic/mixing/EQStudio.tsx` |
| BUG-L03 | UI | VST/AU plugin placeholders in OmniMusic UI |
| BUG-L04 | UI | Visionary VFX particle/physics stubs labeled |
| BUG-L05 | UI | `DeckVfxMock.tsx` mock component name |
| BUG-L06 | Backend | Phase stub docstrings on omnicore_assets/plugins/collaboration |
| BUG-L07 | Types | `BranchPlaceholder` in version control |
| BUG-L08 | AI | `OmniModelRouter.stubResponse` field unused in live path |
| BUG-L09 | Generated | `generated/omnimind-app/` may confuse contributors |
| BUG-L10 | Entertainment | Multiple overlapping media routers |
| BUG-L11 | i18n | Limited locale coverage beyond English |
| BUG-L12 | Memory | No external memory leak profiling run in CI |
| BUG-L13 | Observability | No Sentry/APM connected |

---

## Resolution Priority

1. **Critical** — all 4 must be resolved or explicitly waived with product sign-off
2. **High** — resolve before public GA
3. **Medium** — next engineering cycles
4. **Low** — backlog
