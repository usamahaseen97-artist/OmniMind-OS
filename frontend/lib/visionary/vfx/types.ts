/** Visionary Studio — Hollywood VFX Engine types (Phase 4). */

export type VFXWorkspaceMode =
  | "compositor"
  | "node-graph"
  | "motion-graphics"
  | "3d"
  | "particles"
  | "green-screen"
  | "tracking";

export type NodeType =
  | "input"
  | "output"
  | "merge"
  | "blur"
  | "color-correct"
  | "keyer"
  | "transform"
  | "mask"
  | "particle"
  | "light"
  | "camera"
  | "material"
  | "group"
  | "subgraph";

export type VFXNode = {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
  params: Record<string, number | string | boolean>;
  groupId: string | null;
  comment: string | null;
};

export type NodeConnection = {
  id: string;
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  toPort: string;
};

export type NodeGroup = {
  id: string;
  label: string;
  nodeIds: string[];
  collapsed: boolean;
};

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "add"
  | "subtract"
  | "difference"
  | "soft-light";

export type CompLayer = {
  id: string;
  name: string;
  blendMode: BlendMode;
  opacity: number;
  visible: boolean;
  locked: boolean;
  maskId: string | null;
  matteLayerId: string | null;
  nestedCompId: string | null;
  adjustment: boolean;
  renderPass: string | null;
  effectIds: string[];
};

export type Composition = {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  durationFrames: number;
  layers: CompLayer[];
  nested: boolean;
  parentId: string | null;
};

export type ChromaKeySettings = {
  keyColor: string;
  tolerance: number;
  spillSuppression: number;
  edgeRefinement: number;
  hairRefinement: number;
  garbageMaskId: string | null;
  backgroundMediaId: string | null;
};

export type TrackingMode = "2d" | "3d-camera" | "face" | "object" | "screen" | "corner-pin";

export type TrackingPoint = {
  id: string;
  frame: number;
  x: number;
  y: number;
  confidence: number;
};

export type TrackingSession = {
  id: string;
  mode: TrackingMode;
  label: string;
  points: TrackingPoint[];
  status: "idle" | "tracking" | "solved" | "failed";
};

export type ParticlePreset =
  | "fire"
  | "smoke"
  | "dust"
  | "rain"
  | "snow"
  | "magic"
  | "energy"
  | "explosion"
  | "spark"
  | "fog"
  | "clouds";

export type ParticleEmitter = {
  id: string;
  preset: ParticlePreset;
  count: number;
  lifetime: number;
  speed: number;
  gravity: number;
  enabled: boolean;
};

export type PhysicsType = "rigid-body" | "soft-body" | "cloth" | "hair" | "fluid" | "smoke";

export type PhysicsObject = {
  id: string;
  type: PhysicsType;
  label: string;
  mass: number;
  enabled: boolean;
};

export type SceneObject3D = {
  id: string;
  name: string;
  type: "mesh" | "camera" | "light" | "empty" | "hdri";
  parentId: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  materialId: string | null;
};

export type Material3D = {
  id: string;
  name: string;
  baseColor: string;
  metallic: number;
  roughness: number;
  emission: number;
};

export type Light3D = {
  id: string;
  type: "point" | "directional" | "spot" | "area";
  intensity: number;
  color: string;
  castShadow: boolean;
};

export type MotionGraphicTemplate =
  | "animated-shape"
  | "title"
  | "logo-reveal"
  | "infographic"
  | "chart"
  | "animated-icon"
  | "hud"
  | "lower-third"
  | "broadcast-package";

export type AnimationKeyframe = {
  id: string;
  targetId: string;
  property: string;
  frame: number;
  value: number;
};

export type VFXAIAction =
  | "object-removal"
  | "sky-replacement"
  | "background-extension"
  | "relighting"
  | "face-cleanup"
  | "beauty"
  | "motion-stabilization"
  | "slow-motion"
  | "frame-interpolation"
  | "depth-estimation";

export type VFXAITask = {
  id: string;
  action: VFXAIAction;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
};

export type VFXExportFormat = "alpha-png" | "exr" | "png-sequence" | "mov" | "mp4" | "gif" | "transparent-video";

export type VFXExportJob = {
  id: string;
  compositionId: string;
  format: VFXExportFormat;
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
  includeAlpha: boolean;
};

export type MaskShape = {
  id: string;
  label: string;
  points: { x: number; y: number }[];
  feather: number;
  inverted: boolean;
};

export type EffectStackItem = {
  id: string;
  effectId: string;
  name: string;
  enabled: boolean;
  params: Record<string, number>;
};

export type ShaderNode = {
  id: string;
  label: string;
  code: string;
};

export type VFXProject = {
  id: string;
  name: string;
  compositions: Composition[];
  activeCompositionId: string;
  nodes: VFXNode[];
  connections: NodeConnection[];
  groups: NodeGroup[];
  modifiedAt: string;
  version: number;
};

export type VFXInspectorTab =
  | "layers"
  | "effects"
  | "keying"
  | "tracking"
  | "particles"
  | "physics"
  | "materials"
  | "lighting"
  | "ai"
  | "export";
