import { buildSovereignPluginManifests } from "../plugins/manifests/sovereign-plugins";
import type { MarketplaceCollection, MarketplaceItemKind, MarketplaceListing } from "./types";

function listing(
  partial: Partial<MarketplaceListing> &
    Pick<MarketplaceListing, "id" | "kind" | "name" | "description" | "author" | "version" | "category">,
): MarketplaceListing {
  return {
    rating: 4.5,
    ratingCount: 120,
    downloads: 1000,
    activeUsers: 400,
    updatedAt: new Date().toISOString(),
    badges: [],
    tags: [],
    pricing: "free",
    compatibility: "12.x",
    ...partial,
  };
}

const WORKFLOW_LISTINGS: MarketplaceListing[] = [
  listing({
    id: "wf-business-analytics",
    kind: "workflow",
    name: "Enterprise BI Pipeline",
    description: "Ingest → clean → forecast → dashboard",
    author: "OmniMind",
    version: "2.1.0",
    category: "Business",
    tags: ["analytics", "forecast"],
    badges: ["enterprise_ready", "verified"],
    pricing: "enterprise",
    downloads: 2400,
    rating: 4.8,
  }),
  listing({
    id: "wf-medical-triage",
    kind: "workflow",
    name: "Medical Triage Flow",
    description: "Scan → analyze → report workflow",
    author: "OmniMind Health",
    version: "1.4.0",
    category: "Medical",
    tags: ["medical", "diagnostic"],
    badges: ["verified"],
    pricing: "subscription",
    priceUsd: 49,
  }),
  listing({
    id: "wf-fullstack-deploy",
    kind: "workflow",
    name: "Full-Stack Deploy",
    description: "Scaffold → test → deploy pipeline",
    author: "OmniForge",
    version: "3.0.0",
    category: "Development",
    tags: ["omniforge", "deploy"],
    badges: ["trending", "editors_choice"],
    downloads: 8900,
    rating: 4.9,
  }),
];

const THEME_LISTINGS: MarketplaceListing[] = [
  listing({
    id: "theme-slate-cyber",
    kind: "theme",
    name: "Slate Cyber Dark",
    description: "Default OmniMind V12 design system",
    author: "OmniMind",
    version: "12.0.0",
    category: "Themes",
    badges: ["verified", "editors_choice"],
    downloads: 50000,
    rating: 5,
  }),
  listing({
    id: "theme-enterprise-light",
    kind: "theme",
    name: "Enterprise Light Pro",
    description: "Professional light mode for enterprise",
    author: "OmniMind Design",
    version: "1.2.0",
    category: "Themes",
    badges: ["enterprise_ready"],
    pricing: "paid",
    priceUsd: 19,
  }),
];

const EXTRA_LISTINGS: MarketplaceListing[] = [
  listing({
    id: "pack-prompt-engineering",
    kind: "prompt_pack",
    name: "Prompt Engineering Pro",
    description: "50+ optimized prompts for Brain 2.0",
    author: "OmniMind AI",
    version: "1.0.0",
    category: "AI",
    badges: ["new_release", "trending"],
    downloads: 3200,
  }),
  listing({
    id: "pack-voice-urdu",
    kind: "voice_pack",
    name: "Urdu Voice Pack",
    description: "Bilingual voice for OmniTranslator",
    author: "OmniMind",
    version: "1.1.0",
    category: "Language",
    tags: ["urdu", "voice"],
    pricing: "free",
  }),
  listing({
    id: "connector-salesforce",
    kind: "enterprise_connector",
    name: "Salesforce Connector",
    description: "CRM sync for Business Analytics",
    author: "OmniMind Enterprise",
    version: "2.0.0",
    category: "Connectors",
    badges: ["enterprise_ready", "verified"],
    pricing: "enterprise",
  }),
  listing({
    id: "sdk-omnimind-plugin",
    kind: "developer_sdk",
    name: "OmniMind Plugin SDK",
    description: "Build plugins for the Universal Tool Framework",
    author: "OmniMind",
    version: "12.0.0",
    category: "Developer",
    badges: ["verified"],
    downloads: 15000,
    rating: 4.95,
  }),
  listing({
    id: "model-provider-gateway",
    kind: "model_provider",
    name: "Multi-Model Gateway",
    description: "Failover across AI providers via Brain 2.0",
    author: "OmniMind",
    version: "1.0.0",
    category: "Models",
    badges: ["enterprise_ready"],
    pricing: "subscription",
    priceUsd: 99,
  }),
];

/** Marketplace catalog — sovereign tools + workflows + themes + packs. */
export class MarketplaceCatalog {
  private listings: MarketplaceListing[];

  constructor() {
    const sovereign = buildSovereignPluginManifests().map((m) =>
      listing({
        id: `catalog-${m.id}`,
        kind: "ai_tool" as const,
        name: m.name,
        description: m.description,
        author: m.author ?? "OmniMind",
        version: m.version,
        category: m.category,
        tags: m.keywords ?? [],
        badges: ["verified"],
        manifest: m,
        downloads: 5000 + Math.floor(Math.random() * 3000),
        rating: m.marketplace?.rating ?? 4.7,
      }),
    );

    this.listings = [...sovereign, ...WORKFLOW_LISTINGS, ...THEME_LISTINGS, ...EXTRA_LISTINGS];
  }

  all(): MarketplaceListing[] {
    return [...this.listings];
  }

  get(id: string) {
    return this.listings.find((l) => l.id === id);
  }

  search(query: string) {
    const q = query.toLowerCase();
    return this.listings.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.tags.some((t) => t.includes(q)) ||
        l.category.toLowerCase().includes(q),
    );
  }

  byKind(kind: MarketplaceItemKind) {
    return this.listings.filter((l) => l.kind === kind);
  }

  byCategory(category: string) {
    return this.listings.filter((l) => l.category.toLowerCase() === category.toLowerCase());
  }

  trending(limit = 8) {
    return [...this.listings].sort((a, b) => b.downloads - a.downloads).slice(0, limit);
  }

  editorsChoice() {
    return this.listings.filter((l) => l.badges.includes("editors_choice"));
  }

  verified() {
    return this.listings.filter((l) => l.badges.includes("verified"));
  }

  enterpriseReady() {
    return this.listings.filter((l) => l.badges.includes("enterprise_ready") || l.pricing === "enterprise");
  }

  newReleases(limit = 6) {
    return [...this.listings]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  highestRated(limit = 8) {
    return [...this.listings].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  collections(): MarketplaceCollection[] {
    return [
      {
        id: "col-dev",
        title: "Developer Essentials",
        description: "OmniForge, SDK, and deploy workflows",
        listingIds: this.listings.filter((l) => l.category === "Development" || l.kind === "developer_sdk").map((l) => l.id),
      },
      {
        id: "col-enterprise",
        title: "Enterprise Suite",
        description: "Verified enterprise-ready listings",
        listingIds: this.enterpriseReady().map((l) => l.id),
      },
    ];
  }
}

let catalog: MarketplaceCatalog | null = null;

export function getMarketplaceCatalog(): MarketplaceCatalog {
  if (!catalog) catalog = new MarketplaceCatalog();
  return catalog;
}

export const MARKETPLACE_CATEGORIES = [
  "AI",
  "Development",
  "Business",
  "Medical",
  "Creative",
  "Themes",
  "Workflows",
  "Connectors",
  "Developer",
  "Models",
  "Language",
];
