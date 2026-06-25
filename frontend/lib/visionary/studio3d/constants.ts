import type {
  CharacterArchetype,
  DigitalHumanRole,
  EnvironmentElement,
  GameAssetCategory,
  MaterialPreset,
  Studio3DAIAction,
  Studio3DWorkspaceMode,
} from "./types";

export const STUDIO_3D_MODULES = new Set(["3d-studio"]);

export const STUDIO_3D_WORKSPACE_MODES: { id: Studio3DWorkspaceMode; label: string }[] = [
  { id: "viewport", label: "Viewport" },
  { id: "character", label: "Character" },
  { id: "avatar", label: "Avatar" },
  { id: "animation", label: "Animation" },
  { id: "rigging", label: "Rigging" },
  { id: "environment", label: "Environment" },
  { id: "materials", label: "Materials" },
  { id: "game-assets", label: "Game Assets" },
  { id: "digital-human", label: "Digital Human" },
  { id: "physics", label: "Physics" },
  { id: "motion-capture", label: "Motion Capture" },
];

export const VIEWPORT_TOOLS = [
  { id: "orbit" as const, label: "Orbit" },
  { id: "pan" as const, label: "Pan" },
  { id: "zoom" as const, label: "Zoom" },
  { id: "transform" as const, label: "Transform" },
  { id: "select" as const, label: "Select" },
];

export const MATERIAL_PRESETS: { id: MaterialPreset; label: string }[] = [
  { id: "pbr", label: "PBR" },
  { id: "metal", label: "Metal" },
  { id: "glass", label: "Glass" },
  { id: "fabric", label: "Fabric" },
  { id: "plastic", label: "Plastic" },
  { id: "stone", label: "Stone" },
  { id: "wood", label: "Wood" },
  { id: "emission", label: "Emission" },
];

export const CHARACTER_ARCHETYPES: { id: CharacterArchetype; label: string }[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "stylized", label: "Stylized" },
  { id: "realistic", label: "Realistic" },
  { id: "anime", label: "Anime" },
  { id: "cartoon", label: "Cartoon" },
  { id: "fantasy", label: "Fantasy" },
  { id: "sci-fi", label: "Sci-Fi" },
  { id: "creature", label: "Creature" },
  { id: "robot", label: "Robot" },
  { id: "npc", label: "NPC Generator" },
];

export const AVATAR_FEATURES = [
  { id: "face" as const, label: "Face Editor" },
  { id: "hair" as const, label: "Hair" },
  { id: "eyes" as const, label: "Eyes" },
  { id: "skin" as const, label: "Skin" },
  { id: "clothing" as const, label: "Clothing" },
  { id: "accessories" as const, label: "Accessories" },
  { id: "expressions" as const, label: "Expressions" },
];

export const ANIMATION_LIBRARY = [
  { id: "anim-walk", name: "Walk Cycle", category: "walk" as const },
  { id: "anim-run", name: "Run", category: "run" as const },
  { id: "anim-jump", name: "Jump", category: "jump" as const },
  { id: "anim-combat", name: "Combat", category: "combat" as const },
];

export const ENVIRONMENT_TYPES: { id: EnvironmentElement["type"]; label: string }[] = [
  { id: "terrain", label: "Terrain" },
  { id: "building", label: "Buildings" },
  { id: "nature", label: "Nature" },
  { id: "road", label: "Roads" },
  { id: "prop", label: "Props" },
  { id: "vehicle", label: "Vehicles" },
  { id: "weather", label: "Weather" },
  { id: "sky", label: "Sky" },
  { id: "hdri", label: "HDRI" },
];

export const GAME_ASSET_CATEGORIES: { id: GameAssetCategory; label: string }[] = [
  { id: "weapon", label: "Weapons" },
  { id: "character", label: "Characters" },
  { id: "building", label: "Buildings" },
  { id: "prop", label: "Props" },
  { id: "ui-kit", label: "UI Kits" },
  { id: "icon", label: "Icons" },
  { id: "effect", label: "Effects" },
  { id: "particle", label: "Particles" },
  { id: "inventory-icon", label: "Inventory Icons" },
  { id: "sprite-sheet", label: "Sprite Sheets" },
];

export const DIGITAL_HUMAN_ROLES: { id: DigitalHumanRole; label: string }[] = [
  { id: "photoreal", label: "Photoreal Human" },
  { id: "virtual-presenter", label: "Virtual Presenter" },
  { id: "ai-host", label: "AI Host" },
  { id: "ai-influencer", label: "AI Influencer" },
  { id: "ai-teacher", label: "AI Teacher" },
  { id: "ai-doctor", label: "AI Doctor" },
  { id: "ai-sales", label: "AI Sales Agent" },
];

export const STUDIO_3D_AI_ACTIONS: { id: Studio3DAIAction; label: string }[] = [
  { id: "text-to-3d", label: "Text → 3D" },
  { id: "image-to-3d", label: "Image → 3D" },
  { id: "sketch-to-3d", label: "Sketch → 3D" },
  { id: "auto-rig", label: "Auto Rig" },
  { id: "auto-uv", label: "Auto UV" },
  { id: "auto-materials", label: "Auto Materials" },
  { id: "retopology", label: "AI Retopology" },
  { id: "mesh-cleanup", label: "AI Mesh Cleanup" },
  { id: "texture-gen", label: "AI Texture Generation" },
  { id: "anim-suggestions", label: "AI Animation Suggestions" },
];

export const SEED_OBJECTS = [
  { id: "obj-cam", name: "Main Camera", type: "camera" as const, parentId: null, collectionId: "col-main", position: [0, 2, 6] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number], visible: true, locked: false, layer: 0, tags: ["camera"], materialId: null },
  { id: "obj-light", name: "Key Light", type: "light" as const, parentId: null, collectionId: "col-main", position: [4, 5, 3] as [number, number, number], rotation: [-35, 25, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number], visible: true, locked: false, layer: 0, tags: ["lighting"], materialId: null },
  { id: "obj-hero", name: "Hero Mesh", type: "mesh" as const, parentId: null, collectionId: "col-chars", position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number], visible: true, locked: false, layer: 1, tags: ["hero"], materialId: "mat-hero" },
];
