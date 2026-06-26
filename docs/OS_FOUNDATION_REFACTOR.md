# OmniMind OS Foundation Refactor

**Date:** 2026-06-17  
**Scope:** Unified App Shell, design system alignment, duplicate UI consolidation  
**Protected (unchanged):** OmniForge Engine · OmniForge Code Generation · Architectural Designer Core

---

## What Was Built

### 1. Canonical App Shell (`OmniMindAppShell`)

Single enterprise shell for every non-protected tool:

| Zone | Component |
|------|-----------|
| Top Command Bar | `OmniMindOSHeader` — breadcrumbs, ⌘K search, palette, theme, API status |
| Left Sidebar | `OmniMindOSSidebar` — categorized tool registry |
| Workspace | Tool content (dynamic loader) |
| Right AI Panel | `OmniMindOSCopilot` — one assistant for the entire OS |
| Bottom Status Bar | `OmniMindOSStatusBar` — services, memory, workspace |
| Global overlays | `OmniMindOSGlobalChrome` — palette, quick search, notifications |

**Files:** `components/os/OmniMindAppShell.tsx`, `OmniMindHomeAppShell.tsx`, `OmniMindToolLoader.tsx`

### 2. Tool Loader & Registry

- **Registry:** `lib/sovereign-tool-registry.ts` (unchanged public API)
- **Loader:** `OmniMindToolLoader` → `SovereignWorkbenchShell` → `OmniMindAppShell` (non-protected)
- **Protected tools** keep native shells: `omniforge-engine`, `architectural-designer`
- **Pilot config:** `lib/omnimind-os-pilot.ts` — `PROTECTED_SHELL_SLUGS`, `usesOmniMindOSShell()`

### 3. Sidebar Categories (single navigation)

`lib/omnimind-os-categories.ts` reorganized:

Platform · Development · Creative · Business · Medical · Automation · Cloud · Marketplace · Research · Settings

### 4. Duplicate UI Removal

| Removed / hidden when App Shell active | Replaced by |
|----------------------------------------|-------------|
| Per-tool `ToolWorkbenchHeader` | `OmniMindOSHeader` |
| `SovereignActivityBar` | `OmniMindOSSidebar` |
| `WorkspaceShell` chat column | `OmniMindOSCopilot` |
| `OmniMindEcosystemChrome` dock + universal sidebar | App Shell (hidden via `shouldHideEcosystemChrome`) |
| Home `app/page.tsx` header + `GlobalMenuDrawer` (sovereign-core) | `OmniMindHomeAppShell` |
| Module headers (medical, visionary, music, marketing) | `embeddedInAppShell` prop hides duplicate chrome |

### 5. Global Search & Command Palette

Already present — now primary entry via App Shell header:

| Shortcut | Action |
|----------|--------|
| **Ctrl+K** | Command palette (`OmniMindCommandPalette`) |
| **Ctrl+P** / **Ctrl+F** | Quick search (`OmniMindQuickSearch`) |

### 6. Design System

Existing `design-system/` + `OS_TOKENS` bridge — App Shell uses semantic tokens throughout.

### 7. Home Route

`/` now uses `OmniMindHomeAppShell` with the same chrome as sovereign tools (dashboard + chat in workspace, copilot on right).

---

## Architecture

```
Providers
  └── OmniMindOSGlobalChrome (palette, search, notifications)
  └── Route
        ├── / → OmniMindHomeAppShell
        └── /{tool} → SovereignToolPage
              └── SovereignWorkbenchShell
                    ├── [protected] native workbench
                    └── [default] OmniMindAppShell
                          └── WorkbenchLayoutRouter
                                └── ZoneContentRouter (embedded workspaces)
```

---

## `embeddedInAppShell` Pattern

Flagship workspaces hide duplicate chrome when inside App Shell:

- `MedicalWorkspaceLayout`, `VisionaryStudioLayout`, `OmniMusicStudioShell`
- `CreativeVisionaryShell`, `DigitalMarketingHubShell`, `MedicalStudioShell`
- `SpatialStudioShell`, `WorkspaceShell`

---

## Remaining Work (incremental)

1. Entertainment views (`omnitv`, `omnimovies`) — migrate to App Shell
2. Platform pages (`mission-control`, `automation-engine`, `omnicloud`) — wrap in App Shell
3. Delete orphan components: `OmniSidebar`, `GeminiSidebar`, `SovereignToolsSidebar`, etc.
4. Workspace tabs / split-view persistence layer
5. Full design-system token migration (remove hardcoded hex in legacy layouts)

---

## Verification

```bash
cd frontend
npm run lint && npm run test && npm run build
```

All checks pass post-refactor.
