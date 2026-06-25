import type { LucideIcon } from "lucide-react";
import type { SovereignLayoutKind, SovereignToolSlug } from "../../lib/sovereign-tool-registry";

/** Standard OmniMind capabilities — Brain discovers plugins by these, not hardcoded names. */
export type OmniCapability =
  | "generate-code"
  | "generate-video"
  | "analyze-data"
  | "analyze-medical-image"
  | "edit-video"
  | "create-architecture"
  | "translate"
  | "generate-music"
  | "voice-processing"
  | "financial-analysis"
  | "scientific-simulation"
  | "deploy"
  | "marketing-campaign"
  | "navigation-maps"
  | "entertainment-streaming";

export type PluginPermissionScope =
  | "filesystem"
  | "camera"
  | "microphone"
  | "network"
  | "terminal"
  | "database"
  | "browser"
  | "deployment";

export type PluginPermissionState = "pending" | "granted" | "denied";

export type PluginFeatureFlagMode = "enabled" | "disabled" | "beta" | "developer" | "enterprise";

export type PluginLifecycleState =
  | "registered"
  | "installed"
  | "loaded"
  | "active"
  | "suspended"
  | "unloaded";

export type PluginKeyboardShortcut = {
  keys: string;
  actionId: string;
  label: string;
};

export type PluginActionDefinition = {
  id: string;
  label: string;
  description?: string;
  command?: string;
  capability?: OmniCapability;
  permission?: PluginPermissionScope;
  handler?: string;
};

export type PluginDependency = {
  pluginId: string;
  versionRange: string;
};

/** Marketplace-ready metadata (future OmniMind Marketplace). */
export type PluginMarketplaceMeta = {
  rating?: number;
  compatibility?: string;
  signature?: string;
  changelogUrl?: string;
  downloadUrl?: string;
};

export type PluginFeatureFlags = Partial<Record<OmniCapability | string, PluginFeatureFlagMode>>;

/**
 * Universal plugin manifest — every OmniMind tool registers through this contract.
 * One manifest replaces hardcoded tool pages.
 */
export type OmniPluginManifest = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  version: string;
  author?: string;
  route: string;
  workspace?: SovereignLayoutKind | "native" | "os-shell";
  toolId: SovereignToolSlug | string;
  permissions: PluginPermissionScope[];
  capabilities: OmniCapability[];
  actions: PluginActionDefinition[];
  dependencies?: PluginDependency[];
  featureFlags?: PluginFeatureFlags;
  keyboardShortcuts?: PluginKeyboardShortcut[];
  supportedInputs: string[];
  supportedOutputs: string[];
  keywords?: string[];
  routeId?: string;
  apiProbe?: string;
  marketplace?: PluginMarketplaceMeta;
  minOmniVersion?: string;
};

export type RegisteredPlugin = OmniPluginManifest & {
  lifecycle: PluginLifecycleState;
  installedAt: string;
  activatedAt?: string;
};

export type CapabilityMatch = {
  pluginId: string;
  toolId: string;
  capability: OmniCapability;
  confidence: number;
  reason: string;
};

export type ActionExecutionContext = {
  pluginId: string;
  actionId: string;
  toolId: string;
  prompt?: string;
  payload?: Record<string, unknown>;
};

export type ActionExecutionResult = {
  ok: boolean;
  output?: unknown;
  error?: string;
  events: string[];
};

export type PluginEventMap = {
  ProjectCreated: { pluginId: string; projectId: string };
  TaskStarted: { pluginId: string; taskId: string; label: string };
  TaskCompleted: { pluginId: string; taskId: string; output?: unknown };
  ExportFinished: { pluginId: string; path?: string };
  PluginInstalled: { pluginId: string; version: string };
  PluginActivated: { pluginId: string };
  PluginRemoved: { pluginId: string };
  DeploymentSucceeded: { pluginId: string; target: string };
  AnalysisCompleted: { pluginId: string; summary: string };
  PermissionRequested: { pluginId: string; scope: PluginPermissionScope };
  PermissionResolved: { pluginId: string; scope: PluginPermissionScope; granted: boolean };
  ActionExecuted: { pluginId: string; actionId: string; ok: boolean };
};

export type PluginEventName = keyof PluginEventMap;

export type PluginEventHandler<K extends PluginEventName = PluginEventName> = (
  payload: PluginEventMap[K],
) => void;

export type PermissionRequestRecord = {
  id: string;
  pluginId: string;
  scope: PluginPermissionScope;
  reason: string;
  state: PluginPermissionState;
  createdAt: string;
  resolve?: (granted: boolean) => void;
};
