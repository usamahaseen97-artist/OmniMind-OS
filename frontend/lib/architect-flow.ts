/**
 * OmniMind V11 Lead Architect — interactive wizard payloads (JSON → clickable UI).
 */

import type { GeneratedFileAsset } from "./execution-preview";

export type ArchitectStep = 1 | 2 | 3 | 4 | 5 | 6;

export type ArchitectChoiceOption = {
  id: string;
  label: string;
  description: string;
  stack?: string[];
  recommended?: boolean;
  requiresEmail?: boolean;
  provider?: string;
  defaultPort?: number;
  bestFor?: string[];
};

export type ArchitectChoiceAction = {
  id: string;
  label: string;
  requiresSelection?: boolean;
  requiresConfirmation?: boolean;
  value?: string;
};

export type ArchitectChoicePayload = {
  type: "omnimind_architect_choice";
  step: ArchitectStep;
  phase: "analyze" | "frontend" | "backend" | "database" | "codegen" | "deployment";
  title: string;
  subtitle?: string;
  multiSelect?: boolean;
  options: ArchitectChoiceOption[];
  actions?: ArchitectChoiceAction[];
  emailPrompt?: {
    showWhen: string[];
    field: "email";
    label: string;
    placeholder: string;
    validation: "email";
  };
  lockedUntilSteps?: number[];
};

export type ArchitectFlowSelections = {
  projectPrompt: string;
  frontendId?: string;
  backendId?: string;
  databaseId?: string;
  email?: string;
  deployId?: string;
};

export type ArchitectFlowResult = {
  selections: ArchitectFlowSelections;
  files: GeneratedFileAsset[];
  dbInjected: boolean;
  deployRecommendation: string;
};

const ARCHITECT_WIZARD_ROUTES = new Set([
  "omniforge-engine",
  "app-and-develop",
  "game-app-architect",
  "business-software-architect",
]);

export function isArchitectWizardRoute(routeId: string): boolean {
  return ARCHITECT_WIZARD_ROUTES.has(routeId);
}

export type ArchitectBuildMode = "app" | "game";

export function getArchitectStepPayload(
  step: ArchitectStep,
  selections: ArchitectFlowSelections,
  mode: ArchitectBuildMode = "app",
): ArchitectChoicePayload {
  switch (step) {
    case 2: {
      const baseOptions: ArchitectChoiceOption[] = [
        {
          id: "nextjs",
          label: "Next.js",
          description: "SSR, App Router, Vercel deploy — SaaS & dashboards",
          stack: ["React 19", "TypeScript", "Tailwind"],
          recommended: mode === "app",
        },
        {
          id: "react-vite",
          label: "React",
          description: "SPA, tez dev server — dashboards & tools",
          stack: ["React", "TypeScript", "Vite"],
        },
        {
          id: "vanilla",
          label: "HTML5",
          description: "Zero build — landing pages & simple games",
          stack: ["HTML5", "CSS3", "ES Modules"],
        },
      ];
      const gameOptions: ArchitectChoiceOption[] = [
        {
          id: "phaser",
          label: "Phaser 3",
          description: "2D browser games — arcade, platformer, puzzle",
          stack: ["Canvas/WebGL"],
          recommended: mode === "game",
        },
        {
          id: "threejs",
          label: "Three.js",
          description: "3D web experiences & game prototypes",
          stack: ["React Three Fiber", "WebGL"],
        },
      ];
      const options = mode === "game" ? [...baseOptions, ...gameOptions] : baseOptions;
      return {
        type: "omnimind_architect_choice",
        step: 2,
        phase: "frontend",
        title: "Which frontend would you like?",
        subtitle: mode === "game" ? "Game UI & engine" : "App / website UI",
        multiSelect: false,
        options,
        actions: [
          { id: "confirm_frontend", label: "Confirm Frontend", requiresSelection: true },
          { id: "skip_default", label: mode === "game" ? "Default (Phaser)" : "Default (Next.js)", value: mode === "game" ? "phaser" : "nextjs" },
        ],
      };
    }
    case 3:
      return {
        type: "omnimind_architect_choice",
        step: 3,
        phase: "backend",
        title: "Backend stack select karein",
        subtitle: "API, auth, business logic",
        multiSelect: false,
        options: [
          {
            id: "fastapi",
            label: "Python FastAPI",
            description: "OmniMind default — Gemini agents, streaming, MongoDB",
            stack: ["Uvicorn", "Pydantic", "SSE"],
            recommended: true,
            defaultPort: 8001,
          },
          {
            id: "express",
            label: "Node.js Express",
            description: "JavaScript full-stack, npm ecosystem",
            stack: ["Express", "TypeScript"],
          },
          {
            id: "nestjs",
            label: "NestJS",
            description: "Enterprise APIs, modules, DI",
            stack: ["NestJS", "TypeScript"],
          },
          {
            id: "serverless",
            label: "Serverless (Edge)",
            description: "Vercel/Netlify functions — chhote apps",
            stack: ["Edge runtime", "Supabase client"],
          },
          {
            id: "static_only",
            label: "No backend",
            description: "Client-only / third-party APIs",
            stack: [],
          },
        ],
        actions: [
          { id: "confirm_backend", label: "Confirm Backend", requiresSelection: true },
          { id: "skip_default", label: "Default (FastAPI)", value: "fastapi" },
        ],
      };
    case 4:
      return {
        type: "omnimind_architect_choice",
        step: 4,
        phase: "database",
        title: "Database setup kaise karein?",
        subtitle: selections.projectPrompt
          ? `Project: ${selections.projectPrompt.slice(0, 80)}${selections.projectPrompt.length > 80 ? "…" : ""}`
          : undefined,
        multiSelect: false,
        options: [
          {
            id: "manual",
            label: "Manual setup",
            description: "Main `.env` template dunga — aap khud connect karenge",
            requiresEmail: false,
          },
          {
            id: "managed_supabase",
            label: "Tum sab krdo — Supabase",
            description: "Auth + Postgres — email par managed project",
            requiresEmail: true,
            provider: "supabase",
          },
          {
            id: "managed_mongo",
            label: "Tum sab krdo — MongoDB Atlas",
            description: "Document DB cluster auto-provision",
            requiresEmail: true,
            provider: "mongodb_atlas",
          },
          {
            id: "sqlite_local",
            label: "Local SQLite (dev)",
            description: "Zero cloud — single-file DB for prototyping",
            requiresEmail: false,
          },
        ],
        actions: [{ id: "confirm_database", label: "Confirm Database", requiresSelection: true }],
        emailPrompt: {
          showWhen: ["managed_supabase", "managed_mongo"],
          field: "email",
          label: "Email address (cluster invite / silent inject)",
          placeholder: "you@example.com",
          validation: "email",
        },
      };
    case 6:
      return {
        type: "omnimind_architect_choice",
        step: 6,
        phase: "deployment",
        title: "Deployment target",
        subtitle: `${selections.frontendId ?? "nextjs"} + ${selections.backendId ?? "fastapi"}`,
        multiSelect: false,
        lockedUntilSteps: [2, 3, 4, 5],
        options: [
          {
            id: "vercel",
            label: "Vercel",
            description: "Best for Next.js & serverless APIs",
            bestFor: ["nextjs", "serverless"],
          },
          {
            id: "netlify",
            label: "Netlify",
            description: "Static + edge functions",
            bestFor: ["react-vite", "vanilla"],
          },
          {
            id: "aws",
            label: "AWS (Amplify / EC2)",
            description: "FastAPI, games, full control",
            bestFor: ["fastapi", "nestjs", "phaser"],
          },
          {
            id: "local_only",
            label: "Local dev only",
            description: "Abhi deploy nahi — scaffold download karein",
            bestFor: ["all"],
          },
        ],
        actions: [
          { id: "confirm_deploy", label: "Confirm & show deploy steps", requiresSelection: true },
          {
            id: "trigger_build_cli",
            label: "Deploy Now",
            requiresConfirmation: true,
            requiresSelection: true,
          },
        ],
      };
    default:
      return {
        type: "omnimind_architect_choice",
        step: 1,
        phase: "analyze",
        title: "Project describe karein",
        subtitle: "Kya app, website, ya game banana hai?",
        multiSelect: false,
        options: [],
        actions: [{ id: "continue_analyze", label: "Continue to stack selection" }],
      };
  }
}

