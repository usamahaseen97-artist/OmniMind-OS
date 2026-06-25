/** OmniCore Extension Platform — plugin SDK types (Phase 4). */

export type OmniPluginType =
  | "ai"
  | "developer"
  | "medical"
  | "visionary"
  | "music"
  | "analytics"
  | "trading"
  | "automation"
  | "theme"
  | "utility"
  | "enterprise";

export type OmniPluginPermission =
  | "filesystem"
  | "network"
  | "ai-models"
  | "microphone"
  | "camera"
  | "notifications"
  | "clipboard"
  | "projects"
  | "assets"
  | "tool-access";

export type PermissionGrant = {
  permission: OmniPluginPermission;
  granted: boolean;
  scope: "global" | "session" | "once";
};

export type OmniPlatformPlugin = {
  id: string;
  name: string;
  version: string;
  type: OmniPluginType;
  description: string;
  author: string;
  verified: boolean;
  enabled: boolean;
  permissions: OmniPluginPermission[];
  dependencies: string[];
  minCoreVersion: string;
  rating: number;
  reviewCount: number;
  category: string;
  signature: string | null;
};

export type MarketplaceListing = {
  id: string;
  pluginId: string;
  price: number;
  enterprise: boolean;
  developerId: string;
  downloads: number;
  updatedAt: string;
};

export type DeveloperProfile = {
  id: string;
  name: string;
  verified: boolean;
  pluginIds: string[];
};

export type PluginReview = {
  id: string;
  pluginId: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
};

export type ThemeExtension = {
  id: string;
  pluginId: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  iconSet: string;
  syntaxTheme: string;
  branding: Record<string, string>;
};

export type AutomationNode = {
  id: string;
  kind: "trigger" | "action" | "condition";
  label: string;
  config: Record<string, string>;
};

export type AutomationWorkflow = {
  id: string;
  pluginId: string;
  name: string;
  nodes: AutomationNode[];
  schedule: string | null;
};

export type ExtensionCommand = {
  id: string;
  pluginId: string;
  label: string;
  shortcut: string | null;
};

export type ExtensionPanel = {
  id: string;
  pluginId: string;
  region: "sidebar" | "bottom" | "window";
  title: string;
};

export type ToolRegistration = {
  pluginId: string;
  toolSlug: string;
  label: string;
};

export type PluginHook =
  | "ai"
  | "project"
  | "asset"
  | "search"
  | "command"
  | "menu";

export type PluginDiagnostic = {
  pluginId: string;
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
};

export type PackageResolution = {
  ok: boolean;
  installOrder: string[];
  conflicts: string[];
  missing: string[];
};

export type PluginAnalytics = {
  pluginId: string;
  activations: number;
  errors: number;
  avgLatencyMs: number;
};
