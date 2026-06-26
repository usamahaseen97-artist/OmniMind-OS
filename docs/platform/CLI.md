# OmniMind CLI Architecture

**Parent:** [SDK_GUIDE.md](./SDK_GUIDE.md)

---

## 1. Purpose

The **OmniMind CLI** enables developers to scaffold modules, verify manifests, build, deploy, publish to the Marketplace, and diagnose platform health — from terminal and CI/CD pipelines.

**Entry point:** `frontend/sdk/node/cli/index.ts`  
**Version:** SDK `12.0.0`  
**Invocation:** `npx tsx sdk/node/cli/index.ts <command>` (or packaged `omnimind` bin in future npm release)

---

## 2. Architecture

```mermaid
flowchart LR
  subgraph cli [OmniMind CLI]
    IDX[node/cli/index.ts]
    CMD[commands/index.ts]
  end

  subgraph libs [Libraries]
    SCAFF[generators/scaffold]
    VAL[shared/validation]
    DOC[docs/DocGenerator]
    NODE[OmniMindNodeSDK]
  end

  subgraph platform [Platform]
    API[/api/v1/auth]
    MPL[Marketplace publish API]
    CLOUD[OmniCloud sync]
  end

  IDX --> CMD
  CMD --> libs
  CMD --> platform
```

| Layer | Path |
|-------|------|
| CLI router | `sdk/node/cli/index.ts` |
| Commands | `sdk/node/cli/commands/index.ts` |
| Node SDK | `sdk/node/OmniMindSDK.ts` |
| Legacy re-export | `sdk/cli/index.ts` → deprecated, points to node |

---

## 3. Command Reference

### Implemented today

| Command | Syntax | Description |
|---------|--------|-------------|
| **create** | `omnimind create <kind> <name> [--template=]` | Scaffold tool/plugin/agent/workflow/extension |
| **doctor** | `omnimind doctor` | Platform health checks |
| **build** | `omnimind build [dir]` | Build project |
| **deploy** | `omnimind deploy [target]` | Deploy to target (default `production`) |
| **publish** | `omnimind publish` | Queue marketplace publish |
| **update** | `omnimind update` | SDK version check |
| **verify** | `omnimind verify [manifest.json]` | Validate `omnimind.manifest.json` |
| **templates** | `omnimind templates` | List generator templates |

**Create kinds:** `tool` | `plugin` | `ai-agent` | `workflow` | `extension`

**Templates:** `medical-tool`, `music-tool`, `video-tool`, `image-tool`, `business-tool`, `finance-tool`, `developer-tool`, `research-tool`, `productivity-tool`, `game-tool`, `enterprise-dashboard`, `chat-module`, `analytics-module`, `generic-tool`

### Enterprise command catalog (specification)

| Command | Syntax | Maps to |
|---------|--------|---------|
| **create** | `omnimind create tool my-app` | `writeScaffold()` |
| **run** | `omnimind run [--tool <slug>]` | Dev server / tool preview |
| **deploy** | `omnimind deploy [production\|staging]` | `runDeploy()` + WorkflowEngine |
| **plugin install** | `omnimind plugin install <id>` | Marketplace install API |
| **plugin uninstall** | `omnimind plugin uninstall <id>` | MarketplaceLifecycle.remove |
| **doctor** | `omnimind doctor` | `runDoctor()` |
| **login** | `omnimind login` | `POST /api/v1/auth/login` → token file |
| **cloud sync** | `omnimind cloud sync` | OmniCloudSyncEngine |
| **verify** | `omnimind verify` | Manifest + signature check |

---

## 4. Doctor Checks

**Source:** `runDoctor()` in `commands/index.ts`

| Check | Validates |
|-------|-----------|
| Node.js | Runtime present |
| SDK Version | `12.0.0` |
| TypeScript | tsx available |
| SDK Package | `sdk/browser/index.ts` |
| Node SDK | `sdk/node/index.ts` |
| Core Plugins | `core/plugins/PluginManager.ts` |
| Design System | `design-system/index.ts` |
| Brain | `core/brain/OmniMindBrain.ts` |

Exit code `0` if all pass; `1` otherwise — suitable for CI.

---

## 5. Scaffold Output

```
omnimind create plugin my-extension
  → generated/my-extension/
      omnimind.manifest.json
      src/index.ts
      README.md
      (template-specific files)
  → manifest.id, autoRegister: true
```

**Generator:** `scaffoldProject()` in `sdk/node/generators/scaffold.ts`  
**Default manifest:** `defaultManifest()` with `minOmniVersion`, capabilities, permissions.

---

## 6. Authentication (CLI)

**Specification for `omnimind login`:**

```
omnimind login [--email] [--sso <orgId>]
  → prompt for credentials or open browser OAuth
  → POST /api/v1/auth/login
  → store token in ~/.omnimind/credentials (chmod 600)
  → never log token value

Subsequent commands:
  Authorization: Bearer {token}
```

**Sovereign operator:** `POST /api/v1/auth/session` for automation CI with env credentials.

---

## 7. Plugin Install (CLI)

```
omnimind plugin install ext-ai-assistant-plus
  → resolve listing from marketplace catalog API
  → MarketplaceSecurity.scan
  → download signed bundle
  → OmniPluginManager.install(manifest)
  → output: ✓ Installed v2.1.0

omnimind plugin list
omnimind plugin enable|disable <id>
```

Uses same pipeline as UI Marketplace — no separate install path.

---

## 8. Cloud Sync (CLI)

```
omnimind cloud sync [--domain assets|settings|ai-memory]
  → read ~/.omnimind/credentials
  → OmniCloudSyncEngine.syncDomain(domain)
  → progress on stdout
```

Aligns with `omnimind cloud sync` user requirement and `OmniPlatformSync`.

---

## 9. CI/CD Integration

```yaml
# Example GitHub Actions
- run: npx tsx frontend/sdk/node/cli/index.ts doctor
- run: npx tsx frontend/sdk/node/cli/index.ts verify
- run: npx tsx frontend/sdk/node/cli/index.ts build
- run: npx tsx frontend/sdk/node/cli/index.ts deploy staging
  env:
    OMNIMIND_API_TOKEN: ${{ secrets.OMNIMIND_TOKEN }}
```

---

## 10. Packaging Roadmap

| Phase | Deliverable |
|-------|-------------|
| 1 | tsx invocation (current) |
| 2 | npm package `@omnimind/cli` with `bin: { omnimind }` |
| 3 | `omnimind login` + credential store |
| 4 | `omnimind run` dev orchestrator |
| 5 | `omnimind plugin *` full lifecycle |
| 6 | Shell completions (bash, zsh, fish) |

---

## 11. Backward Compatibility

- `sdk/cli/` deprecated re-export — no breaking removal until v13
- Generated projects include `minOmniVersion: "12.0.0"`
- CLI does not modify protected OmniForge / Designer cores

---

## Related Documents

- [SDK_GUIDE.md](./SDK_GUIDE.md)
- [PLUGIN_ENGINE.md](./PLUGIN_ENGINE.md)
- [MARKETPLACE.md](./MARKETPLACE.md)
