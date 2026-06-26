# Enterprise Permission Matrix

**Parent:** [RBAC.md](./RBAC.md) · [ENTERPRISE_SECURITY.md](./ENTERPRISE_SECURITY.md)

---

## 1. Purpose

Every module checks permissions before executing actions. This matrix defines **required permissions** per module and action. Enforcement uses `omniSecurity.authorize()` + org `OmniPermissionEngine.can()` + tool-specific gates.

**Legend:**

| Symbol | Meaning |
|--------|---------|
| ✅ | Allowed for role |
| 🔒 | Requires MFA or PermissionGate approval |
| ❌ | Denied |
| 🏥 | Requires clinical RBAC overlay |

---

## 2. Role Columns

| Abbr | Role |
|------|------|
| O | Owner |
| A | Administrator |
| M | Manager |
| D | Developer |
| Des | Designer |
| An | Analyst |
| Med | Medical Specialist |
| V | Viewer |
| G | Guest |

---

## 3. Module Matrix

### 3.1 Medical (`medical-diagnostic`, `medical-diagnostic-suite`)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| Open tool | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| View patient (PHI) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅🏥 | ❌ | ❌ |
| Upload imaging | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅🏥 | ❌ | ❌ |
| Run AI triage | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅🏥 | ❌ | ❌ |
| Export PDF report | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅🏥 | ❌ | ❌ |
| Governance / audit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅🏥 | ❌ | ❌ |

**Permissions:** `tool:execute`, `asset:read/write`, clinical `emr:*`, `imaging:*`  
**API probe:** `/api/agents/medical/triage`

---

### 3.2 Visionary (`visionary-studio`, `creative-visionary`, `vfx-master`)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| Open tool | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Generate image/video | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit timeline | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export render | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Background render job | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Permissions:** `tool:execute`, `asset:read`, `asset:write`  
**Plugin scopes:** `filesystem`, `network`

---

### 3.3 Marketing (`digital-marketing-hub`)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| Open tool | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Create campaign | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Publish / external API | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Brand asset import | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**Permissions:** `tool:execute`, `asset:write`, `network`  
**Workflow:** `marketing-campaign`

---

### 3.4 Business Analytics (`business-analytics`)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| Open tool | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Import dataset | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅🔒 | ❌ | ❌ |
| Run analysis | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Create dashboard | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export report | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅🔒 | ❌ | ❌ |

**Permissions:** `tool:execute`, `asset:read`, `database` scope  
**PHI exports:** Require clinical clearance when source is medical report asset.

---

### 3.5 Quantum Trading (`quantum-trading`)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| Open tool | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| View signals | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Execute trade | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| API broker connect | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Permissions:** `tool:execute`, `network`, `api:key:manage` for broker keys

---

### 3.6 Mission Control (`/mission-control`)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| View dashboard | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Agent start/stop | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Security center | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Infrastructure ops | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Permissions:** `audit:read`, `security:admin` (security widgets), `tool:execute` (agents)

---

### 3.7 SDK / Marketplace

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| Browse marketplace | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Install plugin | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| SDK API key create | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Plugin execute | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Permissions:** `plugin:install`, `plugin:execute`, `api:key:manage`  
**Gate:** `OmniPluginSecurityGate` validates manifest signature + sandbox level.

---

### 3.8 Cloud (`/omnicloud`)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| View sync status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Trigger sync | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage domains | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| PHI cloud sync | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅🔒 | ❌ | ❌ |

**Permissions:** `org:write`, `asset:write`, `security:admin` for domain config  
**Setting:** `cloud.syncEnabled`

---

### 3.9 Automation (`/automation-engine`)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| View workflows | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Create workflow | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Execute workflow | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| AI-generated workflow | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Permissions:** `tool:execute`, `project:write`  
**Events:** `automation:execution-started`, `automation:execution-control`

---

### 3.10 Settings (Unified)

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| View settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Change appearance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Change AI models | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Security settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Billing | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Org member mgmt | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Permissions:** `org:admin`, `security:admin`, `billing:read`  
**Publishes:** `settings:changed` on `omniEventBus`

---

### 3.11 Protected Tools (integration only)

#### OmniForge Engine

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| Open IDE | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Scaffold / generate | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Terminal execute | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Deploy | ✅ | ✅ | ❌ | ✅🔒 | ❌ | ❌ | ❌ | ❌ | ❌ |

**Internal API:** `requireInternalApiAuth` on `/api/execute`, deploy hooks.

#### Architectural Designer

| Action | O | A | M | D | Des | An | Med | V | G |
|--------|---|---|---|---|-----|----|----|---|---|
| Open designer | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Generate blueprint | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export spatial | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Permission Check Implementation

```typescript
function checkModuleAccess(
  userId: string,
  orgId: string,
  toolSlug: string,
  action: string,
): boolean {
  const platformPerm = mapActionToSecurityPermission(toolSlug, action);
  const orgPerm = mapActionToOrgPermission(toolSlug, action);

  const platform = omniSecurity.authorize({
    userId, orgId, toolSlug,
    mfaVerified: session.mfaVerified,
    deviceTrusted: devices.isTrusted(userId, fingerprint),
  }, platformPerm);

  if (!platform.allowed) return false;
  if (orgPerm && !omniCollaboration.can(userId, orgId, orgPerm)) return false;
  if (toolSlug.startsWith("medical")) return checkClinicalRBAC(userId, action);
  return true;
}
```

---

## 5. OmniPilot Command Gating

Natural-language commands map to matrix rows:

| Command class | Extra gate |
|---------------|------------|
| Deploy | `PermissionGate` kind `deploy` |
| Delete | `PermissionGate` kind `delete` |
| Plugin install | `plugin:install` + MFA |
| PHI export | Clinical + `PermissionGate` |

---

## 6. Audit on Denial

Every matrix denial logs:

- `OmniPermissionEngine.accessLogs` (org scope)
- `OmniSecurityMonitor` event `permission_denied`
- Optional `OmniAuditCenter.log` for security-sensitive resources

---

## Related Documents

- [RBAC.md](./RBAC.md)
- [../ecosystem/TOOL_REGISTRY.md](../ecosystem/TOOL_REGISTRY.md)
- [../omnipilot/COMMAND_SYSTEM.md](../omnipilot/COMMAND_SYSTEM.md)
