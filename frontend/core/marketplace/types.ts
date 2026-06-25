import type { OmniCapability, OmniPluginManifest, PluginPermissionScope } from "../plugins/types";

export type MarketplaceItemKind =
  | "ai_tool"
  | "ai_agent"
  | "plugin"
  | "extension"
  | "template"
  | "theme"
  | "widget"
  | "workflow"
  | "automation_pack"
  | "prompt_pack"
  | "language_pack"
  | "voice_pack"
  | "enterprise_connector"
  | "developer_sdk"
  | "model_provider";

export type MarketplaceBadge =
  | "trending"
  | "editors_choice"
  | "verified"
  | "enterprise_ready"
  | "new_release";

export type PricingModel = "free" | "paid" | "subscription" | "one_time" | "enterprise" | "team";

export type MarketplaceListing = {
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
  ratingCount: number;
  downloads: number;
  activeUsers: number;
  updatedAt: string;
  compatibility: string;
  pricing: PricingModel;
  priceUsd?: number;
  enterpriseOnly?: boolean;
  privateOrgId?: string;
  manifest?: OmniPluginManifest;
  signature?: string;
  crashRate?: number;
  performanceScore?: number;
};

export type MarketplaceCollection = {
  id: string;
  title: string;
  description: string;
  listingIds: string[];
};

export type MarketplaceBookmark = {
  listingId: string;
  addedAt: string;
};

export type MarketplacePurchase = {
  listingId: string;
  licenseKey: string;
  purchasedAt: string;
  model: PricingModel;
  expiresAt?: string;
};

export type DeveloperProfile = {
  id: string;
  name: string;
  apiKeys: { id: string; label: string; createdAt: string; prefix: string }[];
  listings: string[];
};

export type EnterpriseStore = {
  orgId: string;
  name: string;
  privateListingIds: string[];
  roles: Record<string, "admin" | "developer" | "viewer">;
};

export type MarketplaceAnalytics = {
  downloads: number;
  activeUsers: number;
  revenueUsd: number;
  avgRating: number;
  crashReports: number;
  performanceAvg: number;
  compatibilityIssues: number;
  usageTrend: { date: string; downloads: number }[];
};

export type PluginSDKManifest = {
  pluginId: string;
  version: string;
  author: string;
  permissions: PluginPermissionScope[];
  dependencies: { pluginId: string; versionRange: string }[];
  requiredApis: string[];
  uiComponents?: string[];
  actions: { id: string; label: string; capability?: OmniCapability }[];
  commands?: { id: string; label: string }[];
  capabilities: OmniCapability[];
  lifecycleHooks: ("install" | "enable" | "disable" | "update" | "remove")[];
  securityRequirements: string[];
  compatibility: string;
  signature?: string;
};

export type PluginHealthReport = {
  pluginId: string;
  healthy: boolean;
  issues: string[];
  lastCheck: string;
};

export type MarketplaceSyncState = {
  installedPlugins: string[];
  licenses: MarketplacePurchase[];
  bookmarks: MarketplaceBookmark[];
  settings: Record<string, string>;
  developerAssets: string[];
  lastSyncedAt: string | null;
};
