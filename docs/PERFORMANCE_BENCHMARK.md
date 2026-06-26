# Performance Benchmark Report

**Quality Gate:** V2.0  
**Date:** 2026-06-17  
**Machine:** Windows 10, local dev environment

---

## Build Performance

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| `next build` total | **~85s** | < 120s | Pass |
| Webpack compile | ~36s | < 60s | Pass |
| Static page generation | 35 pages | — | Pass |
| Typecheck during build | Included | Pass | Pass |

**Warning:** `lib/server/omnitv-events.ts` — critical dependency expression (non-blocking).

---

## Bundle Size (Production Build)

| Route | Page JS | First Load JS | Notes |
|-------|---------|---------------|-------|
| `/` (root hub) | 192 kB | **388 kB** | Largest — SovereignCoreWorkspace |
| `/marketplace` | 57 kB | 214 kB | Second largest |
| `/omnicloud` | 6.74 kB | 182 kB | Lean workspace |
| `/mission-control` | 6.19 kB | 181 kB | Lean workspace |
| `/automation-engine` | 6.37 kB | 181 kB | Lean workspace |
| Sovereign tools (most) | 2.06–2.57 kB | **106–121 kB** | Thin `SovereignToolPage` shell |
| Shared chunks | — | **104 kB** | All routes |

### Bundle targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Shell routes First Load | 106–121 kB | < 150 kB | Pass |
| Platform workspaces | ~182 kB | < 250 kB | Pass |
| Root hub | 388 kB | < 400 kB | Pass (monitor) |

### Optimization already applied

- `optimizePackageImports`: `lucide-react`, `framer-motion`, `motion`
- Server externals for `three`, `@react-three/fiber`, `@react-three/drei`
- Browser alias blocks `@omnimind/sdk/node`, `fs`, `path`

---

## Startup Time

| Phase | Estimate | Notes |
|-------|----------|-------|
| `npm run dev` cold start | ~5–15s | Next.js 15 |
| `omniCore.boot()` | < 100ms | Sync + async cloud/mission |
| First paint (root) | Depends on network | Backend probe 4–8s timeout |

**Recommendation:** Lazy-load root hub heavy panels; defer non-critical `boot()` modules.

---

## Test Suite Performance

| Suite | Duration | Tests |
|-------|----------|-------|
| Frontend vitest | **~5s** | 32 |
| Backend pytest | **~29s** | 36 |
| Full `npm run verify` | **~90s+** | lint + test + build |

---

## API Latency (Local Backend)

Probed via `Invoke-RestMethod` to `127.0.0.1:8001`:

| Endpoint | Typical | Notes |
|----------|---------|-------|
| `GET /healthz` | < 50ms | |
| `GET /omnicore/projects` | < 100ms | Memory fallback |
| `GET /mission-control/dashboard` | < 200ms | Aggregator |
| `GET /omnicloud/account` | < 100ms | |
| `POST /ai/complete` | 1–30s | Provider-dependent |

**AI response time** is dominated by external LLM providers (Google, OpenAI, etc.) via `superapp_ai`.

---

## Memory Usage

| Component | Estimate | Notes |
|-----------|----------|-------|
| Next.js dev server | 300–800 MB | Typical |
| FastAPI backend | 150–400 MB | + Mongo driver |
| Browser tab (root hub) | 150–300 MB | Chat + workspace |

No automated memory profiling run this sprint. See legacy `docs/MEMORY_PROFILE.md` for methodology.

---

## CPU / GPU

| Workload | CPU | GPU |
|----------|-----|-----|
| Platform UI | Low | None |
| Mission Control refresh | Low (12s interval) | None |
| OmniCloud remote jobs | Backend async | N/A |
| Visionary / VFX / 3D routes | Medium–High when active | WebGL via Three.js |
| OmniMusic DSP (future) | Medium | Optional |

GPU metrics not instrumented in production paths.

---

## Database Performance

| Operation | Backend | Notes |
|-----------|---------|-------|
| `omnicore_store.load` | < 10ms | Memory fallback |
| `omnicore_store.save` | < 20ms | Memory fallback |
| MongoDB (when connected) | Network-dependent | Atlas latency |

---

## Rendering Speed

| Surface | Strategy | Performance |
|---------|----------|-------------|
| Shell routes | Static prerender | Fast |
| Ecosystem chrome | Client components | Good |
| Automation builder | React flow | Good |
| Visionary timeline | Heavy — stub | TBD |
| Root hub chat | Streaming | Provider-limited |

---

## Benchmark Scorecard

| Category | Score | Grade |
|----------|-------|-------|
| Build time | 85s | B+ |
| Bundle (shell) | 106–121 kB | A |
| Bundle (hub) | 388 kB | B |
| Test speed | 34s total | A |
| API latency (platform) | < 200ms | A |
| AI latency | Variable | N/A |
| Memory profiling | Not run | — |

**Overall performance grade: B+** — suitable for production; root hub bundle warrants future code-splitting.

---

## Recommended Optimizations (Post-freeze)

1. Dynamic import `SovereignCoreWorkspace` panels on root `/`
2. Add bundle analyzer to CI (`@next/bundle-analyzer`)
3. Wire contract + latency probes to release pipeline
4. Lazy `omniCore.cloud.boot()` until OmniCloud route visited
5. Resolve `omnitv-events` webpack warning
