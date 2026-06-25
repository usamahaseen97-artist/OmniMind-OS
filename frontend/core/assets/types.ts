/** OmniCore Assets Platform — universal project, asset & storage types (Phase 3). */

export type AssetKind =
  | "image"
  | "video"
  | "audio"
  | "model-3d"
  | "document"
  | "source-code"
  | "dataset"
  | "medical-report"
  | "business-report"
  | "ai-output"
  | "design"
  | "brand"
  | "template"
  | "plugin";

export type OmniAsset = {
  id: string;
  name: string;
  kind: AssetKind;
  mimeType: string;
  sizeBytes: number;
  projectId: string | null;
  toolSlug: string | null;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  collectionIds: string[];
  metadata: Record<string, string>;
  version: number;
  createdAt: string;
  modifiedAt: string;
  previewUrl: string | null;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  toolSlugs: string[];
  defaultMetadata: Record<string, string>;
};

export type UniversalProject = {
  id: string;
  name: string;
  description: string;
  kind: "universal" | "cross-tool" | "tool-scoped";
  toolSlugs: string[];
  templateId: string | null;
  archived: boolean;
  metadata: Record<string, string>;
  assetIds: string[];
  version: number;
  snapshotIds: string[];
  createdAt: string;
  modifiedAt: string;
};

export type ProjectSnapshot = {
  id: string;
  projectId: string;
  label: string;
  version: number;
  createdAt: string;
  assetCount: number;
};

export type VersionEntry = {
  id: string;
  targetType: "project" | "asset";
  targetId: string;
  version: number;
  label: string;
  createdAt: string;
  sizeBytes: number;
};

export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  assetId: string | null;
  children?: FileNode[];
};

export type ExplorerView = "tree" | "grid" | "list";

export type ExplorerSort = "name" | "modified" | "size" | "kind";

export type SmartFolder = {
  id: string;
  name: string;
  filter: { kind?: AssetKind; tags?: string[]; toolSlug?: string };
};

export type AssetCollection = {
  id: string;
  name: string;
  description: string;
  assetIds: string[];
  smart: boolean;
};

export type SearchIndexEntry = {
  id: string;
  targetType: "project" | "asset" | "metadata";
  targetId: string;
  title: string;
  body: string;
  tags: string[];
  toolSlug: string | null;
  score: number;
};

export type AssetSearchFilter = {
  kind?: AssetKind;
  toolSlug?: string;
  tags?: string[];
  projectId?: string;
  query?: string;
};

export type SyncItem = {
  id: string;
  path: string;
  direction: "upload" | "download";
  status: "queued" | "running" | "completed" | "failed" | "conflict";
  progress: number;
  conflictWith: string | null;
};

export type CloudSyncState = {
  enabled: boolean;
  offline: boolean;
  quotaBytes: number;
  usedBytes: number;
  lastSyncAt: string | null;
  queue: SyncItem[];
};

export type BackupPoint = {
  id: string;
  label: string;
  kind: "auto" | "manual";
  createdAt: string;
  sizeBytes: number;
  integrityOk: boolean;
};

export type RecoveryPoint = {
  id: string;
  backupId: string;
  label: string;
  createdAt: string;
};

export type ImportJob = {
  id: string;
  source: "drag-drop" | "zip" | "folder" | "bulk";
  status: "queued" | "running" | "completed" | "failed";
  fileCount: number;
  progress: number;
};

export type ExportJob = {
  id: string;
  format: "zip" | "folder" | "template";
  status: "queued" | "running" | "completed" | "failed";
  assetIds: string[];
  progress: number;
};

export type PreviewResult = {
  assetId: string;
  kind: AssetKind;
  thumbnailUrl: string | null;
  metadata: Record<string, string>;
};

export type ActivityEvent = {
  id: string;
  action: string;
  targetType: "project" | "asset" | "backup";
  targetId: string;
  timestamp: string;
};

export type StorageKey = string;

export type BranchPlaceholder = {
  id: string;
  projectId: string;
  name: string;
  headVersion: number;
};
