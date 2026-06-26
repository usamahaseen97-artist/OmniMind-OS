# OmniMind SDK Guide

**Version:** 12.0.0  
**Parent:** [PLUGIN_API.md](./PLUGIN_API.md) · [CLI.md](./CLI.md)

---

## 1. Overview

The OmniMind SDK enables first-party and third-party developers to build **tools, plugins, AI agents, workflows, and extensions** that integrate with Brain, Memory, Marketplace, Design System, and Workspace Engine.

**Rule:** Browser SDK for UI runtimes; Node SDK for CLI, generators, and server automation. **Never** import Node SDK from React client bundles.

---

## 2. Package Structure

```
frontend/sdk/
├── index.ts                 # Root export
├── OmniMindSDK.ts           # Facade selector
├── shared/
│   ├── types.ts             # SDKModuleManifest, SDK_VERSION
│   ├── validation.ts        # verifyManifest()
│   └── events/types.ts
├── browser/                 # In-browser runtime
│   ├── OmniMindSDK.ts
│   ├── api/UniversalAPI.ts
│   ├── packages/            # CoreSDK, AISDK, ...
│   ├── registration/AutoRegistration.ts
│   ├── lifecycle/ModuleLifecycle.ts
│   └── events/SDKEventBus.ts
├── node/                    # CLI + server
│   ├── OmniMindSDK.ts       # extends browser SDK
│   ├── cli/
│   └── generators/scaffold.ts
└── automation/              # Automation client hooks
```

| Constant | Value |
|----------|-------|
| `SDK_VERSION` | `12.0.0` |
| `SDK_MIN_PLATFORM` | `12.0.0` |

---

## 3. Runtime Targets

```mermaid
flowchart TB
  subgraph browser [Browser Runtime]
    WIN[window.OmniMindSDK]
    BOOT[SDKBoot.tsx]
    UAPI[UniversalAPI]
  end

  subgraph node [Node Runtime]
    NODE[OmniMindNodeSDK]
    CLI[CLI commands]
    SCAFF[scaffold / doctor]
  end

  subgraph server [Server SDK — planned packages]
    PY[omnimind-python]
    GO[omnimind-go]
    JVM[omnimind-java / csharp]
  end

  subgraph wire [Wire Protocols]
    REST[/api/v1/omnicore/*]
    GQL[GraphQL — planned]
    WH[Webhooks]
  end

  browser --> wire
  node --> wire
  server --> wire
```

---

## 4. JavaScript / TypeScript (Browser)

### Bootstrap

```typescript
// components/sdk/SDKBoot.tsx mounts:
window.OmniMindSDK = getUniversalAPI();
```

### Register a module

```typescript
import { getUniversalAPI } from "@omnimind/sdk/browser";

const api = getUniversalAPI();

await api.registerModule({
  id: "com.example.my-tool",
  name: "My Tool",
  version: "1.0.0",
  description: "Example extension",
  author: "Example Corp",
  kind: "plugin",
  route: "/my-tool",
  toolId: "my-tool",
  capabilities: ["analyze-data"],
  permissions: ["network", "notifications"],
  dependencies: [],
  designSystem: true,
  autoRegister: true,
  minOmniVersion: "12.0.0",
});
```

### Module lifecycle

```typescript
const lifecycle = api.createLifecycle(manifest);
await lifecycle.initialize();
await lifecycle.load();
await lifecycle.activate();
// on unload: lifecycle.shutdown()
```

**States:** `initialize` → `load` → `ready` → `active` → `sleep` | `pause` | `resume` → `shutdown` → `destroy`

---

## 5. TypeScript (Node / CLI)

```typescript
import { getOmniMindNodeSDK } from "@omnimind/sdk/node";

const sdk = getOmniMindNodeSDK();

const project = sdk.scaffold("my-agent", "ai-agent", "research-tool");
const docs = sdk.docs(project.manifest);
const health = await sdk.doctor();
```

See [CLI.md](./CLI.md) for terminal commands.

---

## 6. Python SDK (Architecture)

**Planned package:** `omnimind-python` (backend mirror exists: `backend/sdk/automation_client.py`)

```python
from omnimind import Client

client = Client(api_key=os.environ["OMNIMIND_API_KEY"])

# REST
result = client.ai.complete(prompt="Analyze dataset", tool="business-analytics")
client.jobs.submit("video-render", {"assetId": "..."})

# Webhook server
@client.webhook("deployment.finished")
def on_deploy(event):
    print(event["projectId"])
```

| Surface | Endpoint |
|---------|----------|
| AI | `POST /api/v1/omnicore/ai/complete` |
| Workspaces | `PUT /api/v1/omnicore/workspaces/{id}` |
| Plugins | `GET /api/v1/omnicore/plugins` |
| Automation | Webhook ingress + `automation_client` |

---

## 7. Go SDK (Architecture)

```go
client := omnimind.NewClient(omnimind.WithAPIKey(os.Getenv("OMNIMIND_API_KEY")))
resp, err := client.AI.Complete(ctx, omnimind.CompleteRequest{
    Prompt: "Scaffold API",
    ToolID: "omniforge-engine",
})
```

Idiomatic client; same REST surface as Python.

