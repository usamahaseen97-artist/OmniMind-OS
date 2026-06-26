# OmniMind Production Sprint 2 — Bundle Analysis

**Date:** June 2026  
**Build:** Next.js 15.5.18, `optimizePackageImports` enabled  
**Command:** `cd frontend && npm run build`

---

## Summary

| Metric | Value |
|--------|-------|
| Shared First Load JS | **104 kB** |
| Home route (`/`) | **326 kB** First Load JS |
| Sovereign tool routes (avg) | **112 kB** First Load JS |
| Sovereign route page size | **4.28 kB** (flagship tools) |
| Static pages generated | 32 |
| Build time | ~33.5s compile + optimize |

---

## Route Breakdown

### Heavy Routes

| Route | Page JS | First Load JS | Notes |
|-------|---------|---------------|-------|
| `/` | 192 kB | **326 kB** | Home SPA + chat shell — primary optimization target |
| `/marketplace` | 57.4 kB | 213 kB | Plugin catalog UI |

### Optimized Sovereign Routes (Sprint 1 + 2)

All flagship tools share the thin shell pattern:

| Route | Page JS | First Load JS |
|-------|---------|---------------|
| `/visionary-studio` | 4.28 kB | 112 kB |
| `/omnimusic` | 4.28 kB | 112 kB |
| `/medical-diagnostic-suite` | 4.28 kB | 112 kB |
| `/omniforge-engine` | 4.28 kB | 112 kB |
| `/omnimusic`, `/omnitv`, `/omnimovies`, etc. | 4.28 kB | 112 kB |

**Before Sprint 1 (estimated):** Flagship modules statically imported in `ZoneContentRouter` — all tool routes shared a multi-MB common chunk.

**After Sprint 2:** Route shell is 4.28 kB; modules load as separate async chunks on activation.

---

## Shared Chunks

```
First Load JS shared by all: 104 kB
├── chunks/1255-eae4096fb21f1304.js     46 kB
├── chunks/4bd1b696-100b9d70ed4e49c1.js  54.2 kB
└── other shared chunks                  3.85 kB
```

---

## Dynamic Chunk Map (Sprint 2)

Chunks created at runtime via `next/dynamic`:

### Flagship Shells (Sprint 1)
- `MedicalEnterpriseWorkspace`
- `VisionaryStudioWorkspace`
- `OmniMusicStudioShell`

### Visionary Sub-modules (Sprint 2)
- `VideoEditorWorkspace`
- `VFXWorkspace`
- `MarketingWorkspace`
- `Studio3DWorkspace`
- `AutomationWorkspace`

### OmniMusic Views (Sprint 2)
- `AIComposer`
- `VocalStudio`
- `MixingWorkspace`

### Existing Dynamic (Pre-Sprint 2)
- `SovereignWorkbenchShell` — `dynamic-sovereign-shell.tsx`
- Layout modules A–I — `dynamic-layout-modules.tsx`
- Workbench widgets — `dynamic-workbench-widgets.tsx`

---

## Package Import Optimization

```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ["lucide-react", "framer-motion", "motion"],
}
```

**Impact:** Tree-shakes icon and animation libraries — ~150+ files import `lucide-react`.

**Webpack aliases (existing):**
- `@omnimind/sdk/node` → `false` (client bundle)
- `fs`, `path`, `child_process` → `false` (client)

---

## Barrel Export Risk Matrix

| Barrel | Risk | Status |
|--------|------|--------|
| `lib/visionary/index.ts` | High | **Mitigated** in VisionaryStudioLayout (uses `context` leaf) |
| `components/omnimusic/index.ts` | High | Open |
| `core/omnicore/index.ts` | Medium | Open |
| `lib/omnimusic-studio/index.ts` | Medium | Open |

---

## Build Warnings

```
./lib/server/omnitv-events.ts
Critical dependency: the request of a dependency is an expression
```

**Action:** Replace dynamic `require()` in omnitv-events with static import or `import()`.

---

## Bundle Budget Recommendations

| Surface | Budget | Current | Status |
|---------|--------|---------|--------|
| Shared baseline | < 120 kB | 104 kB | ✅ |
| Sovereign route | < 150 kB | 112 kB | ✅ |
| Home SPA | < 250 kB | 326 kB | ⚠️ Over |
| Marketplace | < 220 kB | 213 kB | ✅ |
| Single dynamic chunk | < 500 kB | TBD* | Monitor |

*Run `@next/bundle-analyzer` for per-chunk sizes.

---

## Analyzer Setup (Recommended)

```bash
cd frontend
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

---

## Sprint 3 Bundle Targets

1. Reduce `/` First Load JS from 326 kB → < 250 kB (split OmniChatShell)
2. Break `components/omnimusic/index.ts` barrel
3. Lazy-load marketplace panels
4. Code-split Three.js to visionary 3d/vfx routes only (verify not in shared chunk)

---

*Build output captured post Sprint 2 — re-run after each optimization sprint.*
