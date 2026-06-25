/** IDE module identifiers — VS-style panel orchestration state. */

export type IdeModuleId =
  | "solution_explorer"
  | "project_explorer"
  | "file_explorer"
  | "database"
  | "api_tester"
  | "git"
  | "extensions"
  | "build"
  | "run"
  | "emulator"
  | "ui_builder"
  | "schema_designer"
  | "game_scene"
  | "enterprise_dashboard"
  | "project_health"
  | "deployment_center"
  | "testing_center";

export type CopilotActionId =
  | "autocomplete"
  | "chat"
  | "optimize"
  | "bugfix"
  | "document"
  | "review"
  | "deploy";

export const IDE_MODULE_LABELS: Record<IdeModuleId, string> = {
  solution_explorer: "Solution Explorer",
  project_explorer: "Project Explorer",
  file_explorer: "File Explorer",
  database: "Database Explorer",
  api_tester: "API Tester",
  git: "Git",
  extensions: "Extensions",
  build: "Build",
  run: "Run",
  emulator: "Emulator",
  ui_builder: "UI Builder",
  schema_designer: "Schema Designer",
  game_scene: "Game Scene",
  enterprise_dashboard: "Project Dashboard",
  project_health: "Project Health",
  deployment_center: "Deployment",
  testing_center: "Testing",
};

export const COPILOT_ACTIONS: { id: CopilotActionId; label: string; prompt: string }[] = [
  { id: "autocomplete", label: "IntelliSense", prompt: "Suggest completions for the current file context." },
  { id: "chat", label: "Chat", prompt: "" },
  { id: "optimize", label: "Optimize", prompt: "Optimize the selected code for performance and readability." },
  { id: "bugfix", label: "Bug Fix", prompt: "Find and fix bugs in the current file." },
  { id: "document", label: "Document", prompt: "Generate documentation for this module." },
  { id: "review", label: "Code Review", prompt: "Perform a senior code review of the workspace." },
  { id: "deploy", label: "Deploy", prompt: "Prepare one-click cloud deployment steps for this project." },
];

export const DEFAULT_BUILD_PORTS = [
  { port: 3000, label: "Next.js Frontend" },
  { port: 8001, label: "Scaffold Engine" },
  { port: 8003, label: "OmniForge API" },
  { port: 8091, label: "Terminal WS" },
];
