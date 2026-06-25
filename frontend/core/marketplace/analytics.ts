import type { MarketplaceAnalytics } from "./types";

const ANALYTICS_KEY = "omnimind_marketplace_analytics_v1";

/** Marketplace metrics — downloads, revenue, ratings, crashes. */
export class MarketplaceAnalyticsEngine {
  private data: MarketplaceAnalytics = {
    downloads: 0,
    activeUsers: 1,
    revenueUsd: 0,
    avgRating: 4.6,
    crashReports: 0,
    performanceAvg: 92,
    compatibilityIssues: 0,
    usageTrend: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(ANALYTICS_KEY);
      if (raw) this.data = { ...this.data, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(this.data));
  }

  get(): MarketplaceAnalytics {
    return { ...this.data };
  }

  recordDownload(listingId: string, priceUsd = 0) {
    this.data.downloads += 1;
    this.data.revenueUsd += priceUsd;
    const today = new Date().toISOString().slice(0, 10);
    const existing = this.data.usageTrend.find((t) => t.date === today);
    if (existing) existing.downloads += 1;
    else this.data.usageTrend = [{ date: today, downloads: 1 }, ...this.data.usageTrend].slice(0, 30);
    this.persist();
    void listingId;
  }

  recordCrash(pluginId: string) {
    this.data.crashReports += 1;
    this.persist();
    void pluginId;
  }

  recordRating(rating: number) {
    this.data.avgRating = Math.round(((this.data.avgRating + rating) / 2) * 10) / 10;
    this.persist();
  }
}

let engine: MarketplaceAnalyticsEngine | null = null;

export function getMarketplaceAnalytics(): MarketplaceAnalyticsEngine {
  if (!engine) engine = new MarketplaceAnalyticsEngine();
  return engine;
}
