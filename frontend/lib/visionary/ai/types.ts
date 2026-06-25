/** Visionary Studio — AI Creative Engine types (Phase 2). Provider-independent. */

export type AIWorkflowKind =
  | "text-to-image"
  | "text-to-video"
  | "image-to-image"
  | "image-to-video"
  | "text-to-3d"
  | "text-to-logo"
  | "text-to-product-mockup"
  | "text-to-social-post"
  | "text-to-ad-creative"
  | "text-to-storyboard"
  | "text-to-character"
  | "text-to-comic"
  | "text-to-anime"
  | "text-to-cinematic"
  | "text-to-background"
  | "text-to-thumbnail"
  | "text-to-ui-design"
  | "text-to-website"
  | "text-to-app-mockup"
  | "text-to-game-assets";

export type ModelProviderId =
  | "openai"
  | "google"
  | "runway"
  | "stability"
  | "flux"
  | "comfyui"
  | "local"
  | "omni-future";

export type GenerationJobStatus =
  | "queued"
  | "processing"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type GenerationPriority = "low" | "normal" | "high" | "urgent";

export type AspectRatio = "1:1" | "4:3" | "16:9" | "9:16" | "3:2" | "21:9" | "custom";

export type QualityPreset = "draft" | "standard" | "high" | "ultra";

export type PromptVariable = {
  key: string;
  value: string;
  label: string;
};

export type CameraControls = {
  lens: string;
  focalLength: number;
  aperture: string;
  lighting: string;
  mood: string;
  angle: string;
};

export type PromptDraft = {
  id: string;
  positive: string;
  negative: string;
  workflow: AIWorkflowKind;
  variables: PromptVariable[];
  camera: CameraControls;
  aspectRatio: AspectRatio;
  quality: QualityPreset;
  creativity: number;
  seed: number | null;
  cfg: number;
  steps: number;
  referenceImageIds: string[];
  multiPrompts: { text: string; weight: number }[];
  savedAt?: string;
  label?: string;
};

export type GenerationJob = {
  id: string;
  projectId: string;
  workflow: AIWorkflowKind;
  prompt: PromptDraft;
  providerId: ModelProviderId;
  status: GenerationJobStatus;
  priority: GenerationPriority;
  progress: number;
  estimatedSecondsRemaining: number | null;
  cloudRender: boolean;
  gpuSlot: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  outputAssetId: string | null;
};

export type GenerationRecord = {
  id: string;
  jobId: string;
  projectId: string;
  workflow: AIWorkflowKind;
  promptSummary: string;
  providerId: ModelProviderId;
  thumbnailUrl: string | null;
  assetId: string;
  createdAt: string;
  tags: string[];
};

export type VisionaryAsset = {
  id: string;
  projectId: string | null;
  name: string;
  kind: "image" | "video" | "audio" | "3d" | "logo" | "template" | "stock" | "brand";
  mimeType: string;
  sizeBytes: number;
  cloudSynced: boolean;
  source: "generated" | "imported" | "stock" | "brand-kit";
  createdAt: string;
  workflow?: AIWorkflowKind;
};

export type BrandKit = {
  id: string;
  projectId: string;
  logos: { id: string; name: string; variant: string }[];
  fonts: { id: string; family: string; weight: string }[];
  colors: { id: string; hex: string; role: string }[];
  brandVoice: string;
  companyName: string;
  tagline: string;
  autoBrandingEnabled: boolean;
};

export type VisionaryAIProject = {
  id: string;
  name: string;
  collectionId: string | null;
  folderId: string | null;
  modifiedAt: string;
  savedAt: string | null;
  cloudSynced: boolean;
  version: number;
};

export type ProjectCollection = {
  id: string;
  name: string;
  projectIds: string[];
};

export type ProjectFolder = {
  id: string;
  name: string;
  parentId: string | null;
  projectIds: string[];
};

export type ModelProviderDescriptor = {
  id: ModelProviderId;
  label: string;
  workflows: AIWorkflowKind[];
  status: "available" | "unconfigured" | "offline";
};

export type InferenceSlot = {
  id: string;
  label: string;
  providerId: ModelProviderId;
  gpuUtilization: number;
  activeJobId: string | null;
};

export type CloudSyncState = {
  status: "synced" | "syncing" | "offline" | "error";
  lastSyncAt: string | null;
  pendingUploads: number;
  pendingDownloads: number;
};
