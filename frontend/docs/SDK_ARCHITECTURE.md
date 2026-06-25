# OmniMind V12 — Official SDK Architecture

The OmniMind SDK (`frontend/sdk/`) is the **official foundation** for building enterprise AI tools that automatically integrate with Brain, Memory, Plugin Framework, Marketplace, and Design System.

**Extends only** — does not replace `core/`, `design-system/`, or `marketplace/`.

---

## 1. Package Structure (Three Layers)

The SDK is split so **Node-only code never enters the Next.js client bundle**.

```
frontend/sdk/
├── shared/                  # Layer 1 — browser + server safe
│   ├── types.ts             # Manifest, lifecycle, verify types
│   ├── validation.ts        # Semver, verifyManifest
│   └── events/types.ts      # Event map contracts
├── browser/                 # Layer 2 — React, providers, client APIs
│   ├── index.ts             # @omnimind/sdk/browser
│   ├── OmniMindSDK.ts       # register(), verify()
│   ├── api/UniversalAPI.ts
│   ├── packages/            # AI, Memory, Brain, Plugin, …
│   ├── events/SDKEventBus.ts
│   ├── lifecycle/
│   ├── registration/
│   └── testing/mocks.ts
├── node/                    # Layer 3 — CLI, generators, fs (Node only)
│   ├── index.ts             # @omnimind/sdk/node
│   ├── cli/                 # omnimind doctor, create, build, …
│   ├── generators/scaffold.ts
│   ├── docs/DocGenerator.ts
│   └── OmniMindSDK.ts       # extends browser + scaffold, docs, doctor
└── index.ts                 # Re-exports browser (default @omnimind/sdk)
```

**Import rules**

| Context | Import |
|---------|--------|
| React components, providers | `@omnimind/sdk/browser` or `@/sdk/browser` |
| CLI scripts (`tsx`) | `@omnimind/sdk/node` or `sdk/node/cli/index.ts` |
| Shared types / validation | `@omnimind/sdk/shared` |

Legacy paths (`sdk/cli`, `sdk/generators`, …) re-export from the correct layer but must not be imported from client code.

---

## 1b. Legacy Layout (re-exports)

---

## 2. Modular Packages

| Package | Class | Bridges to |
|---------|-------|------------|
| Core | `CoreSDK` | Platform version, events |
| UI | `UISDK` | `design-system/themes` |
| AI | `AISDK` | `OmniMindBrain.processRequest` |
| Memory | `MemorySDK` | `GlobalMemory` |
| Brain | `BrainSDK` | Brain 2.0, orchestrator |
| Plugin | `PluginSDKPackage` | `OmniPluginManager`, marketplace SDK |
| Voice | `VoiceSDK` | `VoiceBridge` |
| Auth | `AuthSDK` | `/api/v1/auth/me` |
| Storage | `StorageSDK` | localStorage namespaced |
| Database | `DatabaseSDK` | Backend API |
| Networking | `NetworkingSDK` | `backend-url`, gateway |
| Deployment | `DeploymentSDK` | build-engine deploy |
| Security | `SecuritySDK` | `PermissionRegistry` |
| Analytics | `AnalyticsSDK` | Marketplace analytics |
| DevTools | `DevToolsSDK` | doctor, verify |
| Testing | `TestingSDK` | Mock factories |

---

## 3. Automatic Registration

When `autoRegister: true` in manifest, `AutoRegistration.register()` wires:

| Target | Action |
|--------|--------|
| Brain | `globalMemory.pinNote`, tool history |
| Memory | `rememberTool` |
| Plugins | `OmniPluginManager.install` via marketplace SDK |
| Marketplace | Analytics download event |
| Theme | `designSystem: true` flag |
| Permissions | Plugin permission registry |
| Actions | Plugin action registry |
| Analytics | Marketplace metrics |
| Notifications | `omnimind:notification` event |
| Search | `omnimind:search-index` event |
| Command Palette | SDK registered event |
| Workspace / Navigation / Global Search | Custom events |

No manual integration required.

---

## 4. Universal API

```typescript
import { getOmniMindSDK } from "@omnimind/sdk/browser";

const sdk = getOmniMindSDK();

// Register new tool
await sdk.register({
  id: "my-analytics",
  name: "My Analytics",
  version: "1.0.0",
  // ...
  autoRegister: true,
});

// Use APIs
await sdk.api.ai.chat("Analyze Q4 sales");
sdk.api.memory.pin("User prefers dark theme");
await sdk.api.plugin.install(manifest);
sdk.api.ui.applyTheme("grey-professional");
```

### Shorthand namespaces

- `sdk.api.chat()` — AI chat
- `sdk.api.stream()` — streaming response
- `sdk.api.permissions()` — security
- `sdk.api.workflow.complete()` — workflow events
- `sdk.api.notifications.emit()` — OS notifications
- `sdk.api.search.index()` — search index

---

## 5. Event System

### SDK events (`SDKEventBus`)

- `ToolLoaded`, `ProjectOpened`, `ChatStarted`
- `AgentFinished`, `DeploymentComplete`, `FileGenerated`
- `DatabaseUpdated`, `PluginInstalled`, `WorkflowCompleted`
- `ModuleStateChanged`, `SDKRegistered`

### Plugin bridge

Forwards to existing `core/plugins/EventBus` — no duplicate bus.

```typescript
import { getSDKEventBus } from "@/sdk";

const unsub = getSDKEventBus().subscribe("ToolLoaded", ({ moduleId, route }) => {
  console.log(moduleId, route);
});
```

---

## 6. Module Lifecycle

```
Initialize → Load → Ready → Active
                ↓
         Sleep / Pause / Resume
                ↓
         Shutdown → Destroy / Recovery
```