---

## 8. Java / C# SDK (Architecture)

Enterprise JVM and .NET clients for:

- Org workspace automation
- CI/CD deploy hooks
- Medical enterprise connectors (HIPAA BAA customers)

Generated from OpenAPI spec (`/api/v1/openapi.json` — planned export from FastAPI).

---

## 9. REST API

**Base:** `/api/v1/omnicore/*` and `/api/v1/auth/*`

| Domain | Key routes |
|--------|--------------|
| Auth | `POST /auth/login`, `POST /auth/refresh` |
| AI | `POST /omnicore/ai/complete` |
| Workspaces | `GET/PUT /omnicore/workspaces/{id}` |
| Plugins | `/omnicore/plugins` |
| Security | `/omnicore/security/authorize` |
| Assets | `/omnicore/assets` |
| Mission Control | `/omnicore/mission-control` |

**Auth:** `Authorization: Bearer {jwt}` or `X-OmniMind-Api-Key: {org_api_key}`

**Versioning:** URL prefix `/api/v1` — breaking changes increment major.

---

## 10. GraphQL (Architecture)

**Planned endpoint:** `/api/v1/graphql`

| Use case | Why GraphQL |
|----------|-------------|
| Marketplace catalog | Nested listings + reviews |
| Org admin | Members + workspaces + billing in one query |
| Mission Control | Federated agent + job + log queries |

REST remains for simple SDK clients; GraphQL for dashboard apps.

---

## 11. Webhooks

### Outbound (OmniMind → your server)

| Event | Payload |
|-------|---------|
| `deployment.finished` | `{ projectId, url, success }` |
| `task.completed` | `{ jobId, status, result }` |
| `plugin.installed` | `{ pluginId, orgId }` |
| `file.generated` | `{ assetId, kind, toolSlug }` |

Register URL in org settings or automation workflow trigger.

### Inbound (your server → OmniMind)

```
POST /api/v1/webhooks/{orgId}/{hookId}
  Headers: X-OmniMind-Signature: sha256=...
  Body: automation payload
```

**Source:** `backend/routers/webhooks.py`

SDK automation client:

```typescript
// sdk/automation/index.ts
subscribe(triggerId, handler)
emit(triggerId, payload)
```

---

## 12. SDK Registration Targets

When `autoRegister: true`, module registers to:

| Target | Effect |
|--------|--------|
| `brain` | Agent Router discovery |
| `memory` | Memory Engine scope |
| `actions` | Tool actions |
| `theme` | Theme extensions |
| `plugins` | PluginManager |
| `marketplace` | Developer listing draft |
| `permissions` | Permission declarations |
| `command-palette` | Commands |
| `global-search` | Search index |
| `workspace` | Tab/panel registration |
| `navigation` | Sidebar entry |

---

## 13. Security Requirements

| Requirement | SDK behavior |
|-------------|--------------|
| Manifest signature | Recommended for publish |
| Permissions declared | Enforced at runtime |
| No secret in client | Use server proxy |
| `api.auth.requestPermission()` | User grant for sensitive scopes |
| Medical modules | `medical-tool` template + HIPAA checklist |

See [SECRET_VAULT](../security/SECRET_VAULT.md) and [PLUGIN_ENGINE](./PLUGIN_ENGINE.md).

---

## 14. Testing

```typescript
import { getSDKMocks } from "@omnimind/sdk/browser/testing";

const mocks = getSDKMocks();
mocks.ai.complete.mockResolvedValue({ text: "test" });
```

**Doctor + verify** for CI:

```bash
omnimind doctor && omnimind verify omnimind.manifest.json
```

---

## 15. Protected Systems

SDK modules integrate with OmniForge and Architectural Designer via:

- Public manifest + `tool-access` permission
- `omnimind:ecosystem-agent-prompt` events
- Scaffold API (`/api/v1/build-engine/omniforge/*`)

**Never** import protected engine source paths from SDK templates.

---

## 16. Migration & Compatibility

| Legacy | SDK 12 |
|--------|--------|
| Direct `getOmniPluginManager()` | `api.registerModule()` preferred |
| Custom DOM events | `api.events` + `omniEventBus` |
| `sdk/cli` | `sdk/node/cli` |
| Medical Enterprise SDK | `medical-tool` template + governance bridge |

Existing `window.OmniMindSDK` consumers continue working.

---

## 17. Quick Start

```bash
# 1. Scaffold
npx tsx frontend/sdk/node/cli/index.ts create plugin hello-world

# 2. Verify
npx tsx frontend/sdk/node/cli/index.ts verify generated/hello-world/omnimind.manifest.json

# 3. Implement src/index.ts — call getUniversalAPI()

# 4. Publish (when ready)
npx tsx frontend/sdk/node/cli/index.ts publish
```

---

## Related Documents

- [PLUGIN_ENGINE.md](./PLUGIN_ENGINE.md)
- [PLUGIN_API.md](./PLUGIN_API.md)
- [CLI.md](./CLI.md)
- [MARKETPLACE.md](./MARKETPLACE.md)
- [../omnipilot/OMNIPILOT_ARCHITECTURE.md](../omnipilot/OMNIPILOT_ARCHITECTURE.md)
