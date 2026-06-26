# Phase 1 Critical Stabilization — Change Log

**Date:** 2026-06-17  
**Scope:** Phase 1 only — no new features, no OmniForge/Architectural Designer redesign  
**Source of truth:** `docs/ENTERPRISE_REPOSITORY_AUDIT.md`

---

## Summary

| Task | Status | Architecture impact |
|------|--------|---------------------|
| Remove 8 circular dependencies | ✅ 0 cycles (madge verified) | Circular deps factor 60 → **88** |
| Consolidate duplicate HTTP API layers | ✅ All `lib/omnicore/*-api.ts` delegate to `core/*ApiClient` | Duplication factor 55 → **68** |
| Auth on execution/deploy API routes | ✅ `requireInternalApiAuth` wired | Security factor 65 → **78** |
| Canonical routes + redirects | ✅ Visionary + medical deduplicated | Route cardinality reduced |
| Music API namespace normalization | ✅ `/api/v1/music` canonical, `/api/music` legacy | API versioning 75 → **78** |
| Verification | ✅ tsc 0 errors, 42 FE + 36 BE tests, build OK | — |

---

## 1. Circular Dependency Removal (8 → 0)

### Fix 1.1 — `OmniAI` ↔ `OmniCoreApiClient`

| File | Change |
|------|--------|
| `frontend/core/ai/types.ts` | Added `CompleteOptions` type (shared) |
| `frontend/core/ai/OmniAI.ts` | Imports `CompleteOptions` from `./types` |
| `frontend/core/omnicore/OmniCoreApiClient.ts` | Imports `CompleteOptions` from `../ai/types` |

### Fix 1.2 — `omni-tools-api` ↔ `video-generation-api`

| File | Change |
|------|--------|
| `frontend/lib/omni-tools-types.ts` | **New** — shared tool types |
| `frontend/lib/omni-tools-api.ts` | Imports types from `omni-tools-types` |
| `frontend/lib/video-generation-api.ts` | Imports types from `omni-tools-types` |

### Fix 1.3 — `spatial-engine-api` ↔ `spatial-render-store`

| File | Change |
|------|--------|
| `frontend/lib/spatial-types.ts` | **New** — `SpatialRenderMode` and related types |
| `frontend/lib/spatial-engine-api.ts` | Imports from `spatial-types` |
| `frontend/lib/spatial-render-store.ts` | Imports from `spatial-types` |

### Fix 1.4 — `omniforge-mobile-layout-store` ↔ `omniforge-preview-data`

| File | Change |
|------|--------|
| `frontend/lib/omniforge-mobile-types.ts` | **New** — mobile layout types |
| `frontend/lib/omniforge-mobile-layout-store.ts` | Imports from `omniforge-mobile-types` |
| `frontend/lib/omniforge-preview-data.ts` | Imports from `omniforge-mobile-types` |

### Fix 1.5 — IDE dynamic-import cluster (4 cycles)

| File | Change |
|------|--------|
| `frontend/components/ide/WidgetLoading.tsx` | **New** — isolated loading spinner |
| `frontend/components/ide/dynamic-workbench-widgets.tsx` | Re-exports `WidgetLoading`; restored `DynamicIDEMonacoWorkspace`, `DynamicIDEBottomPanel`, `DynamicIDERightPanel` |
| `frontend/components/ide/client/ClientMountGate.tsx` | Imports `WidgetLoading` from `../WidgetLoading` |
| `frontend/components/ide/client/dynamic-engines.tsx` | Imports `WidgetLoading` from `../WidgetLoading` |
| `frontend/components/ide/layouts/dynamic-visionary-workspaces.tsx` | Imports `WidgetLoading` from `../WidgetLoading` |
| `frontend/components/ide/layouts/dynamic-flagship-workspaces.tsx` | Imports `WidgetLoading` from `../WidgetLoading` |

### Fix 1.6 — `AgentChatConsole` ↔ `layout-shared`

| File | Change |
|------|--------|
| `frontend/components/ide/layouts/layout-constants.ts` | **New** — `GUEST` constant |
| `frontend/components/ide/workspace/AgentChatConsole.tsx` | Imports `GUEST` from `layout-constants` |
| `frontend/components/ide/layouts/layout-shared.tsx` | Imports `GUEST` from `layout-constants` |

**Verification:** `npx madge --circular --extensions ts,tsx components lib core` → **0 cycles**

---

## 2. HTTP API Layer Consolidation

### Core clients (canonical)

