import type { Brain2ReasoningStage, Brain2ReasoningStageId } from "./types";

const STAGES: { id: Brain2ReasoningStageId; label: string }[] = [
  { id: "understanding", label: "Understanding" },
  { id: "planning", label: "Planning" },
  { id: "research", label: "Research" },
  { id: "execution", label: "Execution" },
  { id: "validation", label: "Validation" },
  { id: "review", label: "Review" },
  { id: "optimization", label: "Optimization" },
  { id: "final_response", label: "Final Response" },
];

export function createReasoningStages(): Brain2ReasoningStage[] {
  return STAGES.map((s) => ({ ...s, status: "pending" }));
}

export function activateReasoningStage(
  stages: Brain2ReasoningStage[],
  id: Brain2ReasoningStageId,
  message?: string,
): Brain2ReasoningStage[] {
  const idx = stages.findIndex((s) => s.id === id);
  return stages.map((s, i) => {
    if (i < idx && s.status !== "error") return { ...s, status: "done" as const };
    if (s.id === id) return { ...s, status: "active" as const, message };
    return s;
  });
}

export function completeReasoningStage(
  stages: Brain2ReasoningStage[],
  id: Brain2ReasoningStageId,
  message?: string,
): Brain2ReasoningStage[] {
  return stages.map((s) => (s.id === id ? { ...s, status: "done" as const, message: message ?? s.message } : s));
}

export function finishReasoningStages(stages: Brain2ReasoningStage[]): Brain2ReasoningStage[] {
  return stages.map((s) => ({ ...s, status: s.status === "error" ? "error" : "done" }));
}
