import type { LucideIcon } from "lucide-react";
import type { AgentPermission } from "../agent/types";

export type ToolCategory =
  | "development"
  | "analytics"
  | "creative"
  | "medical"
  | "finance"
  | "science"
  | "marketing"
  | "entertainment"
  | "utility";

export type ToolExecutionStageId =
  | "receive"
  | "validate"
  | "load_context"
  | "execute"
  | "track_progress"
  | "store_result"
  | "update_memory";

export type ToolExecutionStageStatus = "pending" | "active" | "done" | "error";

export type ToolExecutionStage = {
  id: ToolExecutionStageId;
  label: string;
  status: ToolExecutionStageStatus;
  message?: string;
};

export type UniversalToolAction = {
  id: string;
  label: string;
  command?: string;
  shortcut?: string;
  permission?: AgentPermission;
};

export type UniversalKeyboardShortcut = {
  keys: string;
  actionId: string;
  label: string;
};

export type UniversalToolPrompt = {
  id: string;
  label: string;
  template: string;
};

/** Canonical tool API — every OmniMind tool exposes this surface. */
export type UniversalToolDefinition = {
  toolId: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  capabilities: string[];
  acceptedInputs: string[];
  generatedOutputs: string[];
  supportedActions: UniversalToolAction[];
  permissions: AgentPermission[];
  keyboardShortcuts: UniversalKeyboardShortcut[];
  aiPrompts: UniversalToolPrompt[];
  href: string;
  routeId?: string;
  pluginId?: string;
};

export type ToolTaskRecord = {
  id: string;
  label: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  createdAt: string;
  error?: string;
};

export type ToolVersionSnapshot = {
  id: string;
  label: string;
  at: string;
  payload: unknown;
};

export type ToolFrameworkState = {
  loading: boolean;
  error: string | null;
  progress: number;
  stages: ToolExecutionStage[];
  tasks: ToolTaskRecord[];
  suggestions: string[];
  notifications: { id: string; text: string; level: "info" | "warn" | "error" }[];
  undoStack: ToolVersionSnapshot[];
  redoStack: ToolVersionSnapshot[];
  autosaveAt: string | null;
  memoryContext: string[];
  recentTasks: string[];
};

export type ToolPluginManifest = {
  id: string;
  name: string;
  version: string;
  description?: string;
  register: (api: ToolPluginRegistrationApi) => void;
  onInstall?: () => void;
  onUnload?: () => void;
};

export type ToolPluginRegistrationApi = {
  registerTool: (tool: UniversalToolDefinition) => void;
};

export type ToolExecuteRequest = {
  toolId: string;
  actionId?: string;
  prompt?: string;
  payload?: Record<string, unknown>;
};

export type ToolExecuteResult = {
  ok: boolean;
  output?: unknown;
  error?: string;
  stages: ToolExecutionStage[];
};
