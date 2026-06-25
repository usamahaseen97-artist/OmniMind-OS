import type {
  InspectorTab,
  TimelineTrackKind,
  VisionarySidebarModule,
} from "./types";

export const SIDEBAR_MODULES: {
  id: VisionarySidebarModule;
  label: string;
  group: "create" | "studio" | "library";
}[] = [
  { id: "ai-creator", label: "AI Creator", group: "create" },
  { id: "image-studio", label: "Image Studio", group: "studio" },
  { id: "video-studio", label: "Video Studio", group: "studio" },
  { id: "video-editor", label: "Video Editor", group: "studio" },
  { id: "vfx-studio", label: "VFX Studio", group: "studio" },
  { id: "marketing-studio", label: "Marketing Studio", group: "studio" },
  { id: "brand-studio", label: "Brand Studio", group: "studio" },
  { id: "product-studio", label: "Product Studio", group: "studio" },
  { id: "animation-studio", label: "Animation Studio", group: "studio" },
  { id: "3d-studio", label: "3D Studio", group: "studio" },
  { id: "social-media-studio", label: "Social Media Studio", group: "studio" },
  { id: "omni-creator", label: "Omni Creator", group: "create" },
  { id: "templates", label: "Templates", group: "library" },
  { id: "plugins", label: "Plugins", group: "library" },
  { id: "cloud-assets", label: "Cloud Assets", group: "library" },
  { id: "export-center", label: "Export Center", group: "library" },
];

export const INSPECTOR_TABS: { id: InspectorTab; label: string }[] = [
  { id: "properties", label: "Properties" },
  { id: "materials", label: "Materials" },
  { id: "animation", label: "Animation" },
  { id: "effects", label: "Effects" },
  { id: "ai-suggestions", label: "AI Suggestions" },
  { id: "history", label: "History" },
  { id: "assets", label: "Assets" },
  { id: "export-settings", label: "Export" },
];

export const TRACK_KINDS: TimelineTrackKind[] = [
  "video",
  "audio",
  "image",
  "text",
  "effects",
  "animation",
  "camera",
  "voice",
  "captions",
];

export const TRACK_KIND_COLORS: Record<TimelineTrackKind, string> = {
  video: "#38bdf8",
  audio: "#a78bfa",
  image: "#34d399",
  text: "#fbbf24",
  effects: "#f472b6",
  animation: "#fb923c",
  camera: "#94a3b8",
  voice: "#c084fc",
  captions: "#2dd4bf",
};

export const CANVAS_TOOLS = [
  { id: "select" as const, label: "Select", shortcut: "V" },
  { id: "transform" as const, label: "Transform", shortcut: "T" },
  { id: "crop" as const, label: "Crop", shortcut: "C" },
  { id: "rotate" as const, label: "Rotate", shortcut: "R" },
  { id: "scale" as const, label: "Scale", shortcut: "S" },
  { id: "align" as const, label: "Align", shortcut: "A" },
];

export const SAMPLE_LAYERS = [
  { id: "l-bg", name: "Background", type: "image" as const, visible: true, locked: true, opacity: 100, parentId: null },
  { id: "l-hero", name: "Hero Composite", type: "group" as const, visible: true, locked: false, opacity: 100, parentId: null },
  { id: "l-title", name: "Title Text", type: "text" as const, visible: true, locked: false, opacity: 100, parentId: "l-hero" },
  { id: "l-fx", name: "Glow FX", type: "shape" as const, visible: true, locked: false, opacity: 72, parentId: "l-hero" },
];

export const SAMPLE_TRACKS = TRACK_KINDS.map((kind, i) => ({
  id: `track-${kind}`,
  kind,
  label: kind.charAt(0).toUpperCase() + kind.slice(1),
  muted: false,
  locked: kind === "camera",
  clips:
    i % 3 === 0
      ? [
          {
            id: `clip-${kind}-1`,
            trackId: `track-${kind}`,
            label: `${kind} clip`,
            startFrame: 0,
            durationFrames: 120 + i * 24,
            color: TRACK_KIND_COLORS[kind],
          },
        ]
      : [],
}));
