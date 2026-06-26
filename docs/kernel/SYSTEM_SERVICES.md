# OmniMind System Services Architecture

**Parent:** [SYSTEM_KERNEL.md](./SYSTEM_KERNEL.md) · [SERVICE_REGISTRY.md](./SERVICE_REGISTRY.md)

---

## 1. Overview

OmniMind OS V12 centralizes platform behavior in **22 system services**. Each service is a singleton manager exposed through `OmniCore` or a named satellite facade. Tools and plugins consume services via kernel APIs and events — never by importing peer implementations.

---

## 2. Service Catalog

| # | Service | Primary module | `OmniCore` / facade accessor |
|---|---------|----------------|------------------------------|
| 1 | **Workspace Manager** | `OmniWorkspaceManager.ts` | `omniCore.workspace` |
| 2 | **Project Manager** | `OmniProjectManager.ts` + `OmniProjectHub.ts` | `omniCore.projects`, `projectHub` |
| 3 | **Session Manager** | `OmniSessionManager.ts` + security sessions | `omniCore.session`, `security.sessions` |
| 4 | **Window Manager** | `OmniWindowManager.ts` | `omniCore.windows` |
| 5 | **Task Manager** | `OmniSystemTaskManager.ts` + agent tasks | `ecosystem.tasks`, `missionControl.background` |
| 6 | **Notification Manager** | `OmniNotificationCenter.ts` + live notifications | `omniCore.notifications`, `ecosystem.activity` |
| 7 | **Settings Manager** | `OmniSettings.ts` | `omniCore.settings` |
| 8 | **Extension Manager** | `OmniPluginEngine.ts` + `PluginManager.ts` | `omniCore.plugins` |
| 9 | **Permission Manager** | `OmniSecurity` + collaboration permissions | `omniCore.security` |
| 10 | **Theme Manager** | `OmniThemeEngine.ts` + design system | `omniCore.theme` |
| 11 | **Language Manager** | `OmniLocalization.ts` + polyglot registry | `omniCore.i18n`, `omniforge-polyglot-registry` |
| 12 | **AI Model Manager** | `OmniModelManager.ts` + router | `omniCore.ai.models` |
| 13 | **Memory Manager** | `OmniMemory.ts` + brain memory facades | `omniCore.ai.memory` |
| 14 | **Storage Manager** | `OmniAssets.ts` | `omniCore.assets` |
| 15 | **Cache Manager** | `offline-queue.ts` + server Redis | `lib/shared/offline-queue` |
| 16 | **Download Manager** | `OmniImportExport.ts` | `omniCore.assets.importExport` |
| 17 | **Upload Manager** | `OmniCloudSync` + asset indexer | `omniCore.cloud`, `assets.cloud` |
| 18 | **Background Worker Manager** | `OmniBackgroundEngine.ts` + schedulers | `missionControl.background` |
| 19 | **Telemetry Manager** | `OmniObservability.ts` | `omniCore.quality.observability` |
| 20 | **Health Manager** | `OmniHealthMonitor.ts` | `omniCore.quality.health` |
| 21 | **Update Manager** | `OmniUpdateManager.ts` | `omniCore.updates` |
| 22 | **License Manager** | `OmniBillingArchitecture.ts` | `omniCore.collaboration.billing` |

---

## 3. Service Details

### 3.1 Workspace Manager

**Responsibilities:** Layout presets, active workspace profile, coordination with Workspace Engine (Phase 2).

| API | Purpose |
|-----|---------|
| `activePresetId` | Current layout preset |
| Presets | `DEFAULT_LAYOUT_PRESETS` in constants |

**Phase 2 bridge:** `lib/workspace-engine/` handles tabs/splits; `OmniWorkspaceManager` holds preset metadata. Events: `workspace:changed`.

### 3.2 Project Manager

**Responsibilities:** CRUD projects, active project, cross-tool project kinds (`tool-scoped`, `cross-tool`, `universal`).

| API | Purpose |
|-----|---------|
| `omniCore.projects` | `PROJECT_SEED`, `activeProjectId` |
| `omniCore.projectHub` | Recent, pinned |

Events: `project:opened`, `project:closed` (kernel bus).

### 3.3 Session Manager

**Dual layer:**

| Layer | Module | Scope |
|-------|--------|-------|
| OS session | `OmniSessionManager` | Active tool, project, `sessionId` |
| Auth session | `OmniSecurity.sessions` | JWT, devices, MFA |

`session.start()` publishes `session:started`.

### 3.4 Window Manager

**Responsibilities:** Window chrome state, snap, minimize, maximize (OmniCore layer).

**Phase 2:** `OmniMindWorkspaceWindowChrome` in workspace engine — kernel coordinates via events, not direct React coupling.

### 3.5 Task Manager

**Unified view:**

| Source | Types |
|--------|-------|
| `OmniSystemTaskManager` | CPU, GPU, RAM, AI tokens, queues |
| `BackgroundScheduler` | Brain actions (pause/resume/cancel) |
| `TaskManager` (agent) | Workflow steps |
| `OmniBackgroundEngine` | Mission Control job list |

### 3.6 Notification Manager

| Layer | Module |
|-------|--------|
| Platform | `OmniNotificationCenter` |
| Live | `OmniLiveNotifications` (ecosystem) |
| Activity | `OmniMindActivityCenter` |

Event: `notification:show`, `notification:live`.

### 3.7 Settings Manager

**Source:** `OmniSettings` — global/workspace/tool scoped keys.  
Publishes: `settings:changed`.  
See [UNIFIED_SETTINGS](../ecosystem/UNIFIED_SETTINGS.md).

### 3.8 Extension Manager

