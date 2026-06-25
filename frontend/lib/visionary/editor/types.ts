/** Visionary Studio — Professional NLE types (Phase 3). */

export type EditorTrackType =
  | "video"
  | "audio"
  | "subtitle"
  | "overlay"
  | "adjustment";

export type EditTool =
  | "select"
  | "ripple"
  | "slip"
  | "slide"
  | "trim"
  | "razor";

export type PlaybackState = "stopped" | "playing" | "paused";

export type PreviewQuality = "quarter" | "half" | "full" | "proxy";

export type MediaKind =
  | "video"
  | "audio"
  | "image"
  | "gif"
  | "png"
  | "psd"
  | "svg"
  | "3d"
  | "brand";

export type MediaPoolItem = {
  id: string;
  name: string;
  kind: MediaKind;
  durationFrames: number;
  fps: number;
  width: number;
  height: number;
  sizeBytes: number;
  tags: string[];
  favorite: boolean;
  collectionId: string | null;
  importedAt: string;
  thumbnailColor: string;
};

export type EditorClip = {
  id: string;
  trackId: string;
  mediaId: string;
  label: string;
  startFrame: number;
  durationFrames: number;
  inPoint: number;
  outPoint: number;
  color: string;
  nestedSequenceId: string | null;
  effectIds: string[];
  transitionInId: string | null;
  transitionOutId: string | null;
  opacity: number;
  volume: number;
  locked: boolean;
};

export type EditorTrack = {
  id: string;
  type: EditorTrackType;
  label: string;
  index: number;
  muted: boolean;
  solo: boolean;
  locked: boolean;
  visible: boolean;
  height: number;
  clips: EditorClip[];
  nestedSequenceId: string | null;
};

export type EditorTimelineMarker = {
  id: string;
  frame: number;
  label: string;
  color: string;
};

export type EditorTimelineRegion = {
  id: string;
  startFrame: number;
  endFrame: number;
  label: string;
  color: string;
};

export type NestedSequence = {
  id: string;
  name: string;
  durationFrames: number;
  trackIds: string[];
};

export type Keyframe = {
  id: string;
  clipId: string;
  property: string;
  frame: number;
  value: number;
  easing: "linear" | "ease-in" | "ease-out" | "bezier";
};

export type EffectPreset = {
  id: string;
  name: string;
  category: "blur" | "glow" | "sharpen" | "noise" | "film-grain" | "lens" | "bloom" | "motion-blur" | "lighting" | "distortion" | "vintage" | "modern" | "cinematic";
  params: Record<string, number>;
};

export type TransitionPreset = {
  id: string;
  name: string;
  category: "fade" | "cross-dissolve" | "zoom" | "slide" | "whip" | "flash" | "film" | "glitch" | "motion";
  durationFrames: number;
};

export type TextLayer = {
  id: string;
  clipId: string;
  content: string;
  templateId: string | null;
  fontFamily: string;
  fontSize: number;
  color: string;
  alignment: "left" | "center" | "right";
  animated: boolean;
  lowerThird: boolean;
};

export type SubtitleCue = {
  id: string;
  startFrame: number;
  endFrame: number;
  text: string;
  speaker: string | null;
};

export type ColorGrade = {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  saturation: number;
  lutId: string | null;
};

export type AudioMix = {
  clipId: string;
  gainDb: number;
  normalized: boolean;
  noiseReduction: boolean;
  fadeInFrames: number;
  fadeOutFrames: number;
  eqEnabled: boolean;
  compressionEnabled: boolean;
  voiceEnhanceEnabled: boolean;
};

export type ExportPlatform = "youtube" | "tiktok" | "instagram" | "facebook" | "linkedin" | "custom";
export type ExportResolution = "1080p" | "4k" | "8k" | "custom";

export type ExportJob = {
  id: string;
  projectId: string;
  presetId: string;
  platform: ExportPlatform;
  resolution: ExportResolution;
  hdr: boolean;
  status: "queued" | "rendering" | "completed" | "failed" | "cancelled";
  progress: number;
  createdAt: string;
  estimatedSeconds: number | null;
};

export type ExportPreset = {
  id: string;
  label: string;
  platform: ExportPlatform;
  resolution: ExportResolution;
  fps: number;
  hdr: boolean;
};

export type AIEditAction =
  | "detect-silence"
  | "remove-pauses"
  | "auto-cut"
  | "highlight-moments"
  | "auto-captions"
  | "chapter-detection"
  | "b-roll-placeholders"
  | "scene-detection";

export type AIEditTask = {
  id: string;
  action: AIEditAction;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  resultSummary: string | null;
};

export type EditorHistoryEntry = {
  id: string;
  label: string;
  timestamp: string;
  snapshotId: string | null;
};

export type EditorProject = {
  id: string;
  name: string;
  resolution: { width: number; height: number };
  fps: number;
  durationFrames: number;
  tracks: EditorTrack[];
  markers: EditorTimelineMarker[];
  regions: EditorTimelineRegion[];
  nestedSequences: NestedSequence[];
  mediaIds: string[];
  modifiedAt: string;
  savedAt: string | null;
  version: number;
};

export type EditorInspectorTab =
  | "clip"
  | "effects"
  | "transitions"
  | "text"
  | "subtitles"
  | "audio"
  | "color"
  | "keyframes"
  | "ai";

export type TimelineViewState = {
  playheadFrame: number;
  zoom: number;
  scrollX: number;
  snapEnabled: boolean;
  magneticEnabled: boolean;
  loopEnabled: boolean;
  inPoint: number | null;
  outPoint: number | null;
};

export type PlaybackSettings = {
  state: PlaybackState;
  speed: number;
  quality: PreviewQuality;
  showSafeMargins: boolean;
  showGrid: boolean;
  fullscreen: boolean;
};

export type AutoSaveState = {
  status: "saved" | "dirty" | "saving";
  lastSavedAt: string | null;
  pendingVersion: number;
};
