import type { OmniForgeTargetStack } from "../omniforge-project-profile";
import type { ProjectType, TechStackSelection } from "./types";

const DEFAULT_STACK: TechStackSelection = {
  mode: "ai_recommended",
  frontend: "nextjs",
  backend: "fastapi",
  database: "postgresql",
  orm: "prisma",
  deployment: "vercel",
};

export function recommendStack(projectType: ProjectType): TechStackSelection {
  const base = { ...DEFAULT_STACK, mode: "ai_recommended" as const };

  switch (projectType) {
    case "game":
      return { ...base, frontend: "react", backend: "nodejs", database: "sqlite", orm: "drizzle", deployment: "docker" };
    case "api":
      return { ...base, frontend: "react", backend: "fastapi", database: "postgresql", orm: "sqlalchemy", deployment: "railway" };
    case "mobile_app":
      return { ...base, frontend: "flutter_web", backend: "nestjs", database: "firebase", orm: "prisma", deployment: "cloudflare" };
    case "desktop_app":
      return { ...base, frontend: "react", backend: "nodejs", database: "sqlite", orm: "drizzle", deployment: "docker" };
    case "chrome_extension":
      return { ...base, frontend: "react", backend: "express", database: "sqlite", orm: "drizzle", deployment: "cloudflare" };
    case "ai_agent":
      return { ...base, frontend: "nextjs", backend: "fastapi", database: "mongodb", orm: "sqlalchemy", deployment: "railway" };
    case "erp":
    case "crm":
    case "saas":
    case "ecommerce":
      return { ...base, frontend: "nextjs", backend: "nestjs", database: "postgresql", orm: "prisma", deployment: "aws" };
    case "portfolio":
    case "landing_page":
    case "website":
      return { ...base, frontend: "nextjs", backend: "fastapi", database: "supabase", orm: "prisma", deployment: "vercel" };
  }

  return base;
}

export function targetStackFromProjectType(projectType: ProjectType): OmniForgeTargetStack {
  if (projectType === "game") return "game";
  if (["erp", "crm", "saas", "ecommerce"].includes(projectType)) return "business";
  if (["api", "ai_agent", "chrome_extension", "desktop_app"].includes(projectType)) return "polyglot";
  return "web";
}

export function composeScaffoldPrompt(
  projectName: string,
  projectType: ProjectType,
  description: string,
  features: string[],
  stack: TechStackSelection,
): string {
  const featureLine = features.length ? `\nFeatures: ${features.join(", ")}` : "";
  return [
    `Build a production-grade ${projectType.replace(/_/g, " ")} called "${projectName}".`,
    description.trim(),
    `Tech stack: ${stack.frontend} frontend, ${stack.backend} backend, ${stack.database} database, ${stack.orm} ORM, deploy to ${stack.deployment}.`,
    featureLine,
    "Include authentication, API routes, database models, tests, and deployment configuration.",
  ]
    .filter(Boolean)
    .join("\n");
}
