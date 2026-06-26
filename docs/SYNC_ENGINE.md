# Sync Engine

The OmniCloud Sync Engine (`OmniCloudSyncEngine`) synchronizes OmniMind state across all registered devices.

## Sync Domains

| Domain | Source Module | Persistence |
|--------|---------------|-------------|
| projects | `omniProjectManager` | `/api/v1/omnicore/projects` |
| ai-chats | `omniAI.conversations` | Conversation store |
| ai-memory | `omniAI.memory` | `/api/v1/omnicore/ai/memory` |
| settings | `omniSettings` | `/api/v1/omnicore/settings` |
| themes | `omniThemeEngine` | Platform bundle |
| plugins | `omniPluginEngine` | Plugin registry |
| sdk | Developer SDK manifests | Cloud metadata |
| templates | Template library | Cloud metadata |
| assets | `omniAssets` | Asset cloud sync |
| images / videos / music / documents | Filtered assets | Per-kind sync |
| workspaces | `omniWorkspaceManager` | Workspace presets |
| shortcuts | `omniShortcutManager` | User shortcuts |
| preferences | Settings subset | Encrypted sync |

## Sync Flow

```
Device A                          Cloud                           Device B
   │                                │                                │
   │── POST /omnicloud/sync ───────►│                                │
   │   (all domains or subset)      │── persist per domain ─────────►│
   │                                │                                │
   │◄── SyncResult[] ───────────────│◄── pull on next boot/sync ──────│
   │                                │                                │
   │── cloud:sync event ────────────►│                                │
```

## API

- `POST /api/v1/omnicore/omnicloud/sync` — sync all or specified domains
- `POST /api/v1/omnicore/omnicloud/sync/{domain}` — single domain
- `POST /api/v1/omnicore/omnicloud/sync/conflicts/resolve` — conflict resolution

## Conflict Resolution

Supported strategies:

- `local-wins` — device state overwrites cloud
- `remote-wins` — cloud state overwrites device
- `merge` — field-level merge (domain-specific)

Offline queue items flush through `OmniCloudOffline.flush()` when connectivity returns.

## Client Usage

```typescript
await omniCore.cloud.syncAll();
// or
await omniCore.platformSync.syncAll(); // delegates to cloud engine
```

## Status Model

| Status | Meaning |
|--------|---------|
| `idle` | Ready |
| `syncing` | Active sync in progress |
| `offline` | Offline mode — queue only |
| `error` | Last sync failed; legacy fallback may run |

## Events

Each successful domain sync publishes `cloud:sync` on `omniCore.eventBus` with `{ domain }`.
