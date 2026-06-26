# OmniMind Production Sprint 2 — Optimization Log

Chronological record of performance changes. No features removed; no workflows changed.

---

## 2026-06 — Sprint 2

### `frontend/lib/shared/http-client.ts`
- **Added:** GET response cache (30s TTL, 128 entry LRU)
- **Added:** In-flight request deduplication for GET
- **Added:** Retry with backoff (2 retries, 300ms base)
- **Added:** `clearCache()` on mutations
- **Why:** Eliminate duplicate network calls on OmniCore boot (5+ parallel GETs)

### `frontend/lib/shared/memory-registry.ts`
- **Added:** `DisposableRegistry` for timers, listeners, observers
- **Why:** Prevent leak on provider unmount

### `frontend/lib/shared/virtual-list.tsx`
- **Added:** `VirtualList` component via `@tanstack/react-virtual`
- **Why:** O(viewport) DOM for long lists

### `frontend/lib/shared/offline-queue.ts`
- **Added:** Offline mutation queue with localStorage persistence
- **Why:** Background sync architecture for failed writes

### `frontend/lib/shared/use-selector.ts`
- **Added:** `useSelector` for shallow-stable external store slices
- **Why:** Reduce unnecessary re-renders (foundation for Sprint 3)

### `frontend/lib/shared/recent-project-cache.ts`
- **Added:** Recent project cache (20 entries, localStorage)
- **Why:** Fast workspace restore / session recovery

### `frontend/components/ide/layouts/dynamic-visionary-workspaces.tsx`
- **Added:** 5 dynamic workspace imports + Suspense wrapper
- **Why:** Only load active Visionary module

### `frontend/components/visionary/VisionaryStudioLayout.tsx`
- **Changed:** Static → dynamic sub-workspaces
- **Changed:** `memo()` on layout and default shell
- **Changed:** Import `lib/visionary/context` instead of barrel
- **Why:** Code split + fewer barrel-induced re-renders

### `frontend/components/omnimusic/dynamic-omnimusic-views.tsx`
- **Added:** Dynamic AIComposer, VocalStudio, MixingWorkspace
- **Why:** Defer heavy mixing/vocal/AI bundles until view switch

### `frontend/components/omnimusic/OmniMusicWorkspace.tsx`
- **Changed:** Dynamic view modes + `memo(DawCenter)`
- **Why:** DAW shell loads without mixing/vocal/AI chunks

### `frontend/components/chat/ConversationList.tsx`
- **Changed:** VirtualList for 20+ conversations
- **Changed:** `memo` on list and rows
- **Why:** Smooth scroll with large chat history

### `frontend/core/ai/OmniMemory.ts`
- **Added:** MAX_ENTRIES=500, LRU eviction
- **Why:** Bound long-running session memory

### `frontend/core/ai/OmniConversationManager.ts`
- **Added:** Max 100 conversations, 200 messages each
- **Added:** `prune()` + auto-trim on append
- **Why:** Token optimization + heap stability

### `frontend/core/ai/OmniInferenceQueue.ts`
- **Added:** Max 200 jobs, evict completed
- **Why:** Background queue memory cap

### `frontend/core/ai/OmniPromptEngine.ts`
- **Added:** Render cache (128 entries, 60s TTL)
- **Added:** `clearCache()`
- **Why:** Avoid re-rendering identical prompt templates

### `frontend/core/omnicore/OmniEventBus.ts`
- **Added:** Background queue cap at 500
- **Why:** Prevent runaway queue if flush stalls

### `frontend/core/collaboration/OmniRealtimeHub.ts`
- **Added:** `clearListeners()`, `clearStaleSessions()`, conflict queue trim
- **Why:** Collaboration memory hygiene

### `frontend/lib/omnicore/use-omnicore-bridge.ts`
- **Added:** `DisposableRegistry` with 5min cleanup interval
- **Added:** Dispose on unmount
- **Why:** Scheduled memory maintenance

### `frontend/next.config.ts`
- **Added:** `optimizePackageImports` for lucide-react, framer-motion, motion
- **Why:** Icon/animation tree-shaking

### `frontend/app/layout.tsx`
- **Added:** Font `display: swap`, selective `preload`
- **Why:** Faster FCP; defer mono font

### `backend/lib/response_cache.py`
- **Added:** `@cached_response` decorator
- **Why:** Reduce repeated stub router work

### `backend/lib/structured_logging.py`
- **Added:** JSON formatter + `record_metric()` / `snapshot_metrics()`
- **Why:** Observability foundation

### `backend/routers/omnicore.py`
- **Added:** `@cached_response(15s)` on GET `/projects`
- **Why:** Hot path on every OmniCore boot

---

## 2026-06 — Sprint 1 (Reference)

- Shared `createApiClient` for OmniCore APIs
- `dynamic-flagship-workspaces.tsx` for Medical/Visionary/OmniMusic shells
- `tools_status.py` probe URL fixes
- Removed verified dead components (Sidebar, TopBar, etc.)

---

## Verification Log

| Check | Sprint 2 Result |
|-------|-----------------|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS (warnings: omnitv-events dynamic require) |
| Sovereign route size | 4.28 kB page / 112 kB First Load |
| Visual regression | Not automated — manual smoke recommended |

---

## Rollback Notes

All changes are additive or internal. To rollback:
1. Revert dynamic imports → static imports in Visionary/OmniMusic layouts
2. Restore plain `http-client.ts` without cache (OmniCore APIs still work)
3. Remove memory caps from AI engines (restores unbounded growth)

No database migrations. No API contract changes.

---

*Next log entries: Sprint 3 — OmniChatShell split, provider decomposition, SWR layer.*
