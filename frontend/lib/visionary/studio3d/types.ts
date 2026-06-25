/** Visionary Studio — 3D Production Platform types (Phase 6). */

export type Studio3DWorkspaceMode =
  | "viewport"
  | "character"
  | "avatar"
  | "animation"
  | "rigging"
  | "environment"
  | "materials"
  | "game-assets"
  | "digital-human"
  | "physics"
  | "motion-capture";

export type ViewportTool = "orbit" | "pan" | "zoom" | "transform" | "select";
export type ViewProjection = "perspective" | "orthographic";
export type TransformMode = "translate" | "rotate" | "scale";

export type Scene3D = {
  id: string;
  name: string;
  collectionIds: string[];
  active: boolean;
};

export type SceneCollection = {
  id: string;
  name: string;
  sceneId: string;
  objectIds: string[];
  visible: boolean;
  locked: boolean;
};

export type Studio3DObject = {
  id: string;
  name: string;
  type: "mesh" | "camera" | "light" | "empty" | "armature" | "prefab";
  parentId: string | null;
  collectionId: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  locked: boolean;
  layer: number;
  tags: string[];
  materialId: string | null;
};

export type PBRMaterial = {
  id: string;
  name: string;
  preset: MaterialPreset;
  baseColor: string;
  metallic: number;
  roughness: number;
  emission: number;
  opacity: number;
  normalMap: string | null;
};

export type MaterialPreset =
  | "pbr"
  | "metal"
  | "glass"
  | "fabric"
  | "plastic"
  | "stone"
  | "wood"
  | "emission";

export type ShaderNode3D = {
  id: string;
  label: string;
  type: string;
  code: string;
};

export type CharacterArchetype =
  | "male"
  | "female"
  | "stylized"
  | "realistic"
  | "anime"
  | "cartoon"
  | "fantasy"
  | "sci-fi"
  | "creature"
  | "robot"
  | "npc";

export type CharacterPreset = {
  id: string;
  name: string;
  archetype: CharacterArchetype;
  rigId: string | null;
};

export type AvatarFeature = "face" | "hair" | "eyes" | "skin" | "clothing" | "accessories" | "expressions";

export type AnimationClip3D = {
  id: string;
  name: string;
  durationFrames: number;
  category: "walk" | "run" | "jump" | "combat" | "custom";
  loop: boolean;
};

export type RigDefinition = {
  id: string;
  name: string;
  boneCount: number;
  ikEnabled: boolean;
  fkEnabled: boolean;
};

export type EnvironmentElement = {
  id: string;
  type: "terrain" | "building" | "nature" | "road" | "prop" | "vehicle" | "weather" | "sky" | "hdri";
  name: string;
  enabled: boolean;
};

export type GameAssetCategory =
  | "weapon"
  | "character"
  | "building"
  | "prop"
  | "ui-kit"
  | "icon"
  | "effect"
  | "particle"
  | "inventory-icon"
  | "sprite-sheet";

export type GameAsset = {
  id: string;
  name: string;
  category: GameAssetCategory;
  polyCount: number;
  textureIds: string[];
};

export type DigitalHumanRole =
  | "photoreal"
  | "virtual-presenter"
  | "ai-host"
  | "ai-influencer"
  | "ai-teacher"
  | "ai-doctor"
  | "ai-sales";

export type DigitalHuman = {
  id: string;
  name: string;
  role: DigitalHumanRole;
  avatarId: string | null;
  lipSyncEnabled: boolean;
  facialAnimEnabled: boolean;
};

export type Studio3DAIAction =
  | "text-to-3d"
  | "image-to-3d"
  | "sketch-to-3d"
  | "auto-rig"
  | "auto-uv"
  | "auto-materials"
  | "retopology"
  | "mesh-cleanup"
  | "texture-gen"
  | "anim-suggestions";

export type Studio3DAITask = {
  id: string;
  action: Studio3DAIAction;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
};

export type Studio3DAsset = {
  id: string;
  name: string;
  kind: "mesh" | "texture" | "animation" | "material" | "character" | "prefab";
  sizeBytes: number;
  tags: string[];
};

export type Studio3DProject = {
  id: string;
  name: string;
  scenes: Scene3D[];
  activeSceneId: string;
  modifiedAt: string;
  version: number;
};
