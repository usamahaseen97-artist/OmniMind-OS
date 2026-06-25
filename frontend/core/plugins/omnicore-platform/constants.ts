import type { DeveloperProfile, MarketplaceListing, OmniPlatformPlugin } from "./types";

export const OMNICORE_PLUGINS_VERSION = "4.0.0-phase4";

export const PLUGIN_SEED: OmniPlatformPlugin[] = [
  { id: "ext-theme-dark-pro", name: "Dark Pro Theme", version: "1.0.0", type: "theme", description: "Professional dark theme pack", author: "OmniMind", verified: true, enabled: true, permissions: [], dependencies: [], minCoreVersion: "1.0.0", rating: 4.8, reviewCount: 120, category: "Themes", signature: "sig-001" },
  { id: "ext-ai-assistant-plus", name: "AI Assistant Plus", version: "2.1.0", type: "ai", description: "Enhanced AI hooks for all tools", author: "OmniMind Labs", verified: true, enabled: false, permissions: ["ai-models", "network"], dependencies: [], minCoreVersion: "2.0.0", rating: 4.6, reviewCount: 89, category: "AI", signature: "sig-002" },
  { id: "ext-music-fx-pack", name: "Music FX Pack", version: "1.2.0", type: "music", description: "Extra effects for OmniMusic", author: "Third Party Dev", verified: false, enabled: false, permissions: ["assets", "tool-access"], dependencies: ["ext-ai-assistant-plus"], minCoreVersion: "1.0.0", rating: 4.2, reviewCount: 34, category: "Music", signature: null },
  { id: "ext-enterprise-audit", name: "Enterprise Audit", version: "3.0.0", type: "enterprise", description: "Compliance and audit logging", author: "OmniMind Enterprise", verified: true, enabled: false, permissions: ["filesystem", "projects", "notifications"], dependencies: [], minCoreVersion: "1.0.0", rating: 5.0, reviewCount: 12, category: "Enterprise", signature: "sig-ent" },
];

export const MARKETPLACE_SEED: MarketplaceListing[] = [
  { id: "lst-1", pluginId: "ext-theme-dark-pro", price: 0, enterprise: false, developerId: "dev-omnimind", downloads: 5000, updatedAt: new Date().toISOString() },
  { id: "lst-2", pluginId: "ext-enterprise-audit", price: 99, enterprise: true, developerId: "dev-omnimind", downloads: 200, updatedAt: new Date().toISOString() },
];

export const DEVELOPER_SEED: DeveloperProfile[] = [
  { id: "dev-omnimind", name: "OmniMind Official", verified: true, pluginIds: ["ext-theme-dark-pro", "ext-ai-assistant-plus", "ext-enterprise-audit"] },
];

export const PERMISSION_LABELS: Record<string, string> = {
  filesystem: "Filesystem access",
  network: "Network access",
  "ai-models": "AI model access",
  microphone: "Microphone",
  camera: "Camera",
  notifications: "Notifications",
  clipboard: "Clipboard",
  projects: "Project access",
  assets: "Asset access",
  "tool-access": "Tool integration",
};
