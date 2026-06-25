/** Visionary Studio — unified creative OS types (Phase 1 architecture). */

export type VisionarySidebarModule =
  | "ai-creator"
  | "image-studio"
  | "video-studio"
  | "video-editor"
  | "vfx-studio"
  | "marketing-studio"
  | "brand-studio"
  | "product-studio"
  | "animation-studio"
  | "3d-studio"
  | "social-media-studio"
  | "omni-creator"
  | "templates"
  | "plugins"
  | "cloud-assets"
  | "export-center";

export type InspectorTab =
  | "properties"
  | "materials"
  | "animation"
  | "effects"
  | "ai-suggestions"
  | "history"
  | "assets"
  | "export-settings";

export type CanvasTool =
  | "select"
  | "transform"
  | "crop"
  | "rotate"
  | "scale"
  | "align";

export type TimelineTrackKind =
  | "video"
  | "audio"
  | "image"
  | "text"
  | "effects"
  | "animation"
  | "camera"
  | "voice"
  | "captions";

export type TimelineClip = {
  id: string;
  trackId: string;
  label: string;
  startFrame: number;
  durationFrames: number;
  color: string;
};

export type TimelineTrack = {
  id: string;
  kind: TimelineTrackKind;
  label: string;
  muted: boolean;
  locked: boolean;
  clips: TimelineClip[];
};

export type TimelineMarker = {
  id: string;
  frame: number;
  label: string;
  color: string;
};

export type CanvasLayer = {
  id: string;
  name: string;
  type: "group" | "image" | "video" | "text" | "shape" | "3d";
  visible: boolean;
  locked: boolean;
  opacity: number;
  parentId: string | null;
};

export type HistoryEntry = {
  id: string;
  label: string;
  timestamp: string;
  kind: "edit" | "import" | "transform" | "timeline" | "ai";
};

export type VersionSnapshot = {
  id: string;
  label: string;
  timestamp: string;
  auto: boolean;
};

export type SystemMetrics = {
  gpuPct: number;
  cpuPct: number;
  memoryMb: number;
  memoryTotalMb: number;
  rendering: "idle" | "preview" | "export" | "cloud-sync";
  cloudSync: "synced" | "syncing" | "offline";
  backgroundTasks: number;
};

export type VisionaryProject = {
  id: string;
  name: string;
  resolution: { width: number; height: number };
  fps: number;
  durationFrames: number;
  modifiedAt: string;
  savedAt: string | null;
};

export type CopilotMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
};

export type PanelDockState = {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  timelineCollapsed: boolean;
  assetDrawerOpen: boolean;
};
