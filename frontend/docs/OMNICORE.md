# OmniCore Platform — Unified OS Foundation

## Release Candidate 1 — Unified Ecosystem (v1.0.0-rc1)

OmniMind RC1 connects every tool through **one brain**, **one search**, and **one command palette**.

### Unified Brain

```typescript
import { omniCore } from "@/core/omnicore";

omniCore.brain.boot();
await omniCore.brain.complete("Hello", { toolSlug: "visionary-studio" });
omniCore.brain.remember("long-term", "brandColor", "#00FF87");
```

### Project Hub & Cloud Sync

```typescript
omniCore.projectHub.open("proj-omniforge-001", "omniforge-engine");
await omniCore.platformSync.syncAll();
```

### OS Search & Commands

- **Ctrl+Shift+P** / **Ctrl+K** — Command Palette (natural language: `ask …`, `>`)
- **Ctrl+P** — Search everywhere (files + chats + plugins + APIs)
- See `docs/KEYBOARD_SHORTCUTS.md`

### Docs

`docs/OMNIMIND_RELEASE_NOTES.md` · `VERSION_1.0.md` · `SYSTEM_ARCHITECTURE.md` · `AI_BRAIN_DOCUMENTATION.md` · `ENTERPRISE_SCORE.md`

---

## Phase 8 — Production Infrastructure + DevOps (Sprint 5)

OmniCore Infra is the deployment, observability, cache, storage, and worker platform layer.

### Infra Core (`backend/lib/infra/`)

| Module | Role |
|--------|------|
| `environment.py` | `OMNIMIND_ENV` tier resolution |
| `cache_layers.py` | Named Redis caches (API, prompt, session, file, image) |
| `storage_backend.py` | Local / S3 / CDN abstraction |
| `observability.py` | Prometheus text metrics |
| `queue_worker.py` | Redis queue consumer (AI, video, email, notification) |

### API (`/api/v1/omnicore/infra`)

- `GET /health` · `GET /deployment` · `GET /metrics` · `GET /metrics/prometheus`
- `GET /cache/layers` · `GET /storage` · `GET /queues`

### Deployment

```bash
docker compose -f docker-compose.prod.yml up -d --build
kubectl apply -f infra/k8s/production.yaml
```

### Docs

`docs/DEPLOYMENT_GUIDE.md` · `DEVOPS_GUIDE.md` · `KUBERNETES_GUIDE.md` · `SCALABILITY_REPORT.md` · `BACKUP_PLAN.md` · `INFRASTRUCTURE_REPORT.md` · `PRODUCTION_SCORE.md`

---

## Phase 7 — Quality Assurance + Reliability (Sprint 4)

OmniCore Quality is the platform-wide QA, observability, health monitoring, and error reporting layer.

### Quality Core (`frontend/core/quality/`)

| Module | Role |
|--------|------|
| `OmniQuality.ts` | Platform facade — boot, health probes, snapshot |
| `OmniErrorReporter.ts` | Crash logging and recovery tracking |
| `OmniObservability.ts` | Counters, latency p95, memory metrics |
| `OmniHealthMonitor.ts` | Service health registry + endpoint probes |
| `OmniAIValidator.ts` | Prompt, memory, conversation, provider validation |
| `OmniTestCatalog.ts` | Test suite registry and pass-rate |

### QA Lib (`frontend/lib/qa/`)

| Module | Role |
|--------|------|
| `api-error-handler.ts` | `ApiError` taxonomy + retry classification |
| `crash-logger.ts` | Client crash buffer (sessionStorage, no secrets) |
| `contract-validator.ts` | API contract validation scaffold |

### Error Handling (no UI change)

- `ClientErrorBoundary` at app root — same reload fallback UI
- `http-client.ts` throws `ApiError`; retries retryable errors only
- `omniCore.quality.errors` tracks crash history

### Usage

