import type { BuildStage, BuildStageId } from "./types";
import type { InternalAgentId } from "./types";

export const BUILD_STAGE_DEFS: { id: BuildStageId; label: string; agentId: InternalAgentId }[] = [
  { id: "planning", label: "Planning", agentId: "planner" },
  { id: "generating", label: "Generating", agentId: "planner" },
  { id: "coding", label: "Coding", agentId: "frontend" },
  { id: "installing", label: "Installing", agentId: "devops" },
  { id: "testing", label: "Testing", agentId: "qa" },
  { id: "running", label: "Running", agentId: "devops" },
  { id: "building", label: "Building", agentId: "devops" },
  { id: "deploying", label: "Deploying", agentId: "devops" },
  { id: "completed", label: "Completed", agentId: "documentation" },
];

export function createInitialBuildStages(): BuildStage[] {
  return BUILD_STAGE_DEFS.map((d) => ({ id: d.id, label: d.label, status: "pending", agentId: d.agentId }));
}

export function activateBuildStage(stages: BuildStage[], stageId: BuildStageId, message?: string): BuildStage[] {
  const idx = stages.findIndex((s) => s.id === stageId);
  if (idx < 0) return stages;
  return stages.map((s, i) => {
    if (i < idx && s.status !== "done" && s.status !== "error") return { ...s, status: "done" as const };
    if (i === idx) return { ...s, status: "active" as const, message };
    return s;
  });
}

export function completeBuildPipeline(stages: BuildStage[]): BuildStage[] {
  return stages.map((s) => ({ ...s, status: s.status === "error" ? "error" : "done" }));
}

const SWARM_AGENT_MAP: Record<string, BuildStageId> = {
  planner: "planning",
  architect: "planning",
  project_manager: "planning",
  frontend: "coding",
  backend: "coding",
  database: "coding",
  ui_designer: "coding",
  devops: "installing",
  qa: "testing",
  security: "testing",
  performance: "building",
  reviewer: "testing",
  documentation: "completed",
};

export function stageFromSwarmAgent(agent: string): BuildStageId {
  const key = agent.toLowerCase().replace(/\s+/g, "_");
  return SWARM_AGENT_MAP[key] ?? "generating";
}

export function stageFromArchitectPhase(phase: string): BuildStageId {
  const p = phase.toLowerCase();
  if (p.includes("plan") || p.includes("architect")) return "planning";
  if (p.includes("generat")) return "generating";
  if (p.includes("file") || p.includes("code")) return "coding";
  if (p.includes("install") || p.includes("dep")) return "installing";
  if (p.includes("test")) return "testing";
  if (p.includes("run")) return "running";
  if (p.includes("build")) return "building";
  if (p.includes("deploy")) return "deploying";
  if (p.includes("done") || p.includes("complete")) return "completed";
  return "generating";
}

export function stageFromFileProgress(index: number, total: number): BuildStageId {
  const pct = (index + 1) / Math.max(total, 1);
  if (pct < 0.15) return "planning";
  if (pct < 0.35) return "generating";
  if (pct < 0.75) return "coding";
  if (pct < 0.85) return "installing";
  if (pct < 0.92) return "testing";
  if (pct < 0.97) return "building";
  return "deploying";
}
