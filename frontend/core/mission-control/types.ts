/** OmniMind V2.0 Mission Control — shared types. */

export type AgentControlState =
  | "idle"
  | "thinking"
  | "planning"
  | "executing"
  | "reviewing"
  | "waiting"
  | "completed"
  | "failed"
  | "retrying";

export type TerminalKind =
  | "backend"
  | "frontend"
  | "sdk"
  | "docker"
  | "cloud"
  | "database"
  | "ai"
  | "gateway";

export type BackgroundJobKind =
  | "video-render"
  | "image-generation"
  | "music-generation"
  | "website-generation"
  | "deployment"
  | "medical-analysis"
  | "ai-research"
  | "marketing"
  | "automation";

export type LogSource =
  | "frontend"
  | "backend"
  | "gateway"
  | "sdk"
  | "ai"
  | "automation"
  | "plugins"
  | "cloud";

export type ServiceStatus = "online" | "degraded" | "offline" | "unknown";

export type LiveSystemSnapshot = {
  cpuPercent: number | null;
  gpuPercent: number | null;
  ramUsedMb: number | null;
  ramTotalMb: number | null;
  storageUsedGb: number | null;
  storageTotalGb: number | null;
  networkMbps: number | null;
  backgroundTasks: number;
  runningProcesses: number;
  sdk: ServiceStatus;
  api: ServiceStatus;
  database: ServiceStatus;
  gateway: ServiceStatus;
  aiProviders: { id: string; status: ServiceStatus }[];
  plugins: { id: string; enabled: boolean; status: ServiceStatus }[];
  cloud: ServiceStatus;
  updatedAt: string;
};

export type AIAgentRow = {
  id: string;
  name: string;
  toolSlug: string;
  state: AgentControlState;
  taskLabel: string | null;
  progress: number;
  priority: number;
  updatedAt: string;
};

export type ProjectCommandRow = {
  projectId: string;
  name: string;
  progress: number;
  healthScore: number;
  errors: number;
  warnings: number;
  deploymentStatus: string;
  assetCount: number;
  memoryEntries: number;
  aiContextPreview: string;
};

export type TerminalLine = {
  id: string;
  terminal: TerminalKind;
  text: string;
  level: "info" | "warn" | "error";
  at: string;
};

export type BackgroundJobRow = {
  id: string;
  kind: BackgroundJobKind;
  label: string;
  status: string;
  progress: number;
  toolSlug: string;
  startedAt: string;
};

export type ResourceSnapshot = {
  cpuPercent: number | null;
  gpuPercent: number | null;
  memoryMb: number | null;
  diskGb: number | null;
  bandwidthMbps: number | null;
  modelUsage: Record<string, number>;
  tokenUsage: number;
  aiCostUsd: number;
  cacheHitRate: number | null;
  workers: number;
};

export type SecurityCenterSnapshot = {
  threats: number;
  permissionRequests: number;
  pluginAccessEvents: number;
  apiUsageCount: number;
  failedLogins: number;
  events: { id: string; severity: string; detail: string; at: string }[];
  auditLogs: { id: string; action: string; actor: string; at: string }[];
};

export type SystemLogEntry = {
  id: string;
  source: LogSource;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  at: string;
};

export type AnalyticsSeries = {
  label: string;
  points: { t: string; v: number }[];
};

export type HealthScores = {
  overall: number;
  performance: number;
  security: number;
  reliability: number;
  ai: number;
  infrastructure: number;
};

export type MissionControlDashboard = {
  system: LiveSystemSnapshot;
  workspace: { activeProjectId: string | null; toolCount: number; sessionId: string | null };
  projects: ProjectCommandRow[];
  ai: { agents: AIAgentRow[]; requestCount: number; latencyP50: number };
  cloud: { syncEnabled: boolean; lastSyncAt: string | null; status: ServiceStatus };
  security: SecurityCenterSnapshot;
  health: HealthScores;
  backgroundJobs: BackgroundJobRow[];
  resources: ResourceSnapshot;
  quickActions: { id: string; label: string; action: string }[];
};
