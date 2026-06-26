# OmniMind Production Sprint 1 — Refactor Report

**Date:** June 2026  
**Sprint:** Enterprise Architecture Refactor (Sprint 1)  
**Principle:** Refactor only — preserve all functionality and user workflows

---

## Sprint 1 Changes Applied

### 1. Shared Infrastructure Layer

**Created:** `frontend/lib/shared/http-client.ts`

```typescript
createApiClient({ baseUrl, label }) → { get, post, put, delete, request }
```

**Migrated (duplicate `request()` removed):**
- `lib/omnicore/omnicore-api.ts`
- `lib/omnicore/omnicore-ai-api.ts`
- `lib/omnicore/omnicore-assets-api.ts`
- `lib/omnicore/omnicore-plugins-api.ts`
- `lib/omnicore/omnicore-collaboration-api.ts`

**Impact:** ~75 lines of duplicated fetch boilerplate eliminated; consistent error labels; single place to add auth headers, retry, and logging later.

**Next:** Migrate module-scoped APIs (visionary, omnimusic-studio) in Sprint 2.

---

### 2. Presentation Layer — Code Splitting

**Created:** `frontend/components/ide/layouts/dynamic-flagship-workspaces.tsx`

| Dynamic export | Replaces static import |
|----------------|------------------------|
| `DynamicMedicalEnterpriseWorkspace` | `MedicalEnterpriseWorkspace` |
| `DynamicVisionaryStudioWorkspace` | `VisionaryStudioWorkspace` |
| `DynamicOmniMusicStudioShell` | `OmniMusicStudioShell` |

**Updated:** `ZoneContentRouter.tsx` — flagship tools load on demand via `next/dynamic` with `ssr: false` and `WidgetLoading` fallback.

**User impact:** None visible — same routes, same shells, same UX. Faster initial workbench load when user is not on flagship tools.

---

### 3. Backend — Probe URL Corrections

**Updated:** `backend/routers/tools_status.py`

| Tool slug | Before (wrong) | After (correct) |
|-----------|----------------|-----------------|
| `architectural-designer` | `/api/v1/spatial/blueprint` | `/api/v1/architect/blueprint` |
| `interior-landscape` | `/api/v1/spatial/blueprint` | `/api/v1/architect/blueprint` |
| `omnimap` | `/maps/places` | `/maps/search` |
| `omnitv` | `/api/v1/tv/grid` | `/api/v1/tv/live-grid` |

**Impact:** Tool status probes now reference real routes; sovereign tool health checks accurate.

---

### 4. Dead Code Removal (verified zero imports)

| Removed file | Reason |
|--------------|--------|
| `components/Sidebar.tsx` | No importers |
| `components/TopBar.tsx` | No importers |
| `components/RightPanel.tsx` | No importers |
| `components/IntegrationGrid.tsx` | Only consumer of removed `lib/types.ts` |
| `components/GlassCard.tsx` | Superseded by `design-system/components/Card.tsx` (`DSGlassCard`) |
| `lib/types.ts` | Only used by removed `IntegrationGrid` |

**User impact:** None — files were unreachable from any route or shell.

---

## Refactor Backlog (Sprint 2+)

### API Layer Standardization

| Priority | Task | Files affected |
|----------|------|----------------|
| High | Migrate visionary APIs to `createApiClient` | 6 files in `lib/visionary/` |
| High | Migrate omnimusic-studio APIs | 5 files in `lib/omnimusic-studio/` |
| Medium | Migrate flat `lib/*-api.ts` (28 files) | Incremental by domain |
| Medium | Unify `api.ts` + `chat-api.ts` | 2 files |
| Low | Add `Authorization` header injection in `http-client` | 1 file |

### Application Layer Decomposition

| File | Lines | Proposed split |
|------|-------|----------------|
| `use-omnicore-bridge.ts` | ~500 | `use-omnicore-core-bridge`, `use-omnicore-ai-bridge`, etc. |
| `omnimind-ecosystem-context.tsx` | ~683 | Registry vs navigation vs tool state |
| `omnimusic-studio-context.tsx` | ~311 | Per-bridge sub-contexts (optional) |

### Domain Layer

| Task | Notes |
|------|-------|
| Document UI↔engine mirror pattern | Add to `frontend/docs/MODULE_PATTERN.md` |
| Clarify `core/plugins/` vs `core/plugins/omnicore-platform/` | Already separated; add boundary doc |
| Consolidate `core/agent/` vs `core/ai/` conversation managers | Long-term; both in use |

### Backend Extraction from `main.py`

Extract inline routes (~lines 923–1247) into:

| New router | Routes |
|------------|--------|
| `routers/entertainment_hub.py` | `/api/v1/entertainment/search`, `/api/v1/omnimind/search` |
| `routers/maps_v1.py` | `/api/v1/maps/route`, `/api/v1/maps/spatial-lookup` |
| `routers/theme_v1.py` | `/api/v1/theme/customize` |

Target: `main.py` under 400 lines (mount + middleware + lifespan only).

### Import Path Migration

**Phase A:** Add ESLint `import/no-relative-parent-imports` for cross-module only  
**Phase B:** Migrate medical `@/` pattern to all flagship modules  
**Phase C:** Update `tsconfig paths` documentation

### Folder Naming Standard

| Current | Target |
|---------|--------|
| `lib/omnimusic-studio/` | Keep (established) |
| `core/medical-enterprise/` | Keep |
| `components/ide/layouts/omniforge/` | Keep |
| New shared utils | `lib/shared/` only |

---

## Layer Violations to Fix (No Sprint 1 Change)

| Violation | Example | Fix |
|-----------|---------|-----|
| Components importing backend paths | Rare | BFF only via `lib/*-api.ts` |
| `core/` importing React | None found | Maintain |
| API logic in components | Some chat panels | Move to hooks |

---

## Testing Checklist (Manual)

After each refactor batch:

- [ ] `npm run lint` && `npm run typecheck`
- [ ] Open `/omnimusic` — DAW loads
- [ ] Open `/visionary-studio` — all 5 modules switch
- [ ] Open `/medical-diagnostic-suite` — enterprise shell loads
- [ ] Open OmniForge (Group A tool) — IDE shell loads
- [ ] OmniCore notifications still appear on boot
- [ ] Chat streaming still works

---

## Metrics

| Metric | Before | After Sprint 1 |
|--------|--------|----------------|
| Duplicate `request()` in OmniCore APIs | 5 | 0 |
| Static flagship imports in ZoneContentRouter | 3 | 0 |
| Verified dead component files | 6 | 0 |
| Wrong tool probe URLs | 4 | 0 |
| Shared infrastructure modules | 0 | 2 (`http-client`, `index`) |

---

*Next sprint: visionary/omnimusic API migration + `main.py` extraction + VisionaryStudioLayout lazy sub-workspaces.*
