"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  animationEngine3D,
  characterCreatorEngine,
  digitalHumanEngine,
  environmentBuilderEngine,
  gameAssetEngine,
  materialEngine3D,
  sceneManagerEngine,
  studio3DAIEngine,
  visionaryStudio3dApi,
  SEED_OBJECTS,
  ANIMATION_LIBRARY,
} from "./studio3d";
import type {
  AnimationClip3D,
  AvatarFeature,
  CharacterArchetype,
  CharacterPreset,
  DigitalHumanRole,
  EnvironmentElement,
  GameAssetCategory,
  MaterialPreset,
  PBRMaterial,
  RigDefinition,
  Scene3D,
  SceneCollection,
  Studio3DObject,
  ShaderNode3D,
  Studio3DAIAction,
  Studio3DAITask,
  Studio3DAsset,
  Studio3DProject,
  Studio3DWorkspaceMode,
  TransformMode,
  ViewportTool,
  ViewProjection,
} from "./studio3d/types";

function buildSeedProject(): Studio3DProject {
  return {
    id: "3d-proj-001",
    name: "OmniMind 3D Production",
    scenes: [{ id: "scene-main", name: "Main Scene", collectionIds: ["col-main", "col-chars"], active: true }],
    activeSceneId: "scene-main",
    modifiedAt: new Date().toISOString(),
    version: 1,
  };
}

export type VisionaryStudio3DContextValue = {
  project: Studio3DProject;
  workspaceMode: Studio3DWorkspaceMode;
  setWorkspaceMode: (m: Studio3DWorkspaceMode) => void;
  viewportTool: ViewportTool;
  setViewportTool: (t: ViewportTool) => void;
  projection: ViewProjection;
  setProjection: (p: ViewProjection) => void;
  transformMode: TransformMode;
  setTransformMode: (m: TransformMode) => void;
  snapEnabled: boolean;
  setSnapEnabled: (v: boolean) => void;
  gridVisible: boolean;
  setGridVisible: (v: boolean) => void;
  objects: Studio3DObject[];
  collections: SceneCollection[];
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  addObject: (type: Studio3DObject["type"], name: string) => void;
  updateObject: (id: string, patch: Partial<Studio3DObject>) => void;
  addScene: (name: string) => void;
  materials: PBRMaterial[];
  selectedMaterialId: string | null;
  setSelectedMaterialId: (id: string | null) => void;
  addMaterial: (name: string, preset: MaterialPreset) => void;
  updateMaterial: (id: string, patch: Partial<PBRMaterial>) => void;
  shaders: ShaderNode3D[];
  addShader: (label: string, type: string) => void;
  characters: CharacterPreset[];
  createCharacter: (archetype: CharacterArchetype, name: string) => void;
  activeAvatarFeature: AvatarFeature;
  setActiveAvatarFeature: (f: AvatarFeature) => void;
  rigs: RigDefinition[];
  addRig: (name: string) => void;
  animations: AnimationClip3D[];
  addAnimation: (name: string, category: AnimationClip3D["category"]) => void;
  playheadFrame: number;
  setPlayheadFrame: (f: number) => void;
  environmentElements: EnvironmentElement[];
  addEnvironmentElement: (type: EnvironmentElement["type"], name: string) => void;
  gameAssets: import("./studio3d/types").GameAsset[];
  addGameAsset: (category: GameAssetCategory, name: string) => void;
  digitalHumans: import("./studio3d/types").DigitalHuman[];
  createDigitalHuman: (name: string, role: DigitalHumanRole) => void;
  assets: Studio3DAsset[];
  aiTasks: Studio3DAITask[];
  runAIAction: (action: Studio3DAIAction) => void;
  saveProject: () => void;
};

const VisionaryStudio3DContext = createContext<VisionaryStudio3DContextValue | null>(null);

