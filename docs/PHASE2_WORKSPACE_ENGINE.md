# Phase 2 — Enterprise Workspace Engine

**Date:** 2026-06-17  
**Protected (unchanged):** OmniForge Engine · OmniForge Code Generation · Architectural Designer Core

---

## Overview

Phase 2 introduces a unified **Workspace Engine** that turns OmniMind OS into a desktop IDE–style environment: multi-tab tools, split views, dock panels, session restore, and quick switcher — without replacing protected systems.

---

## Architecture

```
WorkspaceEngineProvider (root providers)
  └── OmniMindAppShell / OmniMindHomeAppShell
        └── OmniMindWorkspaceEngine
              ├── OmniMindWorkspaceTabBar
              ├── OmniMindWorkspaceWindowChrome (snap, split, dock toggles)
              ├── OmniMindWorkspaceDock (left explorer + bottom terminal)
              │     └── OmniMindWorkspaceSplitLayout
              │           └── OmniMindWorkspaceToolPane (lazy tool content)
              └── OmniMindWorkspaceQuickSwitcher (Ctrl+Tab overlay)
```

**State:** `lib/workspace-engine/store.ts` (single source of truth)  
**Persistence:** `lib/workspace-engine/session.ts` → `localStorage` key `omnimind_workspace_engine_v2`  
**React API:** `lib/workspace-engine-context.tsx` → `useWorkspaceEngine()`

---

## Features Delivered

### Window Manager
| Feature | Implementation |
|---------|----------------|
| Snap left/right/fullscreen | `setWorkspaceSnap()` + window chrome buttons |
| Minimize / restore | `toggleMinimize()`, `setWorkspaceSnap("none")` |
| Docked panels | `OmniMindWorkspaceDock` (left + bottom) |
| Resizable splits | `react-resizable-panels` with `autoSave` |

### Tab System
| Feature | Implementation |
|---------|----------------|
| Unlimited tool tabs | `openToolTab()`, `openHrefTab()` |
| Pin / close / duplicate | `pinTab()`, `closeTab()`, `duplicateTab()` |
| Drag reorder | `OmniMindWorkspaceTabBar` HTML5 drag |
| Reopen closed | `reopenClosedTab()` — **Ctrl+Shift+T** |
| MRU history | `mruTabIds` in session |

### Split View
| Mode | `setSplitMode()` |
|------|------------------|
| Single | `single` |
| Horizontal (side-by-side) | `horizontal`, `compare` |
| Vertical (stacked) | `vertical`, `preview` |
| Quad | `quad` |

### Dock Panels
| Region | Panels |
|--------|--------|
| Left | Explorer, Projects, Recent |
| Bottom | Terminal, Logs, Tasks |

### Session Manager
- Auto-save on state change (800ms debounce)
- Restore on boot via `restoreSession()`
- Persists: tabs, active tab, MRU, closed history, dock state, split mode, pane assignments

### Quick Switcher
- **Ctrl+Tab** — cycle tabs + open MRU overlay
- **Ctrl+Shift+Tab** — reverse cycle
- **Ctrl+Shift+T** — reopen last closed tab
- **Ctrl+`** — toggle terminal dock

### Status Bar
- Tab count and split mode from workspace engine
- Existing service probes retained

---

## Integration Points

| File | Change |
|------|--------|
| `app/providers.tsx` | `WorkspaceEngineProvider` |
| `components/os/OmniMindAppShell.tsx` | Center = `OmniMindWorkspaceEngine` |
| `components/os/OmniMindHomeAppShell.tsx` | Home uses workspace engine |
| `components/ide/SovereignWorkbenchShell.tsx` | OS tools → App Shell + engine |
| `components/ecosystem/OmniMindKeyboardBindings.tsx` | Workspace shortcuts |
| `app/page.tsx` | Unified home shell |

Protected tools (`omniforge-engine`, `architectural-designer`) render via `WorkbenchLayoutRouter` inside tabs without nested App Shell.

---

## New Files

```
lib/workspace-engine/types.ts
lib/workspace-engine/store.ts
lib/workspace-engine/session.ts
lib/workspace-engine/index.ts
lib/workspace-engine-context.tsx
components/workspace-engine/OmniMindWorkspaceEngine.tsx
components/workspace-engine/OmniMindWorkspaceTabBar.tsx
components/workspace-engine/OmniMindWorkspaceSplitLayout.tsx
components/workspace-engine/OmniMindWorkspaceDock.tsx
components/workspace-engine/OmniMindWorkspaceWindowChrome.tsx
components/workspace-engine/OmniMindWorkspaceQuickSwitcher.tsx
components/workspace-engine/OmniMindWorkspaceToolPane.tsx
components/workspace-engine/OmniWorkspaceTerminal.tsx
```

---

## Remaining (Phase 2b)

1. Per-pane different tools in quad split (UI to assign pane tab)
2. Floating window drag (`OmniWindowManager` UI)
3. Backend `saveWorkspace` / `loadWorkspace` via OmniCore API
4. Virtualized tab bar for 20+ tabs
5. Platform routes (mission-control, etc.) as first-class tab content components
6. Wire explorer dock to real project file tree
7. Alt+Tab workspace switcher (multi-workspace names)

---

## Verification

```bash
cd frontend
npm run lint && npm run test && npm run build
```
