/** OmniMind SDK — shared type definitions (browser + server safe) */
export const SDK_VERSION = "12.0.0";
export const SDK_MIN_PLATFORM = "12.0.0";

export type SDKModuleKind =
  | "tool"
  | "plugin"
  | "ai-agent"
  | "workflow"
  | "extension";

export type SDKGeneratorTemplate =
  | "medical-tool"
  | "music-tool"
  | "video-tool"
  | "image-tool"
  | "business-tool"
  | "finance-tool"
  | "developer-tool"
  | "research-tool"
  | "productivity-tool"
  | "game-tool"
  | "enterprise-dashboard"
  | "chat-module"
  | "analytics-module"
  | "generic-tool";

export type SDKModuleManifest = {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  kind: SDKModuleKind;
  template?: SDKGeneratorTemplate;
  route: string;
  toolId: string;
  capabilities: string[];
  permissions: string[];
  dependencies: { moduleId: string; versionRange: string }[];
  designSystem: boolean;
  autoRegister: boolean;
  minOmniVersion: string;
  signature?: string;
};

export type SDKModuleState =
  | "initialize"
  | "load"
  | "ready"
  | "active"
  | "sleep"
  | "pause"
  | "resume"
  | "shutdown"
  | "destroy"
  | "recovery";

export type SDKRegistrationTarget =
  | "brain"
  | "memory"
  | "actions"
  | "theme"
  | "plugins"
  | "marketplace"
  | "permissions"
  | "analytics"
  | "notifications"
  | "search"
  | "command-palette"
  | "workspace"
  | "recent-activity"
  | "navigation"
  | "global-search";

export type SDKRegistrationResult = {
  moduleId: string;
  targets: Record<SDKRegistrationTarget, boolean>;
  errors: string[];
};

export type SDKDoctorReport = {
  ok: boolean;
  version: string;
  platform: string;
  checks: { name: string; passed: boolean; message: string }[];
};

export type SDKVerifyReport = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  compatibility: string;
};

export type SDKProjectScaffold = {
  rootDir: string;
  manifest: SDKModuleManifest;
  files: { path: string; content: string }[];
};