```typescript
import { omniQuality } from "@/core/quality";

await omniCore.quality.runHealthProbes();
const snap = omniCore.quality.snapshot();
omniCore.quality.aiValidator.runAll();
```

### Tests

```bash
npm run test              # frontend + backend (19 tests)
npm run test:coverage --prefix frontend
```

| Suite | Location |
|-------|----------|
| Unit | `frontend/tests/unit/` |
| Integration | `frontend/tests/integration/` |
| Security | `frontend/tests/security/` |
| Smoke | `frontend/tests/smoke/` |
| API | `backend/tests/test_api_smoke.py` |

### Backend (`/api/v1/omnicore/quality`)

- `GET /health` · `GET /dashboard` · `GET /metrics` · `GET /env/validate`

### Docs

`docs/TEST_REPORT.md` · `COVERAGE_REPORT.md` · `RELIABILITY_REPORT.md` · `ERROR_REPORT.md` · `QUALITY_SCORE.md` · `BUG_REPORT.md`

---

## Phase 6 — Enterprise Security + Zero Trust (Sprint 3)

OmniCore Security is the platform-wide authentication, authorization, and zero-trust layer.

### Security Core (`frontend/core/security/`)

| Module | Role |
|--------|------|
| `OmniSecurity.ts` | Platform facade |
| `OmniAuthEngine.ts` | Email, passkey, OAuth, SAML/OIDC |
| `OmniSessionRegistry.ts` | Multi-device sessions |
| `OmniTrustedDeviceManager.ts` | Device trust |
| `OmniAuthorizationEngine.ts` | Platform RBAC |
| `OmniABACEngine.ts` | Attribute-based access |
| `OmniZeroTrustEngine.ts` | Validate every request |
| `OmniSecretManager.ts` | Server-only secret references |
| `OmniAPIProtection.ts` | CSRF, rate limit, idempotency |
| `OmniDataProtection.ts` | PII classification, retention |
| `OmniPluginSecurityGate.ts` | Plugin signing + sandbox |
| `OmniSecurityMonitor.ts` | Threat dashboard data |
| `OmniComplianceCenter.ts` | SOC2/ISO/HIPAA/GDPR/CCPA map |

### Usage

```typescript
import { useOmniCore } from "@/lib/omnicore";
import { omniSecurity } from "@/core/security";

const { authorizeAction, securitySnapshot } = useOmniCore();
omniCore.security.authorize({ userId: "u1", orgId: "org-1" }, "tool:execute");
```

### Backend (`/api/v1/omnicore/security`)

- `GET /dashboard` · `GET /events`
- `POST /authorize` · `GET /compliance`
- `GET /auth/providers` · `POST /auth/passkey/challenge`
- `GET /env/validate`

### Docs

`docs/SECURITY_REPORT.md` · `THREAT_MODEL.md` · `AUTH_ARCHITECTURE.md` · `PERMISSION_MATRIX.md`

---

## Phase 5 — Enterprise Collaboration + Admin Platform + Organization Management

OmniCore Collaboration is the shared enterprise layer for organizations, teams, permissions, realtime presence, comments, reviews, activity, audit, security, and billing across every OmniMind application.

### Collaboration Core (`frontend/core/collaboration/`)

