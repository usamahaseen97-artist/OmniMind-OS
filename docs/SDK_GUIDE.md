# OmniMind SDK Guide — 1.0.0-rc1

---

## Packages

| Package | Path | Runtime |
|---------|------|---------|
| Browser SDK | `frontend/sdk/browser/` | Next.js client |
| Node SDK | `frontend/sdk/node/` | CLI, automation |
| Shared types | `frontend/sdk/shared/` | Isomorphic |

---

## CLI Commands

```bash
cd frontend
npm run sdk:doctor      # Environment check
npm run sdk:create      # Scaffold plugin/project
npm run omnimind -- help
```

| Command | Status |
|---------|--------|
| `doctor` | ✅ |
| `create` | ✅ |
| `build` | ✅ |
| `deploy` | Stub → use Sprint 5 Docker/K8s |
| `publish` | Stub → marketplace API |

---

## Browser SDK

```typescript
import { DeploymentSDK } from "@omnimind/sdk/browser";

// API integration (existing)
await DeploymentSDK.deploy({ target: "docker" });
```

Routes to `/api/v1/build-engine/omniforge/deploy` — use production infra for real deploys.

---

## OmniCore Integration (RC1)

```typescript
import { omniCore } from "@/core/omnicore";

// SDK agents use unified brain
await omniCore.brain.complete("Scaffold REST API", { toolSlug: "omniforge-engine" });

// Plugin registration
omniCore.plugins.registry.register({ ... });
```

---

## Documentation

- Architecture: `frontend/docs/SDK_ARCHITECTURE.md`
- Plugins: `docs/PLUGIN_GUIDE.md`
- Deploy: `docs/DEPLOYMENT_GUIDE.md`

---

## Versioning

SDK version tracks OmniCore `1.0.0-rc1`. Pin `minCoreVersion` in plugin manifests.
