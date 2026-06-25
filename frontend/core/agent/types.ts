import type { SovereignToolSlug } from "../../lib/sovereign-tool-registry";

export type AgentTaskStatus = "queued" | "running" | "waiting" | "completed" | "failed";

export type AgentPermission = "read" | "write" | "deploy" | "execute" | "admin";

export type AgentToolAction = {
  id: string;
  label: string;
  description?: string;
  command?: string;
};

export type AgentToolDefinition = {
  id: string;
  slug: SovereignToolSlug | string;
  name: string;
  description: string;
  href: string;
  capabilities: string[];
  actions: AgentToolAction[];
  permissions: AgentPermission[];
  supportedInputs: string[];
  supportedOutputs: string[];
  keywords: string[];
  routeId?: string;
  pluginId?: string;
};

export type IntentMatch = {
  toolId: string;
  slug: SovereignToolSlug | string;
  confidence: number;
  reason: string;
  suggestedWorkflowId?: string;
};

export type AgentMemorySlice = {
  projectMemory: Record<string, unknown>;
  conversationMemory: { role: "user" | "assistant" | "system"; text: string; at: string }[];
  workspaceMemory: {
    activeTool?: string;
    framework?: string;
    database?: string;
    deploymentTarget?: string;
    pinnedContext: string[];
    recentFiles: string[];
    currentProject?: string;
  };
  recentTasks: string[];
};

export type AgentTask = {
  id: string;
  label: string;
  toolId?: string;
  status: AgentTaskStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
  workflowStepId?: string;
  retryCount: number;
};

export type WorkflowStep = {
  id: string;
  label: string;
  toolId: string;
  actionId?: string;
  promptTemplate?: string;
};

export type AgentWorkflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
};

export type ConversationThread = {
  id: string;
  title: string;
  toolId?: string;
  messages: { role: "user" | "assistant" | "system"; text: string; at: string }[];
  updatedAt: string;
};

export type AgentLogEntry = {
  id: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  at: string;
  toolId?: string;
};

export type PromptRouteResult = {
  toolId: string;
  routeId: string;
  dispatched: boolean;
  events: string[];
};

export type VoiceSessionState = "idle" | "listening" | "processing" | "speaking";

export interface VoiceManagerContract {
  readonly supported: boolean;
  getState(): VoiceSessionState;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  synthesizeSpeech(_text: string): Promise<void>;
}

export interface OmniMindPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  registerTools: (register: (tool: AgentToolDefinition) => void) => void;
  onInstall?: () => void;
  onUnload?: () => void;
}

export type CopilotTabId =
  | "chat"
  | "tasks"
  | "memory"
  | "projects"
  | "actions"
  | "history"
  | "deploy"
  | "suggestions"
  | "logs";

export const COPILOT_TABS: { id: CopilotTabId; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "tasks", label: "Tasks" },
  { id: "memory", label: "Memory" },
  { id: "projects", label: "Projects" },
  { id: "actions", label: "Actions" },
  { id: "history", label: "History" },
  { id: "deploy", label: "Deploy" },
  { id: "suggestions", label: "Suggestions" },
  { id: "logs", label: "Logs" },
];
