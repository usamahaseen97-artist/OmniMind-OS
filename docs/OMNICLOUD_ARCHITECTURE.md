# OmniCloud Architecture

OmniCloud V2.0 is the cloud-native platform layer for OmniMind. It expands the existing OmniCore foundation without redesigning OmniForge Engine or Architectural Designer.

## Design Principles

- **Additive composition** — OmniCloud mounts on `omniCore.cloud` alongside ecosystem, automation, and mission control.
- **Production integrity** — All APIs persist through `backend/lib/omnicloud/` and `omnicore_store`; no mock paths in production UI.
- **Single account** — One OmniMind identity across desktop, laptop, tablet, Android, iPhone, web, and future devices.

## Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│  OmniCloud Workspace UI  (/omnicloud)                       │
├─────────────────────────────────────────────────────────────┤
│  omniCore.cloud (OmniCloudPlatform facade)                  │
│  account · sync · projects · memory · background · remote   │
│  storage · security · offline · developer · admin           │
├─────────────────────────────────────────────────────────────┤
│  OmniCloudApiClient  →  /api/v1/omnicore/omnicloud/*       │
├─────────────────────────────────────────────────────────────┤
│  backend/lib/omnicloud/store.py + remote_executor.py        │
│  MongoDB (omnicore_platform) with process-memory fallback   │
├─────────────────────────────────────────────────────────────┤
│  Existing OmniCore: projects, AI, assets, security, plugins │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

| Module | Responsibility |
|--------|----------------|
| `OmniCloudAccount` | Multi-device login, sessions, trusted devices |
| `OmniCloudSyncEngine` | 16-domain automatic synchronization |
| `OmniCloudProjectCloud` | Cloud save/restore, snapshots, timeline, rollback |
| `OmniCloudMemoryCloud` | Universal, project, workspace, agent memory + graph |
| `OmniCloudBackground` | Cloud execution entry points for heavy workloads |
| `OmniCloudRemoteExecution` | Job queue, progress, ETA, logs, resource usage |
| `OmniCloudStorage` | Files, assets, media, backup, encrypted buckets |
| `OmniCloudSecurity` | E2E encryption policy via OmniSecurity data protection |
| `OmniCloudOffline` | Offline queue, conflict resolution, auto flush |
| `OmniCloudDeveloper` | API surface, CLI, webhooks, cloud functions |
| `OmniCloudAdmin` | Usage analytics, devices, organizations, subscriptions |

## Integration Points

- `omniCore.platformSync.syncAll()` delegates to `OmniCloudSyncEngine`.
- `omniCore.assets.cloud` remains the asset-level offline queue; OmniCloud orchestrates platform-wide sync.
- `omniCore.security` provides device trust and encryption hooks.
- Event bus publishes `cloud:sync` per domain after successful sync.

## API Namespace

All OmniCloud REST endpoints live under:

`/api/v1/omnicore/omnicloud/`

Registered in `backend/main.py` via `omnicore_omnicloud` router.

## Boot Chain

On `omniCore.boot()`:

1. OmniCore foundation modules boot
2. `omniCore.cloud.boot()` loads account, storage, memory, remote jobs, admin
3. Current device registers with trusted fingerprint

## Non-Goals

- Does not replace OmniForge Engine internals
- Does not remove Architectural Designer workflows
- Does not fork existing project or AI APIs — extends them