| Module | Role |
|--------|------|
| `OmniCollaboration.ts` | Platform facade |
| `OmniOrganization.ts` | Multi-tenant organizations, departments, members |
| `OmniWorkspace.ts` | Enterprise org workspaces (distinct from layout presets) |
| `OmniTeamManager.ts` | Teams and project assignments |
| `OmniRoleManager.ts` | Built-in + custom roles |
| `OmniPermissionEngine.ts` | Granular permission validation |
| `OmniPresence.ts` | Online status, typing, cursor presence |
| `OmniRealtimeHub.ts` | Shared sessions, live editing, conflict resolution |
| `OmniComments.ts` | Inline, file, asset, timeline comment threads |
| `OmniReviewCenter.ts` | Review requests and approvals |
| `OmniActivityTimeline.ts` | Searchable project, asset, system, AI events |
| `OmniNotificationCenter.ts` | Enterprise notifications (`omniCollabNotificationCenter`) |
| `OmniAuditCenter.ts` | Immutable audit log storage |
| `OmniAdminConsole.ts` | Organization dashboard, user/workspace admin |
| `OmniSecurityCenter.ts` | Session, MFA, IP restrictions, encryption hooks |
| `OmniAPIKeyManager.ts` | Scoped API key lifecycle |
| `OmniEnterpriseSettings.ts` | SSO placeholders, retention policies |
| `OmniInviteManager.ts` | Member invitations |
| `OmniBillingArchitecture.ts` | Seats, storage quotas, license management |

### Roles

`owner` · `administrator` · `manager` · `editor` · `reviewer` · `viewer` · `guest` · `custom`

### Usage

```typescript
import { useOmniCore } from "@/lib/omnicore";
import { omniCollaboration } from "@/core/collaboration";

const { switchOrganization, inviteMember, checkPermission } = useOmniCore();
switchOrganization("org-1");
await inviteMember("dev@company.io", "editor");

omniCollaboration.realtime.joinSession("uproj-001", "project", "user-1");
omniCollaboration.comments.create("file", "asset-1", "user-1", "Looks great!");
```

### Backend (`/api/v1/omnicore/collaboration`)

- `GET/PUT /organizations` — organization registry
- `GET /organizations/{orgId}/members` · `/workspaces`
- `POST /invites` — member invitations
- `GET /activity/{orgId}` · `GET /audit/{orgId}`
- `POST /permissions/check` — permission validation
- `GET /notifications/{userId}` · `GET /admin/{orgId}/dashboard`

---

## Phase 4 — Plugin SDK + Extension Platform + Developer Ecosystem

OmniCore Extension Platform lives at `frontend/core/plugins/omnicore-platform/` — separate from the legacy universal plugin system in `core/plugins/` (unchanged).

### Extension Platform modules

| Module | Role |
|--------|------|
| `OmniPluginEngine.ts` | Platform orchestrator facade |
| `OmniPluginRegistry.ts` | Installed + marketplace plugin registry |
| `OmniPluginManager.ts` | Enable/disable/configure lifecycle |
| `OmniPluginLoader.ts` | Load with permission checks |
| `OmniPluginSandbox.ts` | Isolated execution context |
| `OmniPluginPermissions.ts` | Granular permissions (filesystem, AI, assets, …) |
| `OmniPluginMarketplace.ts` | Browse, install, reviews, categories |
| `OmniExtensionAPI.ts` | Commands, panels, tools, hooks |
| `OmniThemeSDK.ts` | Theme extension SDK |
| `OmniAutomationSDK.ts` | Workflow automation SDK |
| `OmniDeveloperPortal.ts` | Developer profiles + publish |
| `OmniPackageManager.ts` | Dependencies, signatures, compatibility |
| `OmniPluginInstaller.ts` / `OmniPluginUpdater.ts` | Install, update, rollback |
| `OmniPluginDiagnostics.ts` | Logs + analytics |

### Usage

```typescript
import { useOmniCore } from "@/lib/omnicore";
import { omniPluginEngine } from "@/core/plugins/omnicore-platform";

const { installExtension, browseMarketplace } = useOmniCore();
await installExtension("ext-theme-dark-pro");

omniPluginEngine.api.registerCommand({ id: "my-cmd", pluginId: "ext-1", label: "Run", shortcut: null });
```

### Backend (`/api/v1/omnicore/plugins`)

- `GET/PUT /registry` — plugin registry
- `GET /marketplace` — marketplace + developers
- `POST /install` · `POST /uninstall`
- `GET /analytics/{pluginId}` · `GET/POST /versions`

