/** OmniCore AI Platform — universal AI gateway types (Phase 2). */

import type { AiAgentId, AiProviderId, TokenUsage } from "../shared/ai-gateway-types";

export type {
  AiProviderId,
  AiAgentId,
  TokenUsage,
  FormattedResponse,
  CompleteOptions,
  AiCompletionResult,
} from "../shared/ai-gateway-types";
export type AiModelCapability = "chat" | "completion" | "embedding" | "image" | "audio" | "reasoning";

export type AiModel = {
  id: string;
  providerId: AiProviderId;
  name: string;
  capabilities: AiModelCapability[];
  contextWindow: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  available: boolean;
};

export type AiProvider = {
  id: AiProviderId;
  label: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  status: "online" | "degraded" | "offline";
};

export type AiAgent = {
  id: AiAgentId;
  name: string;
  toolSlug: string;
  description: string;
  defaultModelId: string;
  systemPrompt: string;
  enabled: boolean;
  capabilities: string[];
};

export type PromptVariable = { key: string; required: boolean; defaultValue?: string };

export type PromptTemplate = {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: PromptVariable[];
  version: number;
  tags: string[];
};

export type PromptValidationResult = { valid: boolean; errors: string[] };

export type MemoryScope = "session" | "conversation" | "workspace" | "project" | "long-term" | "user-prefs" | "tool-context";

export type MemoryEntry = {
  id: string;
  scope: MemoryScope;
  key: string;
  value: unknown;
  toolSlug: string | null;
  projectId: string | null;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  timestamp: string;
  tokenCount: number;
};

export type Conversation = {
  id: string;
  agentId: AiAgentId;
  toolSlug: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

export type ContextSlice = {
  toolSlug: string;
  projectId: string | null;
  workspaceId: string | null;
  metadata: Record<string, string>;
};

export type ReasoningStep = {
  id: string;
  kind: "thought" | "action" | "observation" | "conclusion";
  content: string;
  timestamp: string;
};

export type AiTask = {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed" | "retrying";
  dependsOn: string[];
  agentId: AiAgentId | null;
  progress: number;
  retryCount: number;
};

export type ExecutionPlan = {
  id: string;
  goal: string;
  tasks: AiTask[];
  status: "draft" | "running" | "completed" | "failed";
};

export type WorkflowNode =
  | { id: string; type: "agent"; agentId: AiAgentId; config: Record<string, string> }
  | { id: string; type: "condition"; expression: string; trueBranch: string; falseBranch: string }
  | { id: string; type: "parallel"; childIds: string[] };

export type Workflow = {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  mode: "sequential" | "parallel" | "conditional";
  status: "idle" | "running" | "completed" | "failed";
};

export type InferenceJob = {
  id: string;
  providerId: AiProviderId;
  modelId: string;
  agentId: AiAgentId | null;
  prompt: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  priority: number;
  createdAt: string;
  latencyMs: number | null;
  tokenUsage: TokenUsage | null;
};

export type AiRequest = {
  id: string;
  providerId: AiProviderId;
  modelId: string;
  agentId: AiAgentId | null;
  prompt: string;
  status: "success" | "error" | "fallback";
  latencyMs: number;
  tokenUsage: TokenUsage;
  costUsd: number;
  timestamp: string;
};

export type SafetyCheckResult = {
  allowed: boolean;
  reason: string | null;
  auditId: string;
};

export type RateLimitState = {
  providerId: AiProviderId;
  requestsRemaining: number;
  resetAt: string;
};

export type ProviderFallbackChain = {
  primary: AiProviderId;
  fallbacks: AiProviderId[];
};

export type MonitoringSnapshot = {
  latencyP50Ms: number;
  latencyP95Ms: number;
  totalCostUsd: number;
  totalTokens: number;
  requestCount: number;
  providerStatus: Record<AiProviderId, AiProvider["status"]>;
};
