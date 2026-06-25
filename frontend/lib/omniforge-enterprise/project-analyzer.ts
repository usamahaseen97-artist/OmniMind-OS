import type { ProjectType, TechStackSelection } from "../omniforge-engineering/types";
import type { ArchitectBlueprint } from "../omniforge-engineering/types";

export type ProjectBlueprint = ArchitectBlueprint & {
  id: string;
  projectName: string;
  projectType: ProjectType;
  requirements: string[];
  scalability: string;
  securityNotes: string[];
  performanceNotes: string[];
  estimatedMonthlyCostUsd: number;
  dependencies: string[];
  generatedAt: string;
};

export type AnalyzerInput = {
  projectName: string;
  projectType: ProjectType;
  description: string;
  stack: TechStackSelection;
  features: string[];
};

/** Pre-generation project analyzer — produces enterprise blueprint before coding. */
export function analyzeProject(input: AnalyzerInput): ProjectBlueprint {
  const req = extractRequirements(input.description, input.features);
  const folderStructure = defaultFolderStructure(input.projectType, input.stack);
  const db = databasePlan(input.projectType, input.stack.database);
  const cost = estimateCost(input.projectType, input.stack, req.length);

  return {
    id: `bp-${Date.now()}`,
    projectName: input.projectName || "Untitled Project",
    projectType: input.projectType,
    requirements: req,
    architecture: architectureForType(input.projectType, input.stack),
    folderStructure,
    databaseSchema: db,
    apiPlan: apiPlanForType(input.projectType, input.stack.backend),
    authPlan: authPlanForType(input.projectType),
    deploymentPlan: `Deploy via ${input.stack.deployment} with CI/CD pipeline, staging + production environments.`,
    securityPlan: securityPlanForType(input.projectType),
    testingPlan: "Unit, integration, API, E2E, performance, and security test suites auto-generated.",
    performancePlan: "Lazy routes, code splitting, CDN assets, DB indexing, Redis cache layer.",
    scalability: scalabilityForType(input.projectType),
    securityNotes: securityNotesForType(input.projectType),
    performanceNotes: ["Bundle analysis on each build", "Lighthouse CI gate", "API p95 < 200ms target"],
    estimatedMonthlyCostUsd: cost,
    dependencies: defaultDependencies(input.stack),
    generatedAt: new Date().toISOString(),
  };
}

function extractRequirements(description: string, features: string[]): string[] {
  const fromDesc = description
    .split(/[.\n;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
  return [...new Set([...fromDesc, ...features])].slice(0, 12);
}

function defaultFolderStructure(type: ProjectType, _stack: TechStackSelection): string[] {
  const base = ["README.md", "docs/", ".github/workflows/", "docker-compose.yml"];
  if (type === "microservices") {
    return [...base, "services/gateway/", "services/auth/", "services/core/", "packages/shared/"];
  }
  if (type === "game") return [...base, "src/scenes/", "src/assets/", "src/systems/"];
  if (type === "cli_tool") return [...base, "src/cli/", "src/commands/"];
  return [...base, "frontend/", "backend/", "shared/types/", "tests/"];
}

function databasePlan(type: ProjectType, db: string): string {
  if (type === "hospital_system") return `PostgreSQL (${db}) — patients, appointments, labs, audit_log`;
  if (type === "banking_system") return `PostgreSQL (${db}) — accounts, transactions, KYC, ledger`;
  if (type === "ecommerce") return `${db} — products, carts, orders, payments, inventory`;
  return `${db} — users, sessions, core entities with migrations`;
}

function architectureForType(type: ProjectType, stack: TechStackSelection): string {
  return `${type.replace(/_/g, " ")} · ${stack.frontend} + ${stack.backend} · modular monolith or services as needed`;
}

function apiPlanForType(type: ProjectType, backend: string): string {
  return `${backend} REST + OpenAPI · versioned /api/v1 · auth middleware · rate limiting`;
}

function authPlanForType(type: ProjectType): string {
  if (["banking_system", "hospital_system", "erp"].includes(type)) {
    return "OAuth2 + MFA + RBAC + audit trail";
  }
  return "JWT sessions + OAuth providers + role-based access";
}

function securityPlanForType(type: ProjectType): string {
  return "OWASP Top 10 mitigations, secrets via env, CSP headers, input validation, dependency scanning";
}

function securityNotesForType(type: ProjectType): string[] {
  const base = ["HTTPS only", "Dependency audit in CI", "No secrets in client bundle"];
  if (type === "banking_system") return [...base, "PCI-DSS patterns", "Encryption at rest"];
  if (type === "hospital_system") return [...base, "HIPAA-aligned logging", "PHI access controls"];
  return base;
}

function scalabilityForType(type: ProjectType): string {
  if (["saas", "microservices", "ecommerce"].includes(type)) {
    return "Horizontal scaling, stateless API, read replicas, queue workers";
  }
  return "Vertical scaling first; extract services when traffic demands";
}

function estimateCost(type: ProjectType, stack: TechStackSelection, reqCount: number): number {
  let base = 25;
  if (["erp", "hospital_system", "banking_system", "microservices"].includes(type)) base = 120;
  if (stack.deployment === "aws" || stack.deployment === "azure" || stack.deployment === "gcp") base += 40;
  return base + reqCount * 5;
}

function defaultDependencies(stack: TechStackSelection): string[] {
  return [
    stack.frontend,
    stack.backend,
    stack.database,
    stack.orm,
    stack.deployment,
    "typescript",
    "eslint",
    "prettier",
  ];
}
