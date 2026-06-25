import type { MarketingPlugin, MarketplaceTemplate } from "./types";

export class MarketingPluginEngine {
  install(plugins: MarketingPlugin[], id: string): MarketingPlugin[] {
    return plugins.map((p) => (p.id === id ? { ...p, installed: true } : p));
  }

  listMarketplace(): MarketplaceTemplate[] {
    return [
      { id: "tpl-ig-story", name: "Instagram Story Pack", category: "template", platform: "instagram", premium: false },
      { id: "tpl-meta-carousel", name: "Meta Carousel Ads", category: "template", platform: "meta", premium: true },
      { id: "auto-social", name: "Social Automation Pack", category: "automation", platform: "universal", premium: true },
    ];
  }
}

export const marketingPluginEngine = new MarketingPluginEngine();
