export const MISSION_CONTROL_VERSION = "2.0.0";

export const TERMINAL_LABELS: Record<string, string> = {
  backend: "Backend Terminal",
  frontend: "Frontend Terminal",
  sdk: "SDK Terminal",
  docker: "Docker Terminal",
  cloud: "Cloud Terminal",
  database: "Database Terminal",
  ai: "AI Terminal",
  gateway: "Gateway Terminal",
};

export const QUICK_ACTIONS = [
  { id: "qa-project", label: "Create Project", action: "create-project" },
  { id: "qa-tool", label: "Launch Tool", action: "launch-tool" },
  { id: "qa-deploy", label: "Deploy", action: "deploy" },
  { id: "qa-backup", label: "Backup", action: "backup" },
  { id: "qa-restore", label: "Restore", action: "restore" },
  { id: "qa-sync", label: "Sync", action: "sync" },
  { id: "qa-update", label: "Update", action: "update" },
  { id: "qa-diag", label: "Run Diagnostics", action: "diagnostics" },
  { id: "qa-opt", label: "Optimize Performance", action: "optimize" },
] as const;
