# Multi-Device

OmniCloud provides a single OmniMind account synchronized across every device type.

## Supported Devices

| Kind | Platform |
|------|----------|
| `desktop` | Windows, macOS, Linux desktops |
| `laptop` | Portable workstations |
| `tablet` | iPad, Android tablets |
| `android` | Android phones |
| `iphone` | iOS devices |
| `web` | Browser sessions |
| `other` | Future device classes |

## Account Model

```typescript
type CloudAccount = {
  id: string;
  email: string;
  displayName: string;
  devices: CloudDevice[];
  sessions: CloudSession[];
  plan: "free" | "pro" | "enterprise";
};
```

## Device Registration

On `omniCore.cloud.boot()`:

1. User agent fingerprint is computed
2. Device registers via `POST /omnicloud/devices`
3. Local `OmniTrustedDeviceManager` records trust
4. Account reloads with updated device list

## Session Management

- Sessions track `deviceId`, `createdAt`, `lastActiveAt`, `expiresAt`
- Revoke individual sessions via `omniCore.cloud.account.revokeSession()`
- `revokeAllExcept` available on security session registry

## Sync Across Devices

When Device B comes online:

1. `omniCore.cloud.syncAll()` pulls cloud state
2. Per-domain `SyncResult` confirms item counts
3. `cloud:sync` events update live UI on all connected clients

## Conflict Handling

Simultaneous edits on two devices enqueue conflicts in the offline queue. Resolution strategies:

- `local-wins` — keep device changes
- `remote-wins` — accept cloud state
- `merge` — combine non-conflicting fields

## Web vs Native

Web clients detect `kind: "web"` from user agent. Native shells (Electron, Capacitor, future mobile apps) should pass explicit `kind` on device registration for accurate device management UI.

## UI

The OmniCloud **Account** tab displays:

- Registered devices with trust status
- Device kind and last seen timestamp
- Active session count

## Future Devices

The `other` kind and extensible device registry allow new form factors without schema changes.
