import type { InternalAgentId } from "./types";

export type InternalAgent = {
  id: InternalAgentId;
  title: string;
  specialty: string;
  phases: string[];
};

/** Specialized agents — Master AI coordinates; user sees unified OmniForge AI. */
export const INTERNAL_AGENTS: InternalAgent[] = [
  { id: "planner", title: "Planner", specialty: "Requirements & milestones", phases: ["planning", "generating"] },
  { id: "architect", title: "System Architect", specialty: "Architecture & scalability", phases: ["planning", "generating"] },
  { id: "frontend", title: "Frontend Engineer", specialty: "UI, components, routing", phases: ["coding"] },
  { id: "backend", title: "Backend Engineer", specialty: "APIs, services, auth", phases: ["coding"] },
  { id: "database", title: "Database Engineer", specialty: "Schema, migrations, queries", phases: ["coding", "installing"] },
  { id: "ui_designer", title: "UI Designer", specialty: "Design systems, accessibility", phases: ["coding", "generating"] },
  { id: "devops", title: "DevOps Engineer", specialty: "CI/CD, containers, deploy", phases: ["installing", "running", "building", "deploying"] },
  { id: "qa", title: "QA Engineer", specialty: "Tests, coverage, regressions", phases: ["testing"] },
  { id: "security", title: "Security Engineer", specialty: "Auth, secrets, OWASP", phases: ["testing", "building"] },
  { id: "performance", title: "Performance Engineer", specialty: "Profiling, bundle, caching", phases: ["building", "testing"] },
  { id: "documentation", title: "Documentation Writer", specialty: "README, API docs, guides", phases: ["completed"] },
  { id: "reviewer", title: "Reviewer", specialty: "Code review, consistency", phases: ["testing", "building"] },
  { id: "project_manager", title: "Project Manager", specialty: "Tasks, progress, delivery", phases: ["planning", "completed"] },
];

export function agentForSwarmName(name: string): InternalAgent | undefined {
  const n = name.toLowerCase();
  return INTERNAL_AGENTS.find(
    (a) => n.includes(a.id) || a.title.toLowerCase().includes(n) || n.includes(a.specialty.toLowerCase().split(" ")[0] ?? ""),
  );
}

export function activeAgentLabel(agentId: InternalAgentId): string {
  return INTERNAL_AGENTS.find((a) => a.id === agentId)?.title ?? "OmniForge AI";
}
