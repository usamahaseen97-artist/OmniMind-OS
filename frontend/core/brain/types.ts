import type { AgentTaskStatus, IntentMatch } from "../agent/types";

export type BrainPipelineStageId =
  | "understand"
  | "reason"
  | "plan"
  | "choose_tool"
  | "execute"
  | "validate"
  | "improve"
  | "return_result";

export type BrainStageStatus = "pending" | "active" | "done" | "error" | "skipped";

export type BrainPipelineStage = {
  id: BrainPipelineStageId;
  label: string;
  status: BrainStageStatus;
  message?: string;
  startedAt?: string;
  completedAt?: string;
  confidence?: number;
  estimatedMs?: number;
};

export type SpecialistAgentId =
  | "architect"
  | "planner"
  | "researcher"
  | "developer"
  | "designer"
  | "analyst"
  | "editor"
  | "reviewer"
  | "security"
  | "devops"
  | "documentation";

export type SpecialistAgent = {
  id: SpecialistAgentId;
  title: string;
  specialty: string;
  pipelineStages: BrainPipelineStageId[];
};

export type PlannerSubtaskStatus = "queued" | "running" | "completed" | "failed" | "paused";

export type PlannerSubtask = {
  id: string;
  label: string;
  toolId?: string;
  actionId?: string;
  specialistId?: SpecialistAgentId;
  status: PlannerSubtaskStatus;
  progress: number;
  dependsOn: string[];
  estimatedMs?: number;
  startedAt?: string;
  completedAt?: string;
};

export type BrainPlan = {
  id: string;
  goal: string;
  subtasks: PlannerSubtask[];
  confidence: number;
  estimatedTotalMs: number;
  createdAt: string;
};

export type BrainActionStatus = AgentTaskStatus | "paused";

export type BrainAction = {
  id: string;
  label: string;
  toolId?: string;
  status: BrainActionStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
  retryCount: number;
  background: boolean;
  planId?: string;
  subtaskId?: string;
};

export type PermissionActionKind =
  | "delete"
  | "overwrite"
  | "deploy"
  | "database_migration"
  | "system_command";

export type PermissionRequest = {
  id: string;
  kind: PermissionActionKind;
  title: string;
  description: string;
  toolId?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  resolve: (approved: boolean) => void;
};

export type WorkspaceToolContext = {
  toolId: string;
  summary: string;
  hints: string[];
};

export type BrainRequestContext = {
  activeToolId?: string;
  routeId?: string;
  pathname?: string;
  skipNavigation?: boolean;
};

export type BrainProcessResult = {
  intent: IntentMatch | null;
  routed: boolean;
  navigatedTo?: string;
  workflowStarted?: string;
  plan?: BrainPlan;
  pipeline: BrainPipelineStage[];
  response?: string;
};

export type BrainEventMap = {
  "pipeline:update": BrainPipelineStage[];
  "plan:update": BrainPlan | null;
  "action:update": BrainAction[];
  "permission:request": PermissionRequest;
  "thinking:status": { active: boolean; stage?: BrainPipelineStageId; confidence?: number };
};

export type BrainListener<K extends keyof BrainEventMap> = (payload: BrainEventMap[K]) => void;
