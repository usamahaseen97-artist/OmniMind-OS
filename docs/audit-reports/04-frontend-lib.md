# Audit: frontend/lib/

## Critical Fixes

### 1. Duplicate AI API call (performance + cost)

**File:** `lib/omnicore/use-omnicore-bridge.ts`

**Problem:** `aiComplete()` called both `omniCore.ai.complete()` AND `omnicoreAiApi.complete()` — double inference per request.

**Fix:** Removed redundant `omnicoreAiApi.complete()` call. Single path through `OmniCoreApiClient`.

### 2. Duplicate HTTP client for projects

**File:** `lib/omnicore/omnicore-api.ts`

**Fix:** `listProjects`, `saveProjects`, `search`, `saveSession` now delegate to `omniCoreApiClient`. Settings/workspace/recent remain on shared `api` client.

### 3. Breadcrumb integration gaps

**File:** `lib/omnimind-ecosystem-registry.ts`

**Problem:** Platform routes (`/mission-control`, `/automation-engine`, etc.) showed wrong breadcrumbs (defaulted to OmniForge).

**Fix:**
- Added `SHELL_ROUTE_LABELS` for 16 shell routes
- Added `shellRouteLabel()` helper
- Extended `buildBreadcrumbs()` with optional `pathname`
- `visionary-studio` maps to OmniVision breadcrumb
- `omnimind-ecosystem-context.tsx` passes `pathname` to `buildBreadcrumbs`

### 4. TypeScript null safety

**File:** `use-omnicore-bridge.ts` — `r?.projects?.length` after API client can return null.

## Verified OK

| File | Status |
|------|--------|
| `qa/contract-validator.ts` | 9 endpoint contracts |
| `sovereign-tool-registry.ts` | 24 tool definitions |
| `omnimind-os-categories.ts` | Dock includes omnicloud, mission-control, automation |
| `shared/http-client.ts` | Tested |

## Remaining (Documented)

- `lib/omnicore/omnicore-ai-api.ts` — still parallel to core (used for agent list bootstrap only)
- `lib/visionary/`, `lib/omnimusic-studio/` — vertical stubs