---

## Phase 3 — Universal Asset Platform + Project System + Storage Engine

OmniCore Assets is the shared project, asset, and storage layer for every OmniMind application.

### Assets Core (`frontend/core/assets/`)

| Module | Role |
|--------|------|
| `OmniAssets.ts` | Platform facade |
| `OmniProjectEngine.ts` | Universal/cross-tool projects, templates, archive, snapshots |
| `OmniAssetManager.ts` | Images, video, audio, 3D, docs, code, datasets, reports, AI outputs |
| `OmniWorkspaceStorage.ts` / `OmniLocalStorage.ts` | Workspace + local persistence |
| `OmniCloudSync.ts` | Cloud sync, offline, conflicts, sync queue |
| `OmniVersionControl.ts` | Version history, branches, activity timeline |
| `OmniFileExplorer.ts` | Tree/grid/list, smart folders, drag-drop architecture |
| `OmniMediaLibrary.ts` | Media browsing by kind |
| `OmniAssetIndexer.ts` / `OmniSearchIndex.ts` | Metadata index + AI search hooks |
| `OmniPreviewEngine.ts` | Asset previews |
| `OmniImportExport.ts` | Bulk import/export, ZIP, templates |
| `OmniBackupManager.ts` / `OmniRecoveryManager.ts` | Backup + restore wizard |
| `OmniRecentManager.ts` / `OmniFavorites.ts` / `OmniCollections.ts` | Recent, favorites, collections |

### Usage

```typescript
import { useOmniCore } from "@/lib/omnicore";
import { omniAssets } from "@/core/assets";

const { assetSearch, createProjectFromTemplate, toggleAssetFavorite } = useOmniCore();
createProjectFromTemplate("tpl-cross-media", "My Campaign");
const results = assetSearch("banner", { kind: "image" });

// Direct core:
omniAssets.assets.register({ name: "clip.wav", kind: "audio", ... });
```

### Backend (`/api/v1/omnicore/assets`)

- `GET/PUT/POST /projects` — project database
- `GET/POST /assets` — asset database
- `GET /search` · `PUT /search/index` — search index
- `GET/POST /versions` — version storage
- `GET/POST /backups` — backup storage

---

## Phase 2 — Universal AI Platform + Agent Framework + Model Router

OmniCore AI is the **only AI gateway** for OmniMind applications. No tool should call providers directly — route through `omniCore.ai.complete()` or `useOmniCore().aiComplete()`.

### AI Core (`frontend/core/ai/`)

| Module | Role |
|--------|------|
| `OmniAI.ts` | Universal AI gateway facade |
| `OmniModelRouter.ts` | Provider-independent routing + fallback |
| `OmniProviderRegistry.ts` | OpenAI, Google, Anthropic, OpenRouter, LM Studio, Ollama, Azure, Bedrock, Local |
| `OmniModelManager.ts` | Model catalog |
| `OmniAgentRegistry.ts` | Pluggable agent registry (Forge, Medical, Visionary, Music, …) |
| `OmniAgentManager.ts` | Active agent sessions |
| `OmniPromptEngine.ts` / `OmniPromptLibrary.ts` | Templates, variables, validation |
| `OmniMemory.ts` | Session, project, long-term memory architecture |
| `OmniContextEngine.ts` | Tool + workspace context assembly |
| `OmniConversationManager.ts` | Conversation storage |
| `OmniReasoningPipeline.ts` | Multi-step reasoning |
| `OmniTaskPlanner.ts` | Task decomposition + dependencies |
| `OmniWorkflowEngine.ts` | Sequential / parallel / conditional workflows |
| `OmniInferenceQueue.ts` | Job queue with priority |
| `OmniResponseFormatter.ts` | Normalized responses |
| `OmniTokenManager.ts` / `OmniCostMonitor.ts` | Tokens + cost monitoring |
| `OmniSafetyEngine.ts` | Permissions, rate limits, audit log |

