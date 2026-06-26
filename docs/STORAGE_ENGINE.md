# Storage Engine

OmniCloud Storage manages cloud files, assets, object storage, CDN delivery, media libraries, backup, and encrypted vaults.

## Bucket Types

| Kind | Purpose | CDN |
|------|---------|-----|
| `files` | General cloud files | Yes |
| `assets` | Project-linked assets | Yes |
| `media` | Images, video, audio | Yes |
| `backup` | Point-in-time backups | No |
| `encrypted` | E2E encrypted objects | No |

## Bucket Schema

```typescript
type StorageBucket = {
  id: string;
  kind: "files" | "assets" | "media" | "backup" | "encrypted";
  usedBytes: number;
  quotaBytes: number;
  cdnEnabled: boolean;
};
```

## Architecture

```
OmniAssets (local)  →  OmniCloudSyncEngine (assets domain)
                              ↓
                    OmniCloudStorage.buckets
                              ↓
              POST/GET /api/v1/omnicore/omnicloud/storage
                              ↓
                    backend/lib/omnicloud/store.storage_buckets()
```

## Asset Integration

`omniCore.assets.cloud` handles per-file offline queue and conflict detection. OmniCloud Storage aggregates usage across buckets and exposes quotas in the Admin panel.

## Project Cloud Storage

Project snapshots (`OmniCloudProjectCloud`) contribute to storage usage via `sizeBytes` on each snapshot record.

## CDN

Media and asset buckets enable `cdnEnabled: true` for edge-cached delivery. Backup and encrypted buckets remain private origin only.

## API

- `GET /api/v1/omnicore/omnicloud/storage` — list buckets with usage and quotas

## Client Usage

```typescript
const buckets = await omniCore.cloud.storage.load();
const used = omniCore.cloud.storage.totalUsed();
const quota = omniCore.cloud.storage.totalQuota();
```

## Admin Metrics

The admin dashboard aggregates `storageBytes` across all buckets for billing and capacity planning.

## Backup & Recovery

Backup bucket pairs with:

- `omniCore.assets.backup` — local backup points
- `OmniCloudSecurity.secureBackupMetadata()` — encrypted backup metadata

## Quotas

Default quotas are provisioned per plan tier. Enterprise plans support custom quota expansion through the admin organizations API (future).
