import type { BrainPipelineStage, BrainPipelineStageId } from "../types";

export const PIPELINE_STAGE_DEFS: { id: BrainPipelineStageId; label: string; estimatedMs: number }[] = [
  { id: "understand", label: "Understand", estimatedMs: 400 },
  { id: "reason", label: "Reason", estimatedMs: 600 },
  { id: "plan", label: "Plan", estimatedMs: 800 },
  { id: "choose_tool", label: "Choose Tool", estimatedMs: 300 },
  { id: "execute", label: "Execute", estimatedMs: 1200 },
  { id: "validate", label: "Validate", estimatedMs: 500 },
  { id: "improve", label: "Improve", estimatedMs: 400 },
  { id: "return_result", label: "Return Result", estimatedMs: 200 },
];

export function createPipelineStages(): BrainPipelineStage[] {
  return PIPELINE_STAGE_DEFS.map((d) => ({
    id: d.id,
    label: d.label,
    status: "pending",
    estimatedMs: d.estimatedMs,
  }));
}

export function activateStage(
  stages: BrainPipelineStage[],
  stageId: BrainPipelineStageId,
  message?: string,
  confidence?: number,
): BrainPipelineStage[] {
  const idx = stages.findIndex((s) => s.id === stageId);
  if (idx < 0) return stages;
  const now = new Date().toISOString();
  return stages.map((s, i) => {
    if (i < idx && s.status !== "done" && s.status !== "error") {
      return { ...s, status: "done" as const, completedAt: s.completedAt ?? now };
    }
    if (i === idx) {
      return {
        ...s,
        status: "active" as const,
        message,
        confidence,
        startedAt: now,
      };
    }
    return s;
  });
}

export function completeStage(
  stages: BrainPipelineStage[],
  stageId: BrainPipelineStageId,
  message?: string,
): BrainPipelineStage[] {
  const now = new Date().toISOString();
  return stages.map((s) =>
    s.id === stageId ? { ...s, status: "done" as const, message: message ?? s.message, completedAt: now } : s,
  );
}

export function failStage(stages: BrainPipelineStage[], stageId: BrainPipelineStageId, message: string): BrainPipelineStage[] {
  return stages.map((s) => (s.id === stageId ? { ...s, status: "error" as const, message } : s));
}

export function finishPipeline(stages: BrainPipelineStage[]): BrainPipelineStage[] {
  const now = new Date().toISOString();
  return stages.map((s) => ({
    ...s,
    status: s.status === "error" ? "error" : "done",
    completedAt: s.completedAt ?? now,
  }));
}

export function pipelineConfidence(stages: BrainPipelineStage[]): number {
  const done = stages.filter((s) => s.status === "done").length;
  const active = stages.find((s) => s.status === "active");
  const base = Math.round((done / stages.length) * 100);
  return active?.confidence ?? Math.min(99, base);
}

export function pipelineEtaMs(stages: BrainPipelineStage[]): number {
  return stages
    .filter((s) => s.status === "pending" || s.status === "active")
    .reduce((sum, s) => sum + (s.estimatedMs ?? 500), 0);
}