```typescript
const lifecycle = sdk.api.createLifecycle(manifest);
await lifecycle.boot(); // initialize → load → ready → active
```

---

## 7. CLI Reference

```bash
npm run omnimind -- <command>

# Create
npm run omnimind -- create tool my-medical-app --template=medical-tool
npm run omnimind -- create plugin my-extension
npm run omnimind -- create ai-agent research-bot
npm run omnimind -- create workflow deploy-pipeline
npm run omnimind -- create extension omniforge-helper

# Ops
npm run sdk:doctor
npm run omnimind -- verify
npm run omnimind -- build
npm run omnimind -- deploy production
npm run omnimind -- publish
npm run omnimind -- update
npm run omnimind -- templates
```

Output: `generated/<name>/` with enterprise folder structure.

---

## 8. Project Generators

| Template | Capabilities |
|----------|--------------|
| `medical-tool` | analyze-medical-image |
| `music-tool` | generate-music, voice |
| `video-tool` | generate-video, edit-video |
| `business-tool` | analyze-data, marketing |
| `finance-tool` | financial-analysis |
| `developer-tool` | generate-code, deploy |
| `enterprise-dashboard` | analyze-data |
| `chat-module` | voice-processing |
| `analytics-module` | analyze-data |
| ... | See `GENERATOR_TEMPLATES` |

### Generated structure

```
generated/my-tool/
├── frontend/
├── backend/
├── api/
├── ai/
├── database/
├── testing/
├── assets/
├── docs/
├── config/
├── deployment/
├── localization/
├── security/
├── plugins/
├── workflows/
├── sdk/entry.ts
├── omnimind.manifest.json
└── README.md
```

---

## 9. Testing SDK

```typescript
import { createMockSDK, mockAI, mockPlugins } from "@/sdk";

const mock = createMockSDK();
await mock.register({ id: "test", /* ... */ });
const reply = await mockAI.chat("hello");
```

Mocks: AI, database, memory, plugins, users.

---

## 10. Documentation Generator

```typescript
const docs = sdk.docs(manifest);
// docs.readme, docs.apiReference, docs.architecture,
// docs.deployment, docs.sdkReference, docs.examples, docs.migration
```

---

## 11. Security Model

- Permission validation via `SecuritySDK.requestPermission()`
- Digital signatures via marketplace `PluginSDKManifest.signature`
- Sandbox: marketplace `MarketplaceSecurity` (existing)
- Role-based auth via backend JWT (`AuthSDK`)
- Manifest verify before registration

---

## 12. Versioning

- SDK version: `12.0.0` (`SDK_VERSION`)
- Semantic versioning for modules
- `verifyManifest()` — compatibility checker
- `deprecationWarning()` — migration helpers
- `compareSemver()` — version comparison

---

## 13. Performance Strategy

| Strategy | Implementation |
|----------|----------------|
| Lazy loading | Dynamic imports in DevToolsSDK |
| Tree shaking | Modular package exports |
| Caching | StorageSDK, brain global memory |
| Streaming | AISDK.stream |
| Background workers | Brain scheduler (existing) |
| Parallel execution | Brain 2.0 distributed orchestrator |

---

## 14. Scalability Strategy

- Event-driven registration — no central bottleneck
- Plugin manifest reuse — one install path
- CLI scaffolds isolated under `generated/`
- Backend stubs per module — deploy independently
- Marketplace publish path for distribution

---

## 15. Developer Guide

### Create a new tool in 3 steps

1. **Scaffold**
   ```bash
   npm run omnimind -- create tool my-app --template=business-tool
   ```

2. **Register** (automatic on boot in generated `sdk/entry.ts`)
   ```typescript
   await getOmniMindSDK().register(manifest);
   ```

3. **Build**
   ```bash
   npm run omnimind -- verify
   npm run omnimind -- build
   ```

### TypeScript / IntelliSense

Import from `@/sdk` or `frontend/sdk` — full types exported.

### Runtime

`SDKBoot` in `app/providers.tsx` exposes `window.OmniMindSDK` for debugging.

---

## 16. Extension Model

```
Developer Tool
    ↓ manifest (omnimind.manifest.json)
OmniMindSDK.register()
    ↓
AutoRegistration
    ├→ PluginManager (capabilities, actions)
    ├→ GlobalMemory (brain, memory)
    ├→ Marketplace (analytics)
    ├→ Design System (theme flag)
    └→ SDKEventBus (notifications, search, navigation)
```

Existing sovereign tools remain registered via `core/plugins/register.ts`. New SDK tools use the same plugin manifest path.

---

## 17. API Reference (summary)

| API | Method | Description |
|-----|--------|-------------|
| `sdk.register` | `(manifest) => RegistrationResult` | Full auto-registration |
| `sdk.api.ai.chat` | `(text, ctx?) => BrainResult` | AI chat |
| `sdk.api.ai.stream` | `(text, onToken) =>` | Streaming |
| `sdk.api.memory.pin` | `(note) => void` | Pin to global memory |
| `sdk.api.plugin.install` | `(manifest) =>` | Install plugin |
| `sdk.api.plugin.execute` | `(ctx) =>` | Run action |
| `sdk.api.deployment.deploy` | `(target, config) =>` | Deploy |
| `sdk.api.networking.gatewayExecute` | `(tool, payload) =>` | Gateway |
| `sdk.scaffold` | `(name, kind, template?) =>` | Generate project |
| `sdk.verify` | `(manifest) => VerifyReport` | Validate manifest |
| `sdk.docs` | `(manifest) => DocSet` | Generate docs |

---

*OmniMind V12 SDK — minimal setup, maximum integration.*
