# Next Recommendations — Cycle 4

**Current score:** 7.7 / 10  
**Constitution:** Supreme law active

---

## Immediate (Cycle 4)

### 1. TD-001 — `omnicore-ai-api` consolidation
- Create `frontend/core/ai/OmniAIApiClient.ts` using shared patterns from `OmniCoreApiClient`
- Delegate `lib/omnicore/omnicore-ai-api.ts` (backward-compatible re-export)
- Grep all `omnicoreAiApi` consumers before merge

### 2. E2E in CI
- Add `npx playwright install --with-deps chromium` to workflow
- Run `npm run test:e2e` against `npm run build && npm run start`
- Gate on 2+ smoke tests green

### 3. TD-003 — Music API prefix collision
- Audit `backend/routers` for duplicate music paths
- Align frontend music clients to canonical prefix

---

## Short-Term (Cycles 5–6)

4. Consolidate `omnicore-security-api` → `core/security/OmniSecurityApiClient.ts`  
5. Consolidate collaboration, assets, plugins facades  
6. pytest-cov on `backend/lib/omnicore/`  
7. Sentry wiring on `ClientErrorBoundary`

---

## Performance (ongoing)

- Lazy-load `GlobalMenuDrawer` on home shell (secondary chunk)
- `optimizePackageImports` audit for `lucide-react`, `recharts`

---

## Do Not Do

- Redesign OmniForge or Architectural Designer
- New sovereign tools under feature freeze
- Placeholder production paths (Constitution Article 3)

---

## Cycle 4 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Quality score | 7.7 | 8.0 |
| First Load JS `/` | 219 kB | < 200 kB |
| TD-001 modules done | 1/6 | 2/6 |
| E2E in CI | No | Yes |
