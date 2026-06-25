import type { OmniForgeTargetStack } from "../omniforge-project-profile";
import type { ArchitectAnalysis, ArchitectPlan } from "../omniforge-architect-api";

export type ProjectType =
  | "website"
  | "web_app"
  | "mobile_app"
  | "desktop_app"
  | "api"
  | "microservices"
  | "game"
  | "chrome_extension"
  | "browser_extension"
  | "cli_tool"
  | "ai_agent"
  | "saas"
  | "erp"
  | "crm"
  | "cms"
  | "ecommerce"
  | "portfolio"
  | "landing_page"
  | "hospital_system"
  | "banking_system"
  | "education_platform"
  | "robotics"
  | "iot"
  | "blockchain";

export type StackMode = "ai_recommended" | "manual";

export type FrontendStack = "react" | "nextjs" | "vue" | "angular" | "svelte" | "flutter_web";
export type BackendStack = "fastapi" | "nodejs" | "nestjs" | "express" | "go" | "django" | "laravel" | "aspnet";
export type DatabaseStack =
  | "mongodb"
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "supabase"
  | "firebase"
  | "redis";
export type OrmStack = "prisma" | "sqlalchemy" | "drizzle";
export type DeployStack = "vercel" | "cloudflare" | "railway" | "render" | "docker" | "aws" | "azure" | "gcp";

export type TechStackSelection = {
  mode: StackMode;
  frontend: FrontendStack;
  backend: BackendStack;
  database: DatabaseStack;
  orm: OrmStack;
  deployment: DeployStack;
};

export type WizardStepId =
  | "project_type"
  | "project_name"
  | "description"
  | "stack_mode"
  | "frontend"
  | "backend"
  | "database"
  | "orm"
  | "deployment"
  | "features"
  | "review";

export type WizardState = {
  step: WizardStepId;
  projectType: ProjectType | null;
  projectName: string;
  description: string;
  stack: TechStackSelection;
  features: string[];
  targetStack: OmniForgeTargetStack;
};

export type BuildStageId =
  | "planning"
  | "generating"
  | "coding"
  | "installing"
  | "testing"
  | "running"
  | "building"
  | "deploying"
  | "completed";

export type BuildStageStatus = "pending" | "active" | "done" | "error";

export type BuildStage = {
  id: BuildStageId;
  label: string;
  status: BuildStageStatus;
  message?: string;
  agentId?: string;
};

export type InternalAgentId =
  | "planner"
  | "architect"
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "qa"
  | "security"
  | "documentation"
  | "ui_designer"
  | "performance"
  | "reviewer"
  | "project_manager";

export type PendingFileStatus = "pending" | "accepted" | "rejected" | "regenerating";

export type PendingGeneratedFile = {
  id: string;
  path: string;
  content: string;
  language: string;
  previousContent?: string;
  status: PendingFileStatus;
  reviewScore?: number;
  reviewIssues?: CodeReviewFinding[];
  index: number;
  total: number;
};

export type CodeReviewCategory =
  | "performance"
  | "security"
  | "accessibility"
  | "type_safety"
  | "best_practices"
  | "duplicates"
  | "imports"
  | "routes";

export type CodeReviewFinding = {
  category: CodeReviewCategory;
  line?: number;
  message: string;
  severity: "error" | "warning" | "info";
};

export type ArchitectBlueprint = {
  architecture: string;
  folderStructure: string[];
  databaseSchema: string;
  apiPlan: string;
  authPlan: string;
  deploymentPlan: string;
  securityPlan: string;
  testingPlan: string;
  performancePlan: string;
};

export type EngineeringSession = {
  wizard: WizardState;
  blueprint: ArchitectBlueprint | null;
  analysis: ArchitectAnalysis | null;
  plan: ArchitectPlan | null;
  approved: boolean;
  buildStages: BuildStage[];
  pendingFiles: PendingGeneratedFile[];
  autoFixAttempts: number;
  docsGenerated: boolean;
};

export type ExportFormat = "zip" | "git" | "docker" | "production";
