import { getOmniPluginManager } from "../plugins/PluginManager";
import { getMarketplaceAnalytics } from "./analytics";
import { getMarketplaceCatalog } from "./catalog";
import { getEnterpriseStoreManager } from "./enterprise-store";
import { getMarketplaceLifecycle } from "./lifecycle";
import { getPluginSDK } from "./plugin-sdk";
import { getMarketplaceSecurity } from "./security";
import { getMarketplaceSync } from "./sync";
import type { DeveloperProfile, MarketplaceListing } from "./types";

/**
 * OmniMind Enterprise Marketplace — central ecosystem manager.
 * Integrates with Brain, Plugin System, Tool Framework, and Memory.
 */
export class MarketplaceManager {
  readonly catalog = getMarketplaceCatalog();
  readonly lifecycle = getMarketplaceLifecycle();
  readonly security = getMarketplaceSecurity();
  readonly analytics = getMarketplaceAnalytics();
  readonly sync = getMarketplaceSync();
  readonly sdk = getPluginSDK();
  readonly enterprise = getEnterpriseStoreManager();
  readonly plugins = getOmniPluginManager();

  private developer: DeveloperProfile = {
    id: "dev-local",
    name: "Local Developer",
    apiKeys: [{ id: "key-1", label: "Default", createdAt: new Date().toISOString(), prefix: "omni_" }],
    listings: [],
  };

  getDeveloper() {
    return { ...this.developer };
  }

  generateApiKey(label: string) {
    const key = {
      id: `key-${Date.now()}`,
      label,
      createdAt: new Date().toISOString(),
      prefix: `omni_${Math.random().toString(36).slice(2, 10)}`,
    };
    this.developer.apiKeys.push(key);
    return key;
  }

  async installListing(listing: MarketplaceListing) {
    if (listing.manifest) {
      const scan = this.security.scan({
        pluginId: listing.manifest.id,
        version: listing.manifest.version,
        author: listing.manifest.author ?? listing.author,
        permissions: listing.manifest.permissions,
        dependencies: listing.manifest.dependencies ?? [],
        requiredApis: listing.manifest.supportedInputs,
        actions: listing.manifest.actions.map((a) => ({ id: a.id, label: a.label, capability: a.capability })),
        capabilities: listing.manifest.capabilities,
        lifecycleHooks: ["install", "enable"],
        securityRequirements: ["sandbox"],
        compatibility: listing.compatibility,
        signature: listing.signature,
      });
      if (!scan.passed) return { ok: false, error: "Security scan failed" };
      const result = await this.lifecycle.install(listing.manifest);
      if (result.ok) {
        this.sync.addInstalled(listing.manifest.id);
        this.analytics.recordDownload(listing.id, listing.priceUsd ?? 0);
        this.plugins.events.publish("PluginInstalled", {
          pluginId: listing.manifest.id,
          version: listing.manifest.version,
        });
      }
      return result;
    }
    this.analytics.recordDownload(listing.id, listing.priceUsd ?? 0);
    this.sync.addInstalled(listing.id);
    return { ok: true };
  }

  async uninstallListing(listing: MarketplaceListing) {
    const id = listing.manifest?.id ?? listing.id;
    await this.lifecycle.remove(id);
    this.sync.removeInstalled(id);
    return { ok: true };
  }

  isInstalled(listing: MarketplaceListing) {
    const id = listing.manifest?.id ?? listing.id;
    return this.sync.getState().installedPlugins.includes(id);
  }

  bookmark(listingId: string) {
    this.sync.addBookmark({ listingId, addedAt: new Date().toISOString() });
  }

  async syncCloud() {
    return this.sync.syncToCloud();
  }

  /** Bridge to Brain — record marketplace action in global memory via event. */
  notifyBrain(action: string, detail: Record<string, unknown>) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omnimind:marketplace-brain", { detail: { action, ...detail } }));
    }
  }
}

let manager: MarketplaceManager | null = null;

export function getMarketplaceManager(): MarketplaceManager {
  if (!manager) manager = new MarketplaceManager();
  return manager;
}