export function VisionaryStudio3DProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Studio3DProject>(buildSeedProject);
  const [workspaceMode, setWorkspaceMode] = useState<Studio3DWorkspaceMode>("viewport");
  const [viewportTool, setViewportTool] = useState<ViewportTool>("orbit");
  const [projection, setProjection] = useState<ViewProjection>("perspective");
  const [transformMode, setTransformMode] = useState<TransformMode>("translate");
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);
  const [objects, setObjects] = useState<Studio3DObject[]>(SEED_OBJECTS);
  const [collections] = useState<SceneCollection[]>([
    { id: "col-main", name: "Main", sceneId: "scene-main", objectIds: ["obj-cam", "obj-light"], visible: true, locked: false },
    { id: "col-chars", name: "Characters", sceneId: "scene-main", objectIds: ["obj-hero"], visible: true, locked: false },
  ]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>("obj-hero");
  const [materials, setMaterials] = useState<PBRMaterial[]>([
    { id: "mat-hero", name: "Hero PBR", preset: "pbr", baseColor: "#67e8f9", metallic: 0.3, roughness: 0.4, emission: 0, opacity: 1, normalMap: null },
  ]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>("mat-hero");
  const [shaders, setShaders] = useState<ShaderNode3D[]>([
    { id: "sh1", label: "Principled BSDF", type: "bsdf", code: "// shader" },
  ]);
  const [characters, setCharacters] = useState<CharacterPreset[]>([]);
  const [activeAvatarFeature, setActiveAvatarFeature] = useState<AvatarFeature>("face");
  const [rigs, setRigs] = useState<RigDefinition[]>([]);
  const [animations, setAnimations] = useState<AnimationClip3D[]>(
    ANIMATION_LIBRARY.map((a) => ({ ...a, durationFrames: 120, loop: true })),
  );
  const [playheadFrame, setPlayheadFrame] = useState(0);
  const [environmentElements, setEnvironmentElements] = useState<EnvironmentElement[]>([
    { id: "env-sky", type: "sky", name: "Procedural Sky", enabled: true },
    { id: "env-hdri", type: "hdri", name: "Studio HDRI", enabled: true },
  ]);
  const [gameAssets, setGameAssets] = useState<import("./studio3d/types").GameAsset[]>([]);
  const [digitalHumans, setDigitalHumans] = useState<import("./studio3d/types").DigitalHuman[]>([]);
  const [assets] = useState<Studio3DAsset[]>([
    { id: "a1", name: "Hero_Mesh.glb", kind: "mesh", sizeBytes: 2048000, tags: ["character"] },
  ]);
  const [aiTasks, setAITasks] = useState<Studio3DAITask[]>([]);

  const commitProject = useCallback((updater: (p: Studio3DProject) => Studio3DProject) => {
    setProject((prev) => {
      const next = { ...updater(prev), version: prev.version + 1, modifiedAt: new Date().toISOString() };
      void visionaryStudio3dApi.saveProject(next).catch(() => undefined);
      return next;
    });
  }, []);

  const addScene = useCallback(
    (name: string) => {
      commitProject((p) => {
        const scenes = sceneManagerEngine.createScene(p.scenes, name);
        const active = scenes.find((s) => s.active);
        return { ...p, scenes, activeSceneId: active?.id ?? p.activeSceneId };
      });
    },
    [commitProject],
  );

  const addObject = useCallback((type: Studio3DObject["type"], name: string) => {
    setObjects((prev) => {
      const next = sceneManagerEngine.addObject(prev, type, name);
      const id = next[next.length - 1]?.id;
      if (id) setSelectedObjectId(id);
      return next;
    });
  }, []);

  const updateObject = useCallback((id: string, patch: Partial<Studio3DObject>) => {
    setObjects((prev) => sceneManagerEngine.updateObject(prev, id, patch));
  }, []);

  const addMaterial = useCallback((name: string, preset: MaterialPreset) => {
    setMaterials((prev) => {
      const next = materialEngine3D.create(prev, name, preset);
      const id = next[next.length - 1]?.id;
      if (id) setSelectedMaterialId(id);
      return next;
    });
  }, []);

  const updateMaterial = useCallback((id: string, patch: Partial<PBRMaterial>) => {
    setMaterials((prev) => materialEngine3D.update(prev, id, patch));
  }, []);

  const addShader = useCallback((label: string, type: string) => {
    setShaders((prev) => [...prev, { id: `sh-${Date.now()}`, label, type, code: "// node" }]);
  }, []);

  const createCharacter = useCallback((archetype: CharacterArchetype, name: string) => {
    setCharacters((prev) => [...prev, characterCreatorEngine.generate(archetype, name)]);
  }, []);

  const addRig = useCallback((name: string) => {
    setRigs((prev) => animationEngine3D.createRig(prev, name));
  }, []);

  const addAnimation = useCallback((name: string, category: AnimationClip3D["category"]) => {
    setAnimations((prev) => animationEngine3D.createClip(prev, name, category));
  }, []);

  const addEnvironmentElement = useCallback((type: EnvironmentElement["type"], name: string) => {
    setEnvironmentElements((prev) => environmentBuilderEngine.add(prev, type, name));
  }, []);

  const addGameAsset = useCallback((category: GameAssetCategory, name: string) => {
    setGameAssets((prev) => gameAssetEngine.create(prev, category, name));
  }, []);

  const createDigitalHuman = useCallback((name: string, role: DigitalHumanRole) => {
    setDigitalHumans((prev) => digitalHumanEngine.create(prev, name, role));
  }, []);

  const runAIAction = useCallback((action: Studio3DAIAction) => {
    const task = studio3DAIEngine.run(action);
    setAITasks((prev) => [task, ...prev]);
    let p = 0;
    const iv = setInterval(() => {
      p += 25;
      if (p >= 100) {
        clearInterval(iv);
        setAITasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "completed", progress: 100 } : t)));
      } else {
        setAITasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, progress: p } : t)));
      }
    }, 400);
  }, []);

  const saveProject = useCallback(() => {
    void visionaryStudio3dApi.saveProject(project);
  }, [project]);

  useEffect(() => {
    void visionaryStudio3dApi.loadProject(project.id).catch(() => undefined);
  }, [project.id]);

  const value = useMemo<VisionaryStudio3DContextValue>(
    () => ({
      project,
      workspaceMode,
      setWorkspaceMode,
      viewportTool,
      setViewportTool,
      projection,
      setProjection,
      transformMode,
      setTransformMode,
      snapEnabled,
      setSnapEnabled,
      gridVisible,
      setGridVisible,
      objects,
      collections,
      selectedObjectId,
      setSelectedObjectId,
      addObject,
      updateObject,
      addScene,
      materials,
      selectedMaterialId,
      setSelectedMaterialId,
      addMaterial,
      updateMaterial,
      shaders,
      addShader,
      characters,
      createCharacter,
      activeAvatarFeature,
      setActiveAvatarFeature,
      rigs,
      addRig,
      animations,
      addAnimation,
      playheadFrame,
      setPlayheadFrame,
      environmentElements,
      addEnvironmentElement,
      gameAssets,
      addGameAsset,
      digitalHumans,
      createDigitalHuman,
      assets,
      aiTasks,
      runAIAction,
      saveProject,
    }),
    [
      project,
      workspaceMode,
      viewportTool,
      projection,
      transformMode,
      snapEnabled,
      gridVisible,
      objects,
      collections,
      selectedObjectId,
      addObject,
      updateObject,
      addScene,
      materials,
      selectedMaterialId,
      addMaterial,
      updateMaterial,
      shaders,
      addShader,
      characters,
      createCharacter,
      activeAvatarFeature,
      rigs,
      addRig,
      animations,
      addAnimation,
      playheadFrame,
      environmentElements,
      addEnvironmentElement,
      gameAssets,
      addGameAsset,
      digitalHumans,
      createDigitalHuman,
      assets,
      aiTasks,
      runAIAction,
      saveProject,
    ],
  );

  return <VisionaryStudio3DContext.Provider value={value}>{children}</VisionaryStudio3DContext.Provider>;
}

export function useVisionaryStudio3D() {
  const ctx = useContext(VisionaryStudio3DContext);
  if (!ctx) throw new Error("useVisionaryStudio3D must be used within VisionaryStudio3DProvider");
  return ctx;
}