### Usage

```typescript
import { useOmniCore } from "@/lib/omnicore";
import { omniAI } from "@/core/ai";

// All tools must use the gateway:
const { aiComplete, selectAgent } = useOmniCore();
selectAgent("music-agent");
const result = await aiComplete("Suggest a chord progression", { toolSlug: "omnimusic" });

// Or direct core (non-React):
await omniAI.complete("Hello", { agentId: "developer-agent", toolSlug: "omniforge-engine" });
```

### Backend (`/api/v1/omnicore/ai`)

- `GET/PUT /agents` · `POST /agents` — agent registry
- `GET /providers` — provider status
- `GET/POST /prompts` — prompt database
- `POST /complete` — AI gateway
- `GET/PUT /conversations` — conversation storage
- `GET/PUT /memory` — memory storage
- `GET/POST /workflows` · `GET/POST /tasks` — workflow + task queue
- `GET /gateway/status` — monitoring dashboard data

---

## Phase 1 — Shared platform layer

OmniCore is the cross-application foundation for OmniMind OS. It does **not** replace or modify OmniForge, Visionary Studio, OmniMusic, Medical Diagnostic, or the SDK. Tools opt in via `useOmniCore()` / `omniCore` facade.

### Core (`frontend/core/omnicore/`)

| Module | Role |
|--------|------|
| `OmniCore.ts` | Platform facade — boots all services |
| `OmniProjectManager.ts` | Universal / cross-tool / pinned projects |
| `OmniWorkspaceManager.ts` | Workspace presets per tool |
| `OmniWindowManager.ts` | Floating windows |
| `OmniLayoutManager.ts` | Split layouts, saved presets |
| `OmniDockManager.ts` | Dockable panel regions |
| `OmniStateManager.ts` | Global + per-tool state slices |
| `OmniEventBus.ts` | Typed cross-tool events |
| `OmniNotificationCenter.ts` | Platform notifications |
| `OmniCommandPalette.ts` | Command registry |
| `OmniGlobalSearch.ts` | Unified search index |
| `OmniRecentItems.ts` | Recent projects, files, tools |
| `OmniClipboard.ts` | Cross-tool clipboard history |
| `OmniShortcutManager.ts` | Shortcuts + conflict detection |
| `OmniUndoRedo.ts` | Global / per-tool undo stacks |
| `OmniThemeEngine.ts` | Platform theme tokens |
| `OmniSettings.ts` | Global / tool / workspace settings |
| `OmniLocalization.ts` | i18n strings |
| `OmniAccessibility.ts` | A11y preferences |
| `OmniSessionManager.ts` | Session + active tool/project |
| `OmniUpdateManager.ts` | Update channel checks |

### Lib (`frontend/lib/omnicore/`)

- `omnicore-api.ts` — `/api/v1/omnicore`
- `use-omnicore-bridge.ts` — React bridge
- `omnicore-context.tsx` — `OmniCoreProvider` (wired in `app/providers.tsx`)

### Usage (opt-in, no UI changes required)

```typescript
import { useOmniCore } from "@/lib/omnicore";
import { omniCore } from "@/core/omnicore";

// In a tool module:
const { openProject, searchResults, core } = useOmniCore();
core.eventBus.subscribe("project:opened", (p) => { /* ... */ });
```

### Backend (`/api/v1/omnicore`)

- `GET/PUT /projects` — shared project database
- `PUT/GET /workspaces/{projectId}` — workspace persistence
- `GET /search` — global search index
- `PUT /settings` — settings storage
- `PUT /sessions` — session storage
- `GET/PUT /recent` — recent items

### Integration rules

- Extend via composition — do not modify flagship tool UIs
- Use `OmniEventBus` for loose coupling between tools
- Persist through `omnicoreApi` when backend sync is needed
- `useOmniCoreOptional()` for gradual adoption without provider errors
