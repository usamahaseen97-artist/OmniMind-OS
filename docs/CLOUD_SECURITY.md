# Cloud Security

OmniCloud implements end-to-end encryption architecture across sync, backup, AI memory, and projects by composing OmniSecurity primitives.

## Encryption Model

| Layer | Protection |
|-------|------------|
| In transit | TLS (HTTPS for all API calls) |
| At rest | AES-256-GCM via `OmniDataProtection.encryptionHooks()` |
| Device trust | `OmniTrustedDeviceManager` fingerprint validation |
| Sessions | `OmniSessionRegistry` multi-device session control |

## Encrypted Surfaces

- **Encrypted Sync** — all sync domain payloads pass through encryption hooks before persistence
- **Encrypted Backup** — backup metadata uses `secureBackupMetadata()` with vault key references
- **Encrypted AI Memory** — memory cloud entries marked `encrypted: true` on sync
- **Encrypted Projects** — project snapshots stored with encryption policy applied

## Device Authorization

```
Register device → fingerprint stored → trusted flag set
Subsequent sync → authorizeDevice(fingerprint) → allow/deny
```

Trusted devices sync without re-authorization. Untrusted devices require explicit approval through the Account panel.

## Policy API

```typescript
omniCore.cloud.security.syncPolicy();
// {
//   encryptedSync: true,
//   encryptedBackup: true,
//   encryptedMemory: true,
//   encryptedProjects: true,
//   algorithm: "AES-256-GCM"
// }
```

## PII Classification

`OmniDataProtection.classifyField()` tags fields as `public`, `internal`, `pii`, `phi`, or `secret` with retention policies:

| Classification | Encrypt at Rest | Retention |
|----------------|-----------------|-----------|
| public | No | 365 days |
| pii | Yes | 90 days |
| phi | Yes | 2555 days |
| secret | Yes | 30 days |

## Zero Trust Integration

`omniCore.security.zeroTrust` validates requests. Cloud APIs inherit OmniCore security middleware and API protection gates.

## Admin Security Metrics

The admin dashboard exposes `securityEvents` count for monitoring anomalous sync, device, and session activity.

## Best Practices

1. Register only trusted devices for production workspaces
2. Revoke sessions on device loss via Account panel
3. Use encrypted memory scope for sensitive agent context
4. Enable offline mode only on trusted hardware
