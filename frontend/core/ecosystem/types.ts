/** OmniMind Enterprise Ecosystem OS — shared types. */

import type { OmniToolSlug } from "../omnicore/types";

export type EcosystemActivityKind =
  | "download"
  | "upload"
  | "render"
  | "ai-task"
  | "training"
  | "deployment"
  | "notification"
  | "error"
  | "warning"
  | "update"
  | "system";

export type EcosystemActivity = {
  id: string;
  kind: EcosystemActivityKind;
  title: string;
  detail?: string;
  progress?: number;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  toolSlug?: OmniToolSlug | null;
  createdAt: string;
  updatedAt: string;
};

export type SystemResourceSnapshot = {
  cpuPercent: number | null;
  gpuPercent: number | null;
  ramUsedMb: number | null;
  ramTotalMb: number | null;
  storageUsedGb: number | null;
  storageTotalGb: number | null;
  networkMbps: number | null;
  aiTokensToday: number;
  providerUsage: Record<string, number>;
  runningModels: string[];
  workers: number;
  processes: number;
  renderQueue: number;
  videoQueue: number;
  audioQueue: number;
  uptimeSeconds: number;
};

export type AITaskRecord = {
  id: string;
  label: string;
  status: "queued" | "running" | "completed" | "cancelled" | "failed";
  progress: number;
  toolSlug?: string;
  providerId?: string;
  modelId?: string;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  exportable: boolean;
};

export type BackgroundAgentJob = {
  id: string;
  kind: "code" | "video" | "music" | "train" | "deploy" | "report";
  label: string;
  toolSlug: OmniToolSlug | string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  detached: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LiveNotificationChannel = "desktop" | "browser" | "email" | "push" | "mobile";

export type LiveNotification = {
  id: string;
  title: string;
  body: string;
  level: "success" | "error" | "progress" | "info" | "warn";
  channels: LiveNotificationChannel[];
  progress?: number;
  read: boolean;
  createdAt: string;
};

export type SidebarPin = {
  id: string;
  toolSlug: OmniToolSlug | string;
  href: string;
  label: string;
  pinned: boolean;
  favorite: boolean;
  order: number;
};

export type HubConnection = {
  fromTool: OmniToolSlug | string;
  toTool: OmniToolSlug | string;
  sharedMemory: boolean;
  sharedAssets: boolean;
  sharedHistory: boolean;
  sharedAI: boolean;
};

export type HomeDashboardSnapshot = {
  recentProjects: ReturnType<import("../omnicore/OmniProjectHub").OmniProjectHub["listRecent"]>;
  pinnedProjects: ReturnType<import("../omnicore/OmniProjectHub").OmniProjectHub["listPinned"]>;
  recommendations: { id: string; text: string; action?: string }[];
  continueWorking: { projectId: string; toolSlug: string; label: string } | null;
  recentChats: { id: string; title: string; toolSlug: string; updatedAt: string }[];
  systemHealth: { score: number; label: string; checks: { name: string; ok: boolean }[] };
  aiActivity: { requestCount: number; latencyP50Ms: number };
  runningTasks: AITaskRecord[];
  backgroundJobs: BackgroundAgentJob[];
  notifications: LiveNotification[];
  updates: { id: string; title: string; version: string }[];
  quickLaunch: { id: string; label: string; href: string; toolSlug: string }[];
  favorites: { id: string; label: string; href: string }[];
  recentFiles: { id: string; name: string; path: string }[];
  calendar: { id: string; title: string; at: string }[];
  goals: { id: string; title: string; progress: number }[];
};

export type ProjectManagerView = {
  projectId: string;
  timeline: EcosystemActivity[];
  assets: unknown[];
  history: unknown[];
  contributors: { id: string; name: string; role: string }[];
  deployments: unknown[];
  analytics: { metric: string; value: number }[];
  memory: unknown[];
  aiContext: string;
};
