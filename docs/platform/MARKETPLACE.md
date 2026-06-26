# OmniMind Extension Marketplace Architecture

**Parent:** [PLUGIN_ENGINE.md](./PLUGIN_ENGINE.md)

---

## 1. Purpose

The **Extension Marketplace** is the distribution layer for plugins, themes, language packs, templates, and widgets. It integrates with enterprise security (signatures, sandbox), org billing, and cloud sync.

**Facades:**

| Module | Path |
|--------|------|
| `MarketplaceManager` | `frontend/core/marketplace/MarketplaceManager.ts` |
| `OmniPluginMarketplace` | `frontend/core/plugins/omnicore-platform/OmniPluginMarketplace.ts` |
| Route | `/marketplace` (App Shell) |

---

## 2. Architecture

```mermaid
flowchart TB
  subgraph ui [Marketplace UI]
    PAGE[/marketplace]
    HUB[OmniMindHubPanel]
  end

  subgraph mgr [MarketplaceManager]
    CAT[catalog]
    LIFE[lifecycle]
    SEC[security]
    SYNC[sync]
    ENT[enterprise store]
    ANAL[analytics]
  end

  subgraph install [Install Pipeline]
    SCAN[Security scan]
    PM[OmniPluginManager.install]
    ENG[OmniPluginEngine.installAndLoad]
  end

  subgraph cloud [Cloud]
    OC[OmniCloud sync]
    API[omnicore_plugins API]
  end

  ui --> mgr
  mgr --> SCAN
  SCAN --> PM
  SCAN --> ENG
  mgr --> cloud
```

---

## 3. Listing Model

**Source:** `frontend/core/marketplace/types.ts`

```typescript
interface MarketplaceListing {
  id: string;
  kind: MarketplaceItemKind;
  name: string;
  description: string;
  author: string;
  version: string;
  category: string;
  tags: string[];
  badges: MarketplaceBadge[];
  rating: number;
  downloads: number;
  compatibility: string;        // min platform version
  pricing: PricingModel;
  priceUsd?: number;
  enterpriseOnly?: boolean;
  privateOrgId?: string;        // org-private listings
  manifest?: OmniPluginManifest;
  signature?: string;
}
```

---

## 4. Categories

User-facing categories map to `MarketplaceItemKind` + `category` string:

| Category | `kind` | Examples |
|----------|--------|----------|
| **AI** | `ai_tool`, `ai_agent`, `model_provider`, `prompt_pack` | AI Assistant Plus, agent packs |
| **Development** | `plugin`, `developer_sdk`, `extension` | Linters, deploy connectors |
| **Medical** | `plugin`, `enterprise_connector` | Clinical workflows (HIPAA gated) |
| **Creative** | `plugin`, `template` | Visionary FX, music packs |
| **Business** | `plugin`, `workflow` | CRM connectors |
| **Productivity** | `widget`, `automation_pack` | Task widgets |
| **Analytics** | `plugin`, `template` | Dashboard packs |
| **Themes** | `theme` | Dark Pro, enterprise branding |
| **Language Packs** | `language_pack` | Syntax + LSP bundles |
| **Templates** | `template` | Project scaffolds, marketing templates |
| **Widgets** | `widget` | Home dashboard tiles |

**Seed data:** `MARKETPLACE_SEED` in `omnicore-platform/constants.ts`.

---

## 5. Install Pipeline

```
User clicks Install
  ↓
MarketplaceManager.installListing(listing)
  ↓
MarketplaceSecurity.scan(manifest):
  - signatureValid
  - vulnerabilities (terminal, deploy permissions)
  - dependencyIssues (loose version ranges)
  - maliciousPatterns
  ↓
If !scan.passed → reject
  ↓
MarketplaceLifecycle.install(manifest)
  → OmniPluginManager.install
  → pushVersion to omnimind_plugin_versions_v1
  ↓
sync.addInstalled(pluginId)
analytics.recordDownload(listingId, price)
plugins.events.publish("PluginInstalled", { pluginId, version })
notifyBrain(action, detail) → global memory
  ↓
omniPluginEngine.installAndLoad(pluginId) [optional immediate load]
```

