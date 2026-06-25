import type {
  AiAgent,
  AiAgentId,
  AiCompletionResult,
  AiModel,
  AiProvider,
  InferenceJob,
  MonitoringSnapshot,
} from "../../core/ai/types";
import type { CompleteOptions } from "../../core/ai/OmniAI";

export type OmniCoreAiContextSlice = {
  aiReady: boolean;
  aiVersion: string;
  aiAgents: AiAgent[];
  activeAgentId: AiAgentId | null;
  selectAgent: (id: AiAgentId) => void;
  aiModels: AiModel[];
  activeModelId: string;
  setActiveModel: (id: string) => void;
  aiProviders: AiProvider[];
  aiComplete: (prompt: string, opts?: CompleteOptions) => Promise<AiCompletionResult | null>;
  aiMonitoring: MonitoringSnapshot;
  inferenceQueue: InferenceJob[];
};