export function buildScaffoldMessage(selections: ArchitectFlowSelections): string {
  const parts = [
    selections.projectPrompt.trim(),
    `Frontend: ${selections.frontendId ?? "nextjs"}`,
    `Backend: ${selections.backendId ?? "fastapi"}`,
    `Database: ${selections.databaseId ?? "manual"}`,
  ];
  if (selections.email) parts.push(`Contact: ${selections.email}`);
  return parts.filter(Boolean).join("\n");
}

export function deployStepsForTarget(
  deployId: string,
  selections: ArchitectFlowSelections,
): string[] {
  const slug = "omnimind-app";
  switch (deployId) {
    case "vercel":
      return [
        "npm install -g vercel",
        `cd ${slug} && vercel login`,
        "vercel --prod",
        selections.backendId === "fastapi"
          ? "Backend: deploy FastAPI to Railway/Render; set NEXT_PUBLIC_API_URL"
          : "Set env vars in Vercel dashboard → Settings → Environment",
      ];
    case "netlify":
      return [
        `cd ${slug} && npm run build`,
        "npm install -g netlify-cli && netlify login",
        "netlify deploy --prod --dir=dist",
      ];
    case "aws":
      return [
        "Frontend: AWS Amplify connect GitHub repo",
        "Backend: EC2 or ECS with uvicorn on port 8001",
        "Configure ALB + HTTPS + MongoDB Atlas IP allowlist",
      ];
    default:
      return [
        `cd ${slug} && npm install && npm run dev`,
        "Backend: uvicorn main:app --host 127.0.0.1 --port 8001 --reload",
      ];
  }
}

/** Agent/chat helper — embed in assistant markdown as ```json block. */
export function exportArchitectChoiceJson(
  step: ArchitectStep,
  selections: ArchitectFlowSelections,
): string {
  return JSON.stringify(getArchitectStepPayload(step, selections), null, 2);
}

export function parseArchitectChoiceFromContent(
  content: string,
): ArchitectChoicePayload | null {
  const fence = content.match(/```json\s*([\s\S]*?)```/);
  const raw = fence?.[1]?.trim() ?? content.trim();
  if (!raw.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(raw) as ArchitectChoicePayload;
    if (parsed?.type === "omnimind_architect_choice" && parsed.step) return parsed;
  } catch {
    /* not architect JSON */
  }
  return null;
}