**Dual engine** (see [PLUGIN_ENGINE](../platform/PLUGIN_ENGINE.md)):

- `omniPluginEngine` — marketplace, sandbox, updater
- `getOmniPluginManager()` — manifest lifecycle, brain bridge

### 3.9 Permission Manager

- Platform: `omniSecurity.authorize()`
- Org: `omniCollaboration.permissions`
- Destructive: `PermissionGate` (OmniPilot)
- Plugins: `OmniPluginPermissions`

### 3.10 Theme Manager

- `OmniThemeEngine` (OmniCore)
- `applyDesignSystemTheme` (design-system)
- Plugin themes: `OmniThemeSDK`

Setting: `theme.id` in `OmniSettings`.

### 3.11 Language Manager

| Concern | Module |
|---------|--------|
| UI locale | `OmniLocalization`, `SUPPORTED_LOCALES` |
| Syntax / polyglot | `LANGUAGE_PLUGINS`, `registerLanguagePlugin()` |
| Marketplace packs | `language_pack` listings |

### 3.12 AI Model Manager

**Source:** `OmniAI` submodule graph

| Component | Role |
|-----------|------|
| `OmniModelManager` | Model catalog |
| `OmniModelRouter` | Provider routing |
| `OmniProviderRegistry` | Gemini, local, etc. |
| `OmniInferenceQueue` | Request queue |

All inference via `omniAI.complete()` — no direct provider calls in tools.

### 3.13 Memory Manager

| Store | Module |
|-------|--------|
| AI memory | `OmniMemory` (scoped entries) |
| Agent memory | `MemoryManager` |
| Brain global | `GlobalMemory` |
| Unified facade | OmniPilot Memory Engine (spec) |

### 3.14 Storage Manager

**Facade:** `OmniAssets` — projects, assets, workspace blobs, versions, explorer, cloud sync.

### 3.15 Cache Manager

| Tier | Implementation |
|------|----------------|
| HTTP | `lib/shared/http-client.ts` cache headers |
| Offline writes | `OfflineQueue` (`omnimind:offline-queue`) |
| Recent projects | `recent-project-cache.ts` |
| Server | `redis_cache.py` |

### 3.16 Download Manager

`OmniImportExport` — bundles, ZIP, reports. Audited exports per [AUDIT_LOGS](../security/AUDIT_LOGS.md).

### 3.17 Upload Manager

- Asset registration on upload → `OmniAssetManager.register`
- Cloud: `OmniCloudSyncEngine` domains
- Event: `omnimind:ecosystem-assets-dropped`

### 3.18 Background Worker Manager

**Facade:** `OmniBackgroundEngine` aggregates ecosystem agents, automation queue, remote MC jobs.

Controls: pause, resume, cancel via [BACKGROUND_JOB_ENGINE](../ecosystem/BACKGROUND_JOB_ENGINE.md).

### 3.19 Telemetry Manager

**Source:** `OmniObservability`

| Method | Purpose |
|--------|---------|
| `increment(metric)` | Counters |
| `recordLatency(metric, ms)` | Histograms, p95 |
| `metrics()` | Memory, queue depth, job count |

Gated by `telemetry.enabled` in settings (default `false`).

### 3.20 Health Manager

**Source:** `OmniHealthMonitor` inside `OmniQuality`.  
See [HEALTH_MONITOR.md](./HEALTH_MONITOR.md).

### 3.21 Update Manager

**Source:** `OmniUpdateManager`

| Channel | `stable` \| `beta` \| `enterprise` |
| API | `check()`, `setChannel()` |

Coordinates with plugin updater for extension updates.

### 3.22 License Manager

**Source:** `OmniBillingArchitecture`

| Data | Purpose |
|------|---------|
| Plan | free / team / enterprise |
| Seats | Org member limit |
| Storage quota | `storageQuotaBytes` vs `usedStorageBytes` |
| Renewal | `renewalAt` |

Marketplace paid listings integrate with license keys.

---

## 4. Satellite Services (Kernel-Adjacent)

Not in the 22-count but booted with kernel:

| Service | Facade |
|---------|--------|
| Layout Manager | `omniCore.layout` |
| Dock Manager | `omniCore.dock` |
| Command Palette | `omniCore.commandPalette` |
| Global Search | `omniCore.search` |
| Clipboard | `omniCore.clipboard` |
| Shortcuts | `omniCore.shortcuts` |
| Undo/Redo | `omniCore.undo` |
| State Manager | `omniCore.state` |
| Platform Sync | `omniCore.platformSync` |
| Unified Brain | `omniCore.brain` |
| Mission Control | `omniCore.missionControl` |
| Automation | `omniCore.automation` |
| Ecosystem OS | `omniCore.ecosystem` |

---

## 5. Workspace Engine Integration

Phase 2 workspace engine (`lib/workspace-engine/`) is a **platform service** mounted in providers:

- Session persistence: `omnimind_workspace_engine_v2`
- Kernel receives tab/MRU events via `omnimind:workspace-saved`
- Does not replace `OmniWorkspaceManager` — complements it

---

## 6. Protected Tool Boundary

All 22 services are available to protected tools through **public APIs only**:

```
✅ omniCore.ai.complete()
✅ omniEventBus.publish("FileGenerated", ...)
✅ omniCore.notifications.show()
❌ Import OmniForge internal stores in kernel service code
```

---

## Related Documents

- [SERVICE_REGISTRY.md](./SERVICE_REGISTRY.md)
- [EVENT_BUS.md](./EVENT_BUS.md)
- [../ecosystem/GLOBAL_FILE_SYSTEM.md](../ecosystem/GLOBAL_FILE_SYSTEM.md)
