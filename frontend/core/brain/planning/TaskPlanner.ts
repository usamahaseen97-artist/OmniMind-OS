import type { IntentMatch } from "../../agent/types";
import type { BrainPlan, PlannerSubtask, SpecialistAgentId } from "../types";

type PlanTemplate = {
  match: RegExp;
  goal: string;
  steps: { label: string; toolId: string; specialistId: SpecialistAgentId; dependsOn?: string[] }[];
};

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    match: /perfume|company|business|brand|e-?commerce/i,
    goal: "Build a complete business",
    steps: [
      { label: "Research market & competitors", toolId: "business-analytics", specialistId: "researcher" },
      { label: "Brand name & positioning", toolId: "digital-marketing-hub", specialistId: "planner", dependsOn: ["st-0"] },
      { label: "Logo & visual identity", toolId: "creative-visionary", specialistId: "designer", dependsOn: ["st-1"] },
      { label: "Website & storefront", toolId: "business-website-builder", specialistId: "developer", dependsOn: ["st-2"] },
      { label: "Backend API", toolId: "omniforge-engine", specialistId: "developer", dependsOn: ["st-3"] },
      { label: "Database schema", toolId: "omniforge-engine", specialistId: "architect", dependsOn: ["st-4"] },
      { label: "Marketing campaign", toolId: "digital-marketing-hub", specialistId: "editor", dependsOn: ["st-3"] },
      { label: "Deployment", toolId: "omniforge-engine", specialistId: "devops", dependsOn: ["st-5"] },
      { label: "Documentation", toolId: "omniforge-engine", specialistId: "documentation", dependsOn: ["st-7"] },
    ],
  },
  {
    match: /full[\s-]?stack|website|web\s*app|scaffold/i,
    goal: "Deliver full-stack application",
    steps: [
      { label: "Architecture plan", toolId: "omniforge-engine", specialistId: "architect" },
      { label: "Frontend scaffold", toolId: "app-website-builder", specialistId: "developer", dependsOn: ["st-0"] },
      { label: "Backend services", toolId: "omniforge-engine", specialistId: "developer", dependsOn: ["st-0"] },
      { label: "Database design", toolId: "omniforge-engine", specialistId: "architect", dependsOn: ["st-2"] },
      { label: "Security review", toolId: "omniforge-engine", specialistId: "security", dependsOn: ["st-3"] },
      { label: "Deploy & export", toolId: "omniforge-engine", specialistId: "devops", dependsOn: ["st-4"] },
    ],
  },
  {
    match: /house|villa|architect|exterior/i,
    goal: "Architectural design delivery",
    steps: [
      { label: "Site research", toolId: "business-analytics", specialistId: "researcher" },
      { label: "Concept design", toolId: "architectural-designer", specialistId: "architect", dependsOn: ["st-0"] },
      { label: "Exterior renders", toolId: "creative-visionary", specialistId: "designer", dependsOn: ["st-1"] },
      { label: "Client presentation", toolId: "digital-marketing-hub", specialistId: "editor", dependsOn: ["st-2"] },
    ],
  },
  {
    match: /video|vfx|cinematic/i,
    goal: "Video production pipeline",
    steps: [
      { label: "Asset ingest", toolId: "vfx-master", specialistId: "editor" },
      { label: "Edit & grade", toolId: "vfx-master", specialistId: "designer", dependsOn: ["st-0"] },
      { label: "Audio mix", toolId: "omnimusic", specialistId: "editor", dependsOn: ["st-1"] },
      { label: "Final review", toolId: "vfx-master", specialistId: "reviewer", dependsOn: ["st-2"] },
    ],
  },
];

const SINGLE_STEP_TOOLS: Record<string, { label: string; specialistId: SpecialistAgentId }> = {
  "business-analytics": { label: "Analyze data & generate report", specialistId: "analyst" },
  "medical-diagnostic": { label: "Run medical diagnostic analysis", specialistId: "analyst" },
  "nasa-solver": { label: "Solve science problem", specialistId: "researcher" },
  "quantum-trading": { label: "Generate trading signals", specialistId: "analyst" },
  omnimusic: { label: "Compose audio", specialistId: "designer" },
  omnitranslator: { label: "Translate content", specialistId: "editor" },
  "creative-visionary": { label: "Generate creative media", specialistId: "designer" },
  "vfx-master": { label: "Process video", specialistId: "editor" },
  "architectural-designer": { label: "Create architectural design", specialistId: "architect" },
  "digital-marketing-hub": { label: "Create marketing assets", specialistId: "editor" },
  "omniforge-engine": { label: "Build software", specialistId: "developer" },
  "app-website-builder": { label: "Build web application", specialistId: "developer" },
  "business-website-builder": { label: "Build business website", specialistId: "developer" },
};

/** Breaks large requests into observable subtasks. */
export class TaskPlanner {
  plan(text: string, intent: IntentMatch | null): BrainPlan {
    const template = PLAN_TEMPLATES.find((t) => t.match.test(text));
    const planId = `plan-${Date.now()}`;

    if (template) {
      const subtasks: PlannerSubtask[] = template.steps.map((step, i) => ({
        id: `st-${i}`,
        label: step.label,
        toolId: step.toolId,
        specialistId: step.specialistId,
        status: i === 0 ? "running" : "queued",
        progress: i === 0 ? 5 : 0,
        dependsOn: step.dependsOn ?? (i > 0 ? [`st-${i - 1}`] : []),
        estimatedMs: 2000 + i * 400,
      }));

      return {
        id: planId,
        goal: template.goal,
        subtasks,
        confidence: intent?.confidence ?? 0.82,
        estimatedTotalMs: subtasks.reduce((s, t) => s + (t.estimatedMs ?? 2000), 0),
        createdAt: new Date().toISOString(),
      };
    }

    const toolId = intent?.toolId ?? "omniforge-engine";
    const single = SINGLE_STEP_TOOLS[toolId] ?? { label: "Execute task", specialistId: "planner" as SpecialistAgentId };

    return {
      id: planId,
      goal: text.slice(0, 80),
      subtasks: [
        {
          id: "st-0",
          label: single.label,
          toolId,
          specialistId: single.specialistId,
          status: "running",
          progress: 10,
          dependsOn: [],
          estimatedMs: 2500,
        },
      ],
      confidence: intent?.confidence ?? 0.7,
      estimatedTotalMs: 2500,
      createdAt: new Date().toISOString(),
    };
  }

  advanceSubtask(plan: BrainPlan, subtaskId: string, status: PlannerSubtask["status"], progress?: number): BrainPlan {
    const subtasks = plan.subtasks.map((st) => {
      if (st.id !== subtaskId) return st;
      return {
        ...st,
        status,
        progress: progress ?? (status === "completed" ? 100 : st.progress),
        completedAt: status === "completed" ? new Date().toISOString() : st.completedAt,
      };
    });

    const idx = plan.subtasks.findIndex((s) => s.id === subtaskId);
    if (status === "completed" && idx >= 0 && idx < plan.subtasks.length - 1) {
      const next = subtasks[idx + 1];
      if (next && next.status === "queued") {
        subtasks[idx + 1] = { ...next, status: "running", progress: 5 };
      }
    }

    return { ...plan, subtasks };
  }
}
