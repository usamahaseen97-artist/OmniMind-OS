import type { MarketplaceBookmark, MarketplacePurchase, MarketplaceSyncState } from "./types";

const SYNC_KEY = "omnimind_marketplace_sync_v1";

/** Cloud sync — plugins, licenses, bookmarks, purchases, settings. */
export class MarketplaceSync {
  private state: MarketplaceSyncState = {
    installedPlugins: [],
    licenses: [],
    bookmarks: [],
    settings: {},
    developerAssets: [],
    lastSyncedAt: null,
  };

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(SYNC_KEY);
      if (raw) this.state = { ...this.state, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    localStorage.setItem(SYNC_KEY, JSON.stringify(this.state));
  }

  getState() {
    return { ...this.state };
  }

  async syncToCloud() {
    this.state.lastSyncedAt = new Date().toISOString();
    this.persist();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omnimind:marketplace-synced", { detail: this.state }));
    }
    return this.state;
  }

  addInstalled(pluginId: string) {
    if (!this.state.installedPlugins.includes(pluginId)) {
      this.state.installedPlugins.push(pluginId);
      this.persist();
    }
  }

  removeInstalled(pluginId: string) {
    this.state.installedPlugins = this.state.installedPlugins.filter((id) => id !== pluginId);
    this.persist();
  }

  addBookmark(bookmark: MarketplaceBookmark) {
    this.state.bookmarks = [bookmark, ...this.state.bookmarks.filter((b) => b.listingId !== bookmark.listingId)];
    this.persist();
  }

  addPurchase(purchase: MarketplacePurchase) {
    this.state.licenses.push(purchase);
    this.persist();
  }

  setSetting(key: string, value: string) {
    this.state.settings[key] = value;
    this.persist();
  }
}

let sync: MarketplaceSync | null = null;

export function getMarketplaceSync(): MarketplaceSync {
  if (!sync) sync = new MarketplaceSync();
  return sync;
}
