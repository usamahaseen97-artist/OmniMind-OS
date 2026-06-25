import type { AgentPermission } from "../../agent/types";

export type Brain2AgentId =
  | "chief_architect"
  | "frontend_engineer"
  | "backend_engineer"
  | "database_engineer"
  | "devops_engineer"
  | "security_engineer"
  | "medical_specialist"
  | "marketing_specialist"
  | "music_producer"
  | "video_editor"
  | "vfx_artist"
  | "business_consultant"
  | "financial_analyst"
  | "quantum_trading_expert"
  | "architectural_designer"
  | "research_scientist"
  | "translator"
  | "legal_assistant"
  | "content_writer"
  | "prompt_engineer"
  | "testing_engineer"
  | "debugger"
  | "performance_engineer"
  | "master_ai";

export type Brain2AgentStatus = "idle" | "selected" | "working" | "waiting" | "done" | "failed";

export type Brain2AgentDefinition = {
  id: Brain2AgentId;
  name: string;
  identity: string;
  capabilities: string[];
  priority: number;
  tools: string[];
  memoryAccess: "read" | "read_write";
  permissionLevel: AgentPermission;
  status: Brain2AgentStatus;
};

export type Brain2ReasoningStageId =
  | "understanding"
  | "planning"
  | "research"
  | "execution"
  | "validation"
  | "review"
  | "optimization"
  | "final_response";

export type Brain2ReasoningStage = {
  id: Brain2ReasoningStageId;
  label: string;
  status: "pending" | "active" | "done" | "error";
  message?: string;
};

export type Brain2Subtask = {
  id: string;
  label: string;
  agentId: Brain2AgentId;
  toolId: string;
  status: "queued" | "running" | "completed" | "failed";
  result?: string;
  parallel: boolean;
};

export type Brain2CollaborationMessage = {
  id: string;
  from: Brain2AgentId;
  to: Brain2AgentId;
  question: string;
  answer?: string;
  at: string;
};

export type Brain2ToolRoute = {
  toolId: string;
  reason: string;
  confidence: number;
  capability?: string;
};

export type Brain2PerformanceMetrics = {
  accuracy: number;
  latencyMs: number;
  toolUsage: number;
  failures: number;
  recovery: number;
  learningScore: number;
  memoryQuality: number;
  reasoningQuality: number;
  updatedAt: string;
};

export type Brain2LiveState = {
  sessionId: string;
  intent: string;
  selectedAgents: Brain2AgentId[];
  subtasks: Brain2Subtask[];
  reasoningStages: Brain2ReasoningStage[];
  collaboration: Brain2CollaborationMessage[];
  memoryUsed: string[];
  runningTools: string[];
  timeline: { at: string; event: string }[];
  tokenUsage: number;
  toolRoute: Brain2ToolRoute | null;
  mergedResponse: string | null;
  provider: string;
  failoverCount: number;
};

export type Brain2Session = {
  id: string;
  text: string;
  live: Brain2LiveState;
  metrics: Brain2PerformanceMetrics;
  startedAt: number;
};

export type Brain2EventMap = {
  "brain2:live": Brain2LiveState;
  "brain2:metrics": Brain2PerformanceMetrics;
  "brain2:collaboration": Brain2CollaborationMessage;
  "brain2:failover": { from: string; to: string; reason: string };
};
