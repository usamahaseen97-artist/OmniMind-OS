/** Shared AI gateway types — neutral layer between core/ai and core/omnicore. */

export type AiProviderId =
  | "openai"
  | "google"
  | "anthropic"
  | "openrouter"
  | "lmstudio"
  | "ollama"
  | "azure-openai"
  | "aws-bedrock"
  | "omni-future"
  | "local";

export type AiAgentId =
  | "forge-agent"
  | "medical-agent"
  | "visionary-agent"
  | "music-agent"
  | "business-agent"
  | "trading-agent"
  | "developer-agent"
  | "research-agent"
  | "writing-agent"
  | "design-agent"
  | string;

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type FormattedResponse = {
  text: string;
  markdown: string;
  structured: Record<string, unknown> | null;
};

export type CompleteOptions = {
  modelId?: string;
  providerId?: AiProviderId;
  agentId?: AiAgentId;
  toolSlug?: string;
  templateId?: string;
  templateVars?: Record<string, string>;
};

export type AiCompletionResult = {
  jobId: string;
  response: FormattedResponse;
  modelId: string;
  providerId: AiProviderId;
  usage: TokenUsage;
  costUsd: number;
  latencyMs: number;
};
