import type { SpecialistAgent, SpecialistAgentId } from "../types";

export const SPECIALIST_AGENTS: SpecialistAgent[] = [
  { id: "architect", title: "Architect", specialty: "System & structural design", pipelineStages: ["plan", "choose_tool"] },
  { id: "planner", title: "Planner", specialty: "Task decomposition", pipelineStages: ["understand", "plan"] },
  { id: "researcher", title: "Researcher", specialty: "Market & domain research", pipelineStages: ["understand", "reason"] },
  { id: "developer", title: "Developer", specialty: "Code & APIs", pipelineStages: ["execute", "improve"] },
  { id: "designer", title: "Designer", specialty: "UI, brand, media", pipelineStages: ["execute"] },
  { id: "analyst", title: "Analyst", specialty: "Data & insights", pipelineStages: ["reason", "validate"] },
  { id: "editor", title: "Editor", specialty: "Copy & content", pipelineStages: ["improve", "return_result"] },
  { id: "reviewer", title: "Reviewer", specialty: "Quality assurance", pipelineStages: ["validate"] },
  { id: "security", title: "Security", specialty: "Auth & compliance", pipelineStages: ["validate"] },
  { id: "devops", title: "DevOps", specialty: "Deploy & infra", pipelineStages: ["execute"] },
  { id: "documentation", title: "Documentation", specialty: "Guides & API docs", pipelineStages: ["return_result"] },
];

export function specialistForId(id: SpecialistAgentId): SpecialistAgent | undefined {
  return SPECIALIST_AGENTS.find((a) => a.id === id);
}

export function specialistsForStage(stageId: string): SpecialistAgent[] {
  return SPECIALIST_AGENTS.filter((a) => a.pipelineStages.includes(stageId as SpecialistAgent["pipelineStages"][number]));
}