| File | Role |
|------|------|
| `frontend/core/shared/api-fetch.ts` | Added `setAccessTokenProvider()` |
| `frontend/core/security/OmniSecurityApiClient.ts` | **New** |
| `frontend/core/assets/OmniAssetsApiClient.ts` | **New** |
| `frontend/core/plugins/OmniPluginsApiClient.ts` | **New** |
| `frontend/core/collaboration/OmniCollaborationApiClient.ts` | **New** |
| `frontend/core/quality/OmniQualityApiClient.ts` | **New** |

### Lib bridge (backward-compatible facades)

| File | Change |
|------|--------|
| `frontend/lib/omnicore/omnicore-http-bridge.ts` | **New** — `requireApiResult()` adapts null-returning core clients to throw semantics |
| `frontend/lib/omnicore/register-api-auth.ts` | **New** — registers `secureSession` token provider |
| `frontend/lib/omnicore/omnicore-context.tsx` | Side-effect import of `register-api-auth` |
| `frontend/lib/omnicore/omnicore-api.ts` | Already delegated (prior cycle) |
| `frontend/lib/omnicore/omnicore-ai-api.ts` | Already delegated (prior cycle) |
| `frontend/lib/omnicore/omnicore-security-api.ts` | Delegates to `omniSecurityApiClient` |
| `frontend/lib/omnicore/omnicore-assets-api.ts` | Delegates to `omniAssetsApiClient` |
| `frontend/lib/omnicore/omnicore-plugins-api.ts` | Delegates to `omniPluginsApiClient` |
| `frontend/lib/omnicore/omnicore-collaboration-api.ts` | Delegates to `omniCollaborationApiClient` |
| `frontend/lib/omnicore/omnicore-quality-api.ts` | Delegates to `omniQualityApiClient` |

**Public API preserved:** All `omnicore*Api` export names and method signatures unchanged.

---

## 3. Authentication on Execution & Deployment Routes

| File | Change |
|------|--------|
| `frontend/lib/server/api-route-auth.ts` | **New** — `requireInternalApiAuth()` via `OMNIMIND_INTERNAL_API_SECRET` |
| `frontend/app/api/execute/route.ts` | Auth guard on `POST` |
| `frontend/app/api/architect/deploy-hook/route.ts` | Auth guard on `POST` |
| `frontend/app/api/architect/provision-db/route.ts` | Auth guard on `POST` |

**Backward compatibility:** In `NODE_ENV=development`, routes remain open when `OMNIMIND_INTERNAL_API_SECRET` is unset. Production requires the secret (503 if missing, 401 if invalid).

---

## 4. Canonical Routes & Redirects

| File | Change |
|------|--------|
| `frontend/next.config.ts` | Added redirects: `/creative-visionary` → `/visionary-studio`, `/medical-diagnostic` → `/medical-diagnostic-suite` (with `/:path*` variants) |
| `frontend/lib/omnimind-ecosystem-registry.ts` | OmniVision `href` updated to `/visionary-studio` |

**Canonical routes:**
- Visionary: `/visionary-studio`
- Medical: `/medical-diagnostic-suite`

Legacy sovereign slugs and registry entries remain for backward compatibility; HTTP redirects handle bookmarks.

---

## 5. Music API Namespace Normalization

| File | Change |
|------|--------|
| `backend/routers/entertainment/music.py` | `router` is now canonical `/api/v1/music`; `legacy_router` at `/api/music` with 307 redirects; removed duplicate `@router` + `@v1_router` decorators |
| `backend/routers/entertainment/__init__.py` | Exports `legacy_router` as `music_router` |
| `backend/main.py` | Registers `music_v1_router` then `music_router` (legacy) |

**Preserved behavior:**
- `/api/music/search` — Spotify/YouTube chatbot search (legacy-only endpoint)
- `/api/v1/music/search` — dynamic global catalog search (canonical)

---

## Verification Results (Post-Phase 1)

| Check | Result |
|-------|--------|
| `npm run lint` (tsc) | ✅ 0 errors |
| `npm run test` (Vitest) | ✅ 42/42 |
| `npm run build` | ✅ Success (219 kB root FLJS) |
| `pytest` (backend) | ✅ 36/36 |
| `madge --circular` | ✅ 0 cycles |

---

## Protected Systems — Unchanged

- OmniForge Engine (`frontend/components/omniforge/`, `app/(shell)/omniforge-engine/`)
- Architectural Designer (`frontend/components/architect/`, `app/(shell)/architectural-designer/`)
- Public interfaces and sovereign tool registry slugs preserved
