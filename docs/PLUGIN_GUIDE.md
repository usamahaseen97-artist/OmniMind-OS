# OmniMind Plugin Guide — Enterprise Marketplace

**Version:** 1.0.0-rc1

---

## Plugin Platforms

| System | Path | Use |
|--------|------|-----|
| **OmniCore Platform** | `core/plugins/omnicore-platform/` | Extensions, themes, automation |
| **Legacy Tool Framework** | `core/plugins/` | Sovereign tool plugins |

RC1 standard: **new extensions** use OmniCore Platform; legacy plugins run via adapter.

---

## OmniCore Plugin Engine

```typescript
import { omniCore } from "@/core/omnicore";

// Browse marketplace
const listings = omniCore.plugins.marketplace.browse("productivity");

// Install + enable
await omniCore.plugins.installAndLoad("ext-omni-theme-pack");
omniCore.plugins.manager.enable("ext-omni-theme-pack");

// Permissions
omniCore.plugins.permissions.grant("ext-id", "filesystem.read");
```

---

## Modules

| Module | Role |
|--------|------|
| `OmniPluginRegistry` | Installed plugins |
| `OmniPluginMarketplace` | Store listings |
| `OmniPluginSandbox` | Isolated execution |
| `OmniPluginPermissions` | Capability grants |
| `OmniPluginInstaller` | Install flow |
| `OmniPluginUpdater` | Version updates |
| `OmniExtensionAPI` | Host API for plugins |
| `OmniThemeSDK` | Theme extensions |
| `OmniAutomationSDK` | Workflow automation |

---

## Security

- `OmniPluginSecurityGate` validates signatures
- Sandbox blocks unauthorized APIs
- Permissions: global / session / once scopes

---

## CLI (SDK)

```bash
npm run sdk:doctor --prefix frontend
npm run omnimind -- create my-plugin
```

Deploy via Docker/Kubernetes (Sprint 5) — `sdk deploy` stub maps to infra pipelines.

---

## Search Integration

Plugins appear in **Global Search** (`kind: plugin`) and **Command Palette** (`cmd-plugin-manager`).
