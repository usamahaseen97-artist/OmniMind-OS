import type { DeveloperProfile, MarketplaceListing, OmniPluginType, PluginReview } from "./types";
import { DEVELOPER_SEED, MARKETPLACE_SEED } from "./constants";
import { omniPluginRegistry } from "./OmniPluginRegistry";

/** Plugin marketplace — browse, install, reviews, categories. */
export class OmniPluginMarketplace {
  listings: MarketplaceListing[] = MARKETPLACE_SEED.map((l) => ({ ...l }));
  developers: DeveloperProfile[] = DEVELOPER_SEED.map((d) => ({ ...d }));
  reviews: PluginReview[] = [];

  browse(category?: string, type?: OmniPluginType) {
    return this.listings
      .map((l) => ({ listing: l, plugin: omniPluginRegistry.get(l.pluginId) }))
      .filter((x) => x.plugin && (!category || x.plugin.category === category) && (!type || x.plugin.type === type));
  }

  verified() {
    return this.browse().filter((x) => x.plugin?.verified);
  }

  install(pluginId: string) {
    const plugin = omniPluginRegistry.get(pluginId);
    if (!plugin) return null;
    plugin.enabled = true;
    const listing = this.listings.find((l) => l.pluginId === pluginId);
    if (listing) listing.downloads += 1;
    return plugin;
  }

  addReview(pluginId: string, rating: number, comment: string, author: string) {
    const review: PluginReview = {
      id: `rev-${Date.now()}`,
      pluginId,
      rating,
      comment,
      author,
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(review);
    const plugin = omniPluginRegistry.get(pluginId);
    if (plugin) {
      plugin.reviewCount += 1;
      plugin.rating = (plugin.rating * (plugin.reviewCount - 1) + rating) / plugin.reviewCount;
    }
    return review;
  }

  categories() {
    return [...new Set(omniPluginRegistry.plugins.map((p) => p.category))];
  }
}

export const omniPluginMarketplace = new OmniPluginMarketplace();
