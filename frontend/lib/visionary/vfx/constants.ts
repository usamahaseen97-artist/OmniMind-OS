import type {
  BlendMode,
  MotionGraphicTemplate,
  NodeType,
  ParticlePreset,
  PhysicsType,
  VFXAIAction,
  VFXExportFormat,
} from "./types";

export const VFX_MODULES = new Set(["vfx-studio", "animation-studio"]);

export const NODE_TEMPLATES: { type: NodeType; label: string; category: string }[] = [
  { type: "input", label: "Media Input", category: "IO" },
  { type: "output", label: "Composite Out", category: "IO" },
  { type: "merge", label: "Merge", category: "Composite" },
  { type: "blur", label: "Gaussian Blur", category: "Filter" },
  { type: "color-correct", label: "Color Correct", category: "Color" },
  { type: "keyer", label: "Chroma Keyer", category: "Keying" },
  { type: "transform", label: "Transform", category: "Transform" },
  { type: "mask", label: "Mask", category: "Mask" },
  { type: "particle", label: "Particle", category: "Simulation" },
  { type: "light", label: "Light", category: "3D" },
  { type: "camera", label: "Camera", category: "3D" },
  { type: "material", label: "Material", category: "3D" },
  { type: "group", label: "Group", category: "Organize" },
  { type: "subgraph", label: "Subgraph", category: "Organize" },
];

export const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "add",
  "subtract",
  "difference",
  "soft-light",
];

export const PARTICLE_PRESETS: { id: ParticlePreset; label: string }[] = [
  { id: "fire", label: "Fire" },
  { id: "smoke", label: "Smoke" },
  { id: "dust", label: "Dust" },
  { id: "rain", label: "Rain" },
  { id: "snow", label: "Snow" },
  { id: "magic", label: "Magic" },
  { id: "energy", label: "Energy" },
  { id: "explosion", label: "Explosion" },
  { id: "spark", label: "Spark" },
  { id: "fog", label: "Fog" },
  { id: "clouds", label: "Clouds" },
];

export const PHYSICS_TYPES: { id: PhysicsType; label: string }[] = [
  { id: "rigid-body", label: "Rigid Body" },
  { id: "soft-body", label: "Soft Body" },
  { id: "cloth", label: "Cloth" },
  { id: "hair", label: "Hair" },
  { id: "fluid", label: "Fluid (placeholder)" },
  { id: "smoke", label: "Smoke (placeholder)" },
];

export const MOTION_GRAPHIC_TEMPLATES: { id: MotionGraphicTemplate; label: string }[] = [
  { id: "animated-shape", label: "Animated Shapes" },
  { id: "title", label: "Cinematic Title" },
  { id: "logo-reveal", label: "Logo Reveal" },
  { id: "infographic", label: "Infographic" },
  { id: "chart", label: "Animated Chart" },
  { id: "animated-icon", label: "Animated Icons" },
  { id: "hud", label: "HUD Elements" },
  { id: "lower-third", label: "Lower Third" },
  { id: "broadcast-package", label: "Broadcast Package" },
];

export const VFX_AI_ACTIONS: { id: VFXAIAction; label: string; description: string }[] = [
  { id: "object-removal", label: "AI Object Removal", description: "Remove unwanted objects from plate" },
  { id: "sky-replacement", label: "AI Sky Replacement", description: "Replace sky with HDR environment" },
  { id: "background-extension", label: "AI Background Extension", description: "Outpaint background regions" },
  { id: "relighting", label: "AI Relighting", description: "Match lighting across composite" },
  { id: "face-cleanup", label: "AI Face Cleanup", description: "Skin and feature refinement" },
  { id: "beauty", label: "AI Beauty", description: "Subtle beauty pass" },
  { id: "motion-stabilization", label: "AI Motion Stabilization", description: "Stabilize handheld footage" },
  { id: "slow-motion", label: "AI Slow Motion", description: "Temporal interpolation" },
  { id: "frame-interpolation", label: "AI Frame Interpolation", description: "Increase frame rate" },
  { id: "depth-estimation", label: "AI Depth Estimation", description: "Generate depth matte" },
];

export const VFX_EXPORT_FORMATS: { id: VFXExportFormat; label: string; alpha: boolean }[] = [
  { id: "alpha-png", label: "PNG + Alpha", alpha: true },
  { id: "exr", label: "EXR Sequence", alpha: true },
  { id: "png-sequence", label: "PNG Sequence", alpha: true },
  { id: "mov", label: "ProRes MOV", alpha: true },
  { id: "mp4", label: "H.264 MP4", alpha: false },
  { id: "gif", label: "Animated GIF", alpha: false },
  { id: "transparent-video", label: "Transparent WebM", alpha: true },
];

export const DEFAULT_CHROMA_KEY = {
  keyColor: "#00ff00",
  tolerance: 0.35,
  spillSuppression: 0.5,
  edgeRefinement: 0.6,
  hairRefinement: 0.4,
  garbageMaskId: null as string | null,
  backgroundMediaId: null as string | null,
};

export const SEED_NODES = [
  { id: "n-in", type: "input" as const, label: "Footage", x: 80, y: 120 },
  { id: "n-key", type: "keyer" as const, label: "Chroma Key", x: 280, y: 100 },
  { id: "n-merge", type: "merge" as const, label: "Merge Over", x: 480, y: 140 },
  { id: "n-out", type: "output" as const, label: "Output", x: 680, y: 120 },
];

export const SEED_CONNECTIONS = [
  { from: "n-in", fromPort: "out", to: "n-key", toPort: "in" },
  { from: "n-key", fromPort: "out", to: "n-merge", toPort: "fg" },
  { from: "n-merge", fromPort: "out", to: "n-out", toPort: "in" },
];
