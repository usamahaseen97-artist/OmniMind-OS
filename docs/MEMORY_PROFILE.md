# OmniMind Production Sprint 2 — Memory Profile

**Date:** June 2026  
**Scope:** Frontend domain engines, React lifecycle, backend in-memory stores

---

## Memory Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Browser Heap                                           │
│  ├── React component trees (per route)                  │
│  ├── Domain singletons (omniCore, omniAI, …)           │
│  ├── HTTP GET cache (128 entries max)                  │
│  ├── Prompt render cache (128 entries max)             │
│  ├── localStorage (offline queue, recent projects)     │
│  └── Dynamic import chunks (released on navigation*)   │
├─────────────────────────────────────────────────────────┤
│  FastAPI Process                                        │
│  ├── Redis client pool (max 256 connections)           │
│  ├── Memory fallback cache (5000 keys, LRU eviction)   │
│  ├── Response cache decorator (256 entries, 15–30s TTL) │
│  └── Stub router dicts (omnicore, medical, visionary)  │
└─────────────────────────────────────────────────────────┘
```

*Chunk GC depends on browser; cleanup hooks ensure listener/timer release.

---

## Frontend Memory Caps (Sprint 2)

| Component | Cap | Eviction Strategy |
|-----------|-----|-------------------|
| `OmniMemory.entries` | 500 | LRU — drop oldest 20% |
| `OmniConversationManager` | 100 convos × 200 msgs | Slice on append + periodic prune |
| `OmniInferenceQueue.jobs` | 200 | Keep active; trim completed |
| `OmniPromptEngine.renderCache` | 128 | FIFO on insert |
| `OmniEventBus.backgroundQueue` | 500 | Shift oldest on overflow |
| `OmniPermissionEngine.accessLogs` | 500 | Pop on overflow (Sprint 1) |
| `OmniActivityTimeline.events` | 2000 | Pop on overflow (Sprint 1) |
| `OmniAuditCenter.entries` | 5000 | Pop on overflow (Sprint 1) |
| HTTP GET cache | 128 | FIFO |
| In-flight request map | unbounded* | Cleared on promise settle |
| Offline queue | 200 | localStorage slice |
| Recent project cache | 20 | localStorage slice |

---

## Leak Prevention (Sprint 2)

### DisposableRegistry (`lib/shared/memory-registry.ts`)

Tracks and disposes on unmount:
- `setInterval` / `setTimeout`
- `addEventListener` registrations

**Wired in:** `use-omnicore-bridge.ts` — 5-minute background cleanup interval + dispose on provider unmount.

### Background Cleanup Interval (5 min)

```typescript
omniCore.collaboration.realtime.clearStaleSessions();  // 1h default max age
omniCore.ai.conversations.prune();
omniCore.ai.promptEngine.clearCache();
```

### OmniRealtimeHub

| Method | Purpose |
|--------|---------|
| `clearListeners()` | Release all realtime subscribers |
| `clearStaleSessions(maxAgeMs)` | Remove idle shared sessions |
| Conflict queue cap | Trim to 50 when > 100 |

### OmniEventBus

- `subscribe()` returns unsubscribe function (always call on unmount)
- `publishBackground` capped at 500 — prevents runaway queue if flush stalls

---

## Known Memory Hotspots (Not Yet Optimized)

| Hotspot | Risk | Recommendation |
|---------|------|----------------|
| `OmniChatShell.tsx` | High — large state + streaming buffers | Split + release stream on unmount |
| 7-level provider tree | Medium — retained context values | Split providers (Sprint 3) |
| `omnimind-ecosystem-context.tsx` | Medium — large registry object | Normalize to store |
| Three.js scenes (Visionary 3D/VFX) | High when loaded | Dispose geometries on module switch |
| HLS.js instances (OmniTV) | Medium | `destroy()` on player unmount |
| Monaco editor instances (OmniForge) | Medium | `dispose()` on tab close |
| Medical enterprise `core/` services | Medium — 124 files in singleton graph | Lazy-init per subdomain |

---

## Profiling Procedure

### Chrome DevTools

1. Open DevTools → Memory → Heap snapshot (baseline)
2. Navigate: Home → Visionary Studio → all 5 modules → OmniMusic → all 4 views
3. Take second snapshot → compare detached DOM nodes and listener count
4. Return to home → force GC → third snapshot

**Pass criteria:** Listener count returns within 10% of baseline; no detached trees > 5MB.

### React Profiler

1. Record switching Visionary modules (editor → vfx → marketing → 3d → automation)
2. Target: < 16ms commit for module switch (60fps)
3. Identify components re-rendering outside active module

### Backend

```python
import tracemalloc
tracemalloc.start()
# ... serve 1000 requests to GET /api/v1/omnicore/projects
snapshot = tracemalloc.take_snapshot()
```

Monitor `_memory_fallback` size in `redis_cache.py` when Redis disabled.

---

## Cache Eviction Summary

| Layer | Trigger | Policy |
|-------|---------|--------|
| HTTP client GET | TTL 30s / mutation | LRU 128 |
| Prompt render | TTL 60s | FIFO 128 |
| AI memory | Size > 500 | LRU 80% retain |
| Redis fallback | Size > 5000 | Oldest TTL first |
| Backend response_cache | TTL 15s | LRU 256 |
| Conversations | Count > 100 | Drop oldest |
| Messages | Count > 200/conv | Keep tail |

---

## Session Recovery (Desktop UX)

`lib/shared/recent-project-cache.ts` — persists last 20 opened projects to `localStorage` for fast workspace restore without full API round-trip.

**Integration point (Sprint 3):** Call `recentProjectCache.touch()` in `openProject` bridge handler.

---

## Recommendations

1. Add `performance.memory` sampling in dev overlay (Chrome only)
2. Wire `omniCore.session` end hook to `DisposableRegistry.dispose()` globally
3. Visionary 3D: call `renderer.dispose()` on `Studio3DWorkspace` unmount
4. Cap `OmniCollabNotificationCenter.items` per user (currently unbounded)
5. Backend: migrate stub dicts to Redis with TTL for multi-instance safety

---

*Memory caps are conservative for desktop; tune upward for enterprise deployments with monitoring.*
