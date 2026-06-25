/** OmniMind V2.0 — Universal Automation Engine types. */

export type AutomationTriggerId =
  | "manual"
  | "ai-trigger"
  | "schedule"
  | "project-created"
  | "file-added"
  | "file-modified"
  | "folder-changed"
  | "chat-message"
  | "voice-command"
  | "image-uploaded"
  | "video-uploaded"
  | "audio-uploaded"
  | "document-uploaded"
  | "deployment-completed"
  | "build-failed"
  | "api-response"
  | "webhook"
  | "plugin-event"
  | "system-event";

export type AutomationActionId =
  | "generate-code"
  | "generate-ui"
  | "generate-backend"
  | "generate-database"
  | "generate-api"
  | "generate-images"
  | "generate-videos"
  | "generate-music"
  | "generate-marketing"
  | "run-medical-analysis"
  | "run-business-analytics"
  | "deploy-project"
  | "send-email"
  | "push-notification"
  | "export-files"
  | "convert-files"
  | "sync-cloud"
  | "execute-sdk"
  | "execute-cli";

export type WorkflowNodeKind = "trigger" | "action" | "condition" | "loop" | "parallel" | "nested";

export type WorkflowNode = {
  id: string;
  kind: WorkflowNodeKind;
  triggerId?: AutomationTriggerId;
  actionId?: AutomationActionId;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  childIds?: string[];
  nextIds?: string[];
  elseIds?: string[];
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  version: number;
  nodes: WorkflowNode[];
  templateId: string | null;
  nestedWorkflowIds: string[];
  schedule: string | null;
  enabled: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type ExecutionStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "rolled-back";

export type WorkflowExecution = {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  progress: number;
  currentNodeId: string | null;
  logs: WorkflowLogEntry[];
  startedAt: string;
  updatedAt: string;
  finishedAt: string | null;
  error: string | null;
  priority: number;
  background: boolean;
};

export type WorkflowLogEntry = {
  id: string;
  at: string;
  level: "info" | "warn" | "error" | "debug" | "ai";
  nodeId: string | null;
  message: string;
  data?: Record<string, unknown>;
};

export type AutomationSuggestion = {
  id: string;
  title: string;
  reason: string;
  workflowId?: string;
  templateId?: string;
  confidence: number;
};

export type AutomationMetrics = {
  totalExecutions: number;
  successRate: number;
  failureRate: number;
  avgExecutionMs: number;
  resourceUsage: { cpu: number | null; queueDepth: number };
  aiDecisions: number;
};

export type TriggerDescriptor = {
  id: AutomationTriggerId;
  label: string;
  category: string;
  description: string;
};

export type ActionDescriptor = {
  id: AutomationActionId;
  label: string;
  category: string;
  description: string;
  toolSlug?: string;
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  tags: string[];
};
