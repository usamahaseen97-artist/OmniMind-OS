# OmniMind Permission Matrix

**Scope:** Platform RBAC (`core/security`) + Organization RBAC (`core/collaboration`)  
**Legend:** ✅ granted · — denied · 🔧 tool-scoped

---

## Platform Roles (`core/security`)

| Permission | platform:owner | platform:admin | org:owner | org:admin | workspace:manager | project:editor | tool:operator | api:integrator | plugin:developer | viewer | guest |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `auth:session:read` | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| `auth:session:revoke` | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| `org:read` | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | ✅ | — |
| `org:write` | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| `workspace:read` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ | — |
| `workspace:write` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — |
| `project:read` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | ✅ | ✅ |
| `project:write` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — |
| `tool:execute` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — |
| `api:key:manage` | ✅ | ✅ | ✅ | — | — | — | — | ✅ | — | — | — |
| `plugin:install` | ✅ | ✅ | ✅ | — | — | — | — | — | ✅ | — | — |
| `plugin:execute` | ✅ | — | — | — | — | — | — | — | ✅ | — | — |
| `audit:read` | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| `security:admin` | ✅ | ✅ | — | — | — | — | — | — | — | — | — |

---

## Organization Roles (`core/collaboration`)

| Permission | owner | administrator | manager | editor | reviewer | viewer | guest |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `org:read` | ✅ | ✅ | ✅ | — | — | — | — |
| `org:write` | ✅ | ✅ | — | — | — | — | — |
| `org:admin` | ✅ | ✅ | — | — | — | — | — |
| `workspace:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `workspace:write` | ✅ | ✅ | ✅ | — | — | — | — |
| `project:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `project:write` | ✅ | ✅ | ✅ | ✅ | — | — | — |
| `asset:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `asset:write` | ✅ | ✅ | ✅ | ✅ | — | — | — |
| `comment:write` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| `review:approve` | ✅ | ✅ | ✅ | — | ✅ | — | — |
| `billing:read` | ✅ | — | — | — | — | — | — |
| `api-key:manage` | ✅ | ✅ | — | — | — | — | — |

---

## ABAC Attributes (`OmniABACEngine`)

| Attribute | Used when |
|-----------|-----------|
| `userId` | Always |
| `orgId` | Org-scoped permissions |
| `workspaceId` | Workspace-scoped |
| `projectId` | Project-scoped |
| `toolSlug` | Tool execution |
| `deviceTrusted` | Zero trust decisions |
| `mfaVerified` | Sensitive operations |
| `ip` | IP allowlist (collaboration security center) |

**Decision flow:**
1. RBAC: `OmniAuthorizationEngine.can(userId, permission)`
2. ABAC: context attributes evaluated
3. Zero Trust: `OmniZeroTrustEngine.validateRequest` combines both
4. Deny → `OmniSecurityMonitor.record(permission_denied)`

---

## Tool Permissions (Sovereign Tools)

| Tool slug | Required permission | Notes |
|-----------|---------------------|-------|
| `omniforge-engine` | `tool:execute` | Group A IDE |
| `visionary-studio` | `tool:execute` + `project:write` | Asset mutations |
| `omnimusic` | `tool:execute` | DAW studio |
| `medical-diagnostic-suite` | `tool:execute` + PHI policy | ABAC: `mfaVerified` |
| `marketplace` | `plugin:install` | Extension installs |
| All sovereign tools | `tool:execute` minimum | Read-only sim: `project:read` |

---

## Plugin Permissions (`OmniPluginPermissions`)

| Capability | Permission key | Prompt |
|------------|----------------|--------|
| Filesystem read | `filesystem:read` | User grant |
| Filesystem write | `filesystem:write` | User grant |
| Network | `network` | User grant |
| AI inference | `ai:inference` | User grant |
| Asset access | `assets:read` | User grant |
| Commands | `commands:register` | Auto on install |

**Security gate:** `OmniPluginSecurityGate` requires signed manifest + user grant.

---

## API Permissions

| Endpoint prefix | Minimum role |
|-----------------|--------------|
| `/api/v1/omnicore/security/*` | `security:admin` (write) / authenticated (read) |
| `/api/v1/omnicore/collaboration/*` | `org:read` + org membership |
| `/api/v1/auth/*` | Public (login) / authenticated (me) |
| `/api/v1/omnicore/*` | `project:read` (stubs) |

---

## Usage

```typescript
import { omniCore } from "@/core/omnicore";

const decision = omniCore.security.authorize(
  {
    userId: "user-1",
    orgId: "org-1",
    projectId: "proj-1",
    toolSlug: "visionary-studio",
    mfaVerified: true,
  },
  "project:write",
);

if (!decision.allowed) {
  // logged to OmniSecurityMonitor automatically
}
```

```typescript
// Collaboration layer (org-scoped)
omniCore.collaboration.permissions.can("user-1", "org-1", "project:write");
```

---

## Custom Roles

- **Platform:** `OmniAuthorizationEngine.assignRole(userId, role)`
- **Organization:** `OmniRoleManager.createCustom(orgId, name, permissions[])`

---

*Matrix is architecture documentation — enforce at API gateway in production deployment.*
