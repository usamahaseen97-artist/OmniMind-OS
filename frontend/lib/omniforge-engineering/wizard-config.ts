import type { ProjectType, WizardStepId } from "./types";
import { ENTERPRISE_PROJECT_TYPES } from "../omniforge-enterprise/project-types";

export const PROJECT_TYPE_OPTIONS = ENTERPRISE_PROJECT_TYPES.map((t) => ({
  id: t.id,
  label: t.label,
  hint: t.hint,
}));

export const FRONTEND_OPTIONS = ["react", "nextjs", "vue", "angular", "svelte", "flutter_web"] as const;
export const BACKEND_OPTIONS = ["fastapi", "nodejs", "nestjs", "express", "go", "django", "laravel", "aspnet"] as const;
export const DATABASE_OPTIONS = ["mongodb", "postgresql", "mysql", "sqlite", "supabase", "firebase", "redis"] as const;
export const ORM_OPTIONS = ["prisma", "sqlalchemy", "drizzle"] as const;
export const DEPLOY_OPTIONS = ["vercel", "cloudflare", "railway", "render", "docker", "aws", "azure", "gcp"] as const;

export const WIZARD_STEP_ORDER: WizardStepId[] = [
  "project_type",
  "project_name",
  "description",
  "stack_mode",
  "frontend",
  "backend",
  "database",
  "orm",
  "deployment",
  "features",
  "review",
];

export function nextWizardStep(current: WizardStepId, stackMode: "ai_recommended" | "manual"): WizardStepId | null {
  const idx = WIZARD_STEP_ORDER.indexOf(current);
  if (idx < 0 || idx >= WIZARD_STEP_ORDER.length - 1) return null;
  let next = WIZARD_STEP_ORDER[idx + 1]!;
  if (stackMode === "ai_recommended") {
    while (["frontend", "backend", "database", "orm", "deployment"].includes(next)) {
      const ni = WIZARD_STEP_ORDER.indexOf(next) + 1;
      next = WIZARD_STEP_ORDER[ni] ?? "review";
    }
  }
  return next;
}

export function prevWizardStep(current: WizardStepId, stackMode: "ai_recommended" | "manual"): WizardStepId | null {
  const idx = WIZARD_STEP_ORDER.indexOf(current);
  if (idx <= 0) return null;
  let prev = WIZARD_STEP_ORDER[idx - 1]!;
  if (stackMode === "ai_recommended") {
    while (["frontend", "backend", "database", "orm", "deployment"].includes(prev)) {
      const pi = WIZARD_STEP_ORDER.indexOf(prev) - 1;
      prev = WIZARD_STEP_ORDER[pi] ?? "stack_mode";
    }
  }
  return prev;
}

export function labelForProjectType(id: ProjectType): string {
  return PROJECT_TYPE_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
