import type { EnterpriseStore, MarketplaceListing } from "./types";
import { getMarketplaceCatalog } from "./catalog";

const ENTERPRISE_KEY = "omnimind_enterprise_stores_v1";

/** Private organization stores — internal plugins, restricted distribution. */
export class EnterpriseStoreManager {
  private stores: EnterpriseStore[] = [];

  constructor() {
    this.load();
    if (!this.stores.length) {
      this.stores = [
        {
          orgId: "org-demo",
          name: "Acme Corp Internal Store",
          privateListingIds: [],
          roles: { admin: "admin", developer: "developer" },
        },
      ];
      this.persist();
    }
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(ENTERPRISE_KEY);
      if (raw) this.stores = JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    localStorage.setItem(ENTERPRISE_KEY, JSON.stringify(this.stores));
  }

  list() {
    return [...this.stores];
  }

  get(orgId: string) {
    return this.stores.find((s) => s.orgId === orgId);
  }

  listingsForOrg(orgId: string): MarketplaceListing[] {
    const store = this.get(orgId);
    if (!store) return [];
    const catalog = getMarketplaceCatalog();
    return store.privateListingIds
      .map((id) => catalog.get(id))
      .filter((l): l is MarketplaceListing => !!l);
  }

  addPrivateListing(orgId: string, listingId: string) {
    const store = this.get(orgId);
    if (!store) return;
    if (!store.privateListingIds.includes(listingId)) {
      store.privateListingIds.push(listingId);
      this.persist();
    }
  }
}

let manager: EnterpriseStoreManager | null = null;

export function getEnterpriseStoreManager(): EnterpriseStoreManager {
  if (!manager) manager = new EnterpriseStoreManager();
  return manager;
}
