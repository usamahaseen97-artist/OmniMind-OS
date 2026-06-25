/** OmniCloud Platform — V2.0 cloud-native types. */

export type CloudDeviceKind = "desktop" | "laptop" | "tablet" | "android" | "iphone" | "web" | "other";

export type CloudDevice = {
  id: string;
  name: string;
  kind: CloudDeviceKind;
  trusted: boolean;
  lastSeenAt: string;
  fingerprint: string;
};

export type CloudSession = {
  id: string;
  deviceId: string;
  userId: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
};

export type CloudAccount = {
  id: string;
  email: string;
  displayName: string;
  devices: CloudDevice[];
  sessions: CloudSession[];
  plan: "free" | "pro" | "enterprise";
};

export type SyncDomain =
  | "projects"
  | "ai-chats"
  | "ai-memory"
  | "settings"
  | "themes"
  | "plugins"
  | "sdk"
  | "templates"
  | "assets"
  | "images"
  | "videos"
  | "music"
  | "documents"
  | "workspaces"
  | "shortcuts"
  | "preferences";

export type SyncResult = {
  domain: SyncDomain;
  status: "synced" | "queued" | "conflict" | "error";
  itemCount: number;
  at: string;
};

export type ProjectCloudSnapshot = {
  id: string;
  projectId: string;
  version: number;
  label: string;
  createdAt: string;
  sizeBytes: number;
};

export type MemoryCloudEntry = {
  id: string;
  scope: "universal" | "project" | "workspace" | "agent";
  key: string;
  value: string;
  toolSlug: string | null;
  encrypted: boolean;
  updatedAt: string;
};

export type RemoteJobKind =
  | "render-image"
  | "render-video"
  | "generate-code"
  | "deploy-website"
  | "train-model"
  | "marketing"
  | "medical-analysis"
  | "music-production"
  | "large-file";

export type RemoteJob = {
  id: string;
  kind: RemoteJobKind;
  label: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  etaSeconds: number | null;
  logs: string[];
  resourceUsage: { cpu: number | null; memoryMb: number | null };
  createdAt: string;
  updatedAt: string;
};

export type StorageBucket = {
  id: string;
  kind: "files" | "assets" | "media" | "backup" | "encrypted";
  usedBytes: number;
  quotaBytes: number;
  cdnEnabled: boolean;
};

export type CloudAdminDashboard = {
  usage: { storageBytes: number; bandwidthBytes: number; apiCalls: number };
  devices: number;
  organizations: number;
  subscriptions: { plan: string; active: boolean }[];
  securityEvents: number;
};

export type OfflineQueueItem = {
  id: string;
  domain: SyncDomain;
  operation: "upload" | "download";
  payloadRef: string;
  queuedAt: string;
};

export type ConflictResolution = "local-wins" | "remote-wins" | "merge";
