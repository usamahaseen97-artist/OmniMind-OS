import type { PipelineRun, PipelineStage } from "./types";
import { PIPELINE_STAGES } from "./constants";

export class AssetPipelineEngine {
  start(projectId: string): PipelineRun {
    return {
      id: `pipe-${Date.now()}`,
      projectId,
      currentStage: "project",
      stages: PIPELINE_STAGES.map((s, i) => ({
        stage: s.id,
        status: i === 0 ? "active" : "pending",
      })),
      progress: 0,
    };
  }

  advance(run: PipelineRun): PipelineRun {
    const idx = run.stages.findIndex((s) => s.status === "active");
    if (idx < 0) return run;
    const stages = run.stages.map((s, i) => {
      if (i < idx) return { ...s, status: "done" as const };
      if (i === idx) return { ...s, status: "done" as const };
      if (i === idx + 1) return { ...s, status: "active" as const };
      return s;
    });
    const nextStage = stages.find((s) => s.status === "active")?.stage ?? "publishing";
    return { ...run, stages, currentStage: nextStage as PipelineStage, progress: Math.min(100, run.progress + 12) };
  }
}

export const assetPipelineEngine = new AssetPipelineEngine();