---

## 6. Enterprise Store

**Source:** `getEnterpriseStoreManager()` in MarketplaceManager

| Feature | Behavior |
|---------|----------|
| Private org catalog | `privateOrgId` on listing — visible only to org members |
| Enterprise-only | `enterpriseOnly: true` — requires org plan `enterprise` |
| Approved publisher list | Org admin whitelist |
| Internal signature CA | Org-signed plugins bypass public marketplace |

---

## 7. Developer Portal

**Source:** `OmniDeveloperPortal` (platform) + `MarketplaceManager.getDeveloper()`

| Capability | API |
|------------|-----|
| Developer profile | `DeveloperProfile` |
| API keys | `generateApiKey(label)` → `omni_` prefix |
| Publish listing | CLI `omnimind publish` → marketplace queue |
| Analytics | Downloads, active users, crash rate |
| Reviews | `PluginReview` on platform types |

---

## 8. Pricing Models

`PricingModel`: `free` | `paid` | `subscription` | `one_time` | `enterprise` | `team`

| Model | Billing integration |
|-------|---------------------|
| Free | No gate |
| Paid / one_time | `OmniBillingArchitecture` + license key |
| Subscription | Recurring org charge |
| Enterprise | Sales-assisted; `enterpriseOnly` flag |
| Team | Per-seat within org |

**AI Credits:** Metered plugins declare `ai-models` permission; usage debits org credits.

---

## 9. Security & Compliance

| Control | Implementation |
|---------|----------------|
| Digital signature | `listing.signature` — required for `verified` badge |
| Sandbox | `MarketplaceSecurity.getSandboxLimits()` |
| Permission UI | `omnimind:marketplace-permission` |
| HIPAA plugins | Medical category + org policy + PHI classification |
| Audit | `plugin.install` in OmniAuditCenter |
| RBAC | `plugin:install` permission (Administrator+) |

---

## 10. Sync & Offline

**Source:** `MarketplaceSync`

```
syncToCloud():
  → installed plugin IDs + bookmarks + purchases
  → OmniCloud domain (planned: "marketplace")
  → omnimind:marketplace-synced event

Local state: MarketplaceSync state in localStorage
```

---

## 11. Collections & Discovery

| Feature | Type |
|---------|------|
| Featured | `MarketplaceCollection` |
| Trending | `MarketplaceBadge: trending` |
| Editor's Choice | `editors_choice` badge |
| Search | Tags + `OmniGlobalSearch` kind `plugin` |
| Compatibility filter | `compatibility >= SDK_MIN_PLATFORM` |

---

## 12. Uninstall & Rollback

```
uninstallListing(listing):
  → lifecycle.remove(pluginId)
  → sync.removeInstalled(id)
  → OmniPluginSandbox.destroy(pluginId)

rollback(pluginId):
  → MarketplaceLifecycle.rollback — version history [1]
```

---

## 13. Integration

| System | Integration |
|--------|-------------|
| Tool Registry | Manifest `syncPluginToRegistries` on activate |
| OmniPilot | Capabilities indexed for agent routing |
| Mission Control | Plugin health via `MarketplaceLifecycle.health()` |
| Workspace Engine | Widget + panel plugins |
| SDK | `registerModule` → marketplace target |

---

## 14. Backend API

| Route | Role |
|-------|------|
| `routers/omnicore_plugins.py` | Server plugin registry |
| `lib/omnicore/omnicore-plugins-api.ts` | Client bridge |

**Planned:** `GET /api/v1/marketplace/listings`, `POST /api/v1/marketplace/install`

---

## Related Documents

- [PLUGIN_ENGINE.md](./PLUGIN_ENGINE.md)
- [PLUGIN_API.md](./PLUGIN_API.md)
- [../security/PERMISSION_MATRIX.md](../security/PERMISSION_MATRIX.md)
