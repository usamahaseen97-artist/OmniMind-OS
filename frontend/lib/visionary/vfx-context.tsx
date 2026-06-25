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
  compositionManager,
  effectStackManager,
  nodeGraphEngine,
  particleSystemEngine,
  physicsSimulationEngine,
  cameraTrackerEngine,
  lightingSystemEngine,
  visionaryVfxApi,
  DEFAULT_CHROMA_KEY,
  SEED_NODES,
  SEED_CONNECTIONS,
} from "./vfx";
import type {
  AnimationKeyframe,
  ChromaKeySettings,
  Composition,
  EffectStackItem,
  MaskShape,
  Material3D,
  MotionGraphicTemplate,
  NodeConnection,
  NodeGroup,
  NodeType,
  ParticleEmitter,
  PhysicsObject,
  SceneObject3D,
  ShaderNode,
  TrackingSession,
  VFXAIAction,
  VFXAITask,
  VFXExportFormat,
  VFXExportJob,
  VFXInspectorTab,
  VFXNode,
  VFXProject,
  VFXWorkspaceMode,
} from "./vfx/types";

function buildSeedProject(): VFXProject {
  let compositions = compositionManager.createComposition([], "Main Comp", 1920, 1080, 24, 300);
  const mainId = compositions[0]!.id;
  compositions = compositionManager.addLayer(compositions, mainId, "Footage");
  compositions = compositionManager.addLayer(compositions, mainId, "Key Layer");
  compositions = compositionManager.addLayer(compositions, mainId, "FX Overlay");

  const nodes: VFXNode[] = SEED_NODES.map((n) => ({
    ...n,
    inputs: n.type === "input" ? [] : ["in"],
    outputs: n.type === "output" ? [] : ["out"],
    params: {},
    groupId: null,
    comment: null,
  }));
  const connections: NodeConnection[] = SEED_CONNECTIONS.map((c, i) => ({
    id: `conn-seed-${i}`,
    fromNodeId: c.from,
    fromPort: c.fromPort,
    toNodeId: c.to,
    toPort: c.toPort,
  }));

  return {
    id: "vfx-proj-001",
    name: "Hollywood VFX Project",
    compositions,
    activeCompositionId: mainId,
    nodes,
    connections,
    groups: [],
    modifiedAt: new Date().toISOString(),
    version: 1,
  };
}

const SEED_SCENE: SceneObject3D[] = [
  { id: "obj-cam", name: "Camera", type: "camera", parentId: null, position: [0, 1.6, 5], rotation: [0, 0, 0], scale: [1, 1, 1], visible: true, materialId: null },
  { id: "obj-light", name: "Key Light", type: "light", parentId: null, position: [3, 4, 2], rotation: [-45, 30, 0], scale: [1, 1, 1], visible: true, materialId: null },
  { id: "obj-mesh", name: "Hero Mesh", type: "mesh", parentId: null, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], visible: true, materialId: "mat-1" },
  { id: "obj-hdri", name: "Studio HDRI", type: "hdri", parentId: null, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], visible: true, materialId: null },
];

export type VisionaryVFXContextValue = {
  project: VFXProject;
  workspaceMode: VFXWorkspaceMode;
  setWorkspaceMode: (m: VFXWorkspaceMode) => void;
  inspectorTab: VFXInspectorTab;
  setInspectorTab: (t: VFXInspectorTab) => void;
  activeComposition: Composition | null;
  setActiveCompositionId: (id: string) => void;
  addComposition: (name: string, nested?: boolean) => void;
  addLayer: (name: string) => void;
  updateLayer: (layerId: string, patch: Partial<Composition["layers"][0]>) => void;
  nodes: VFXNode[];
  connections: NodeConnection[];
  groups: NodeGroup[];
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (type: NodeType, label: string, x: number, y: number) => void;
  moveNode: (nodeId: string, x: number, y: number) => void;
  connectNodes: (fromId: string, toId: string) => void;
  effectStack: EffectStackItem[];
  addEffect: (effectId: string, name: string) => void;
  toggleEffect: (id: string) => void;
  chromaKey: ChromaKeySettings;
  setChromaKey: React.Dispatch<React.SetStateAction<ChromaKeySettings>>;
  updateChromaKey: (patch: Partial<ChromaKeySettings>) => void;
  masks: MaskShape[];
  addMask: (label: string) => void;
  updateMask: (maskId: string, patch: Partial<MaskShape>) => void;
  trackingSessions: TrackingSession[];
  startTracking: (mode: TrackingSession["mode"], label: string) => void;
  particles: ParticleEmitter[];
  addParticle: (preset: ParticleEmitter["preset"]) => void;
  physicsObjects: PhysicsObject[];
  addPhysics: (type: PhysicsObject["type"]) => void;
  sceneObjects: SceneObject3D[];
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  addSceneObject: (type: SceneObject3D["type"]) => void;
  materials: Material3D[];
  addMaterial: (name?: string) => void;
  updateMaterial: (id: string, patch: Partial<Material3D>) => void;
  selectedMaterialId: string | null;
  setSelectedMaterialId: (id: string | null) => void;
  shaders: ShaderNode[];
  addShader: (label: string) => void;
  animationKeyframes: AnimationKeyframe[];
  addAnimKeyframe: (targetId: string, property: string, value: number) => void;
  motionGraphicTemplate: MotionGraphicTemplate | null;
  applyMotionTemplate: (t: MotionGraphicTemplate) => void;
  aiTasks: VFXAITask[];
  runAIAction: (action: VFXAIAction) => void;
  exportJobs: VFXExportJob[];
  queueVFXExport: (format: VFXExportFormat) => void;
  playheadFrame: number;
  setPlayheadFrame: (f: number) => void;
  saveProject: () => void;
};

const VisionaryVFXContext = createContext<VisionaryVFXContextValue | null>(null);

export function VisionaryVFXProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<VFXProject>(buildSeedProject);
  const [workspaceMode, setWorkspaceMode] = useState<VFXWorkspaceMode>("compositor");
  const [inspectorTab, setInspectorTab] = useState<VFXInspectorTab>("layers");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [effectStack, setEffectStack] = useState<EffectStackItem[]>([
    { id: "fx1", effectId: "glow", name: "Glow", enabled: true, params: { intensity: 0.5 } },
    { id: "fx2", effectId: "film-grain", name: "Film Grain", enabled: true, params: { amount: 0.2 } },
  ]);
  const [chromaKey, setChromaKey] = useState<ChromaKeySettings>(DEFAULT_CHROMA_KEY);
  const [masks, setMasks] = useState<MaskShape[]>([]);
  const [trackingSessions, setTrackingSessions] = useState<TrackingSession[]>([]);
  const [particles, setParticles] = useState<ParticleEmitter[]>([
    particleSystemEngine.createEmitter("smoke"),
  ]);
  const [physicsObjects, setPhysicsObjects] = useState<PhysicsObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>("obj-mesh");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>("mat-1");
  const [sceneObjects, setSceneObjects] = useState<SceneObject3D[]>(SEED_SCENE);
  const [materials, setMaterials] = useState<Material3D[]>([
    { id: "mat-1", name: "Hero Material", baseColor: "#67e8f9", metallic: 0.2, roughness: 0.4, emission: 0 },
  ]);
  const [shaders, setShaders] = useState<ShaderNode[]>([
    { id: "sh1", label: "Principled BSDF", code: "// shader graph stub" },
  ]);
  const [animationKeyframes, setAnimationKeyframes] = useState<AnimationKeyframe[]>([]);
  const [motionGraphicTemplate, setMotionGraphicTemplate] = useState<MotionGraphicTemplate | null>(null);
  const [aiTasks, setAITasks] = useState<VFXAITask[]>([]);
  const [exportJobs, setExportJobs] = useState<VFXExportJob[]>([]);
  const [playheadFrame, setPlayheadFrame] = useState(0);

  const activeComposition = useMemo(
    () => compositionManager.getActive(project.compositions, project.activeCompositionId) ?? null,
    [project.compositions, project.activeCompositionId],
  );

  const commit = useCallback((updater: (p: VFXProject) => VFXProject) => {
    setProject((prev) => {
      const next = { ...updater(prev), version: prev.version + 1, modifiedAt: new Date().toISOString() };
      void visionaryVfxApi.saveProject(next).catch(() => undefined);
      return next;
    });
  }, []);

  const addComposition = useCallback(
    (name: string, nested = false) => {
      commit((p) => ({
        ...p,
        compositions: compositionManager.createComposition(p.compositions, name, 1920, 1080, 24, 240, nested),
      }));
    },
    [commit],
  );

  const addLayer = useCallback(
    (name: string) => {
      commit((p) => ({
        ...p,
        compositions: compositionManager.addLayer(p.compositions, p.activeCompositionId, name),
      }));
    },
    [commit],
  );

  const updateLayer = useCallback(
    (layerId: string, patch: Partial<Composition["layers"][0]>) => {
      commit((p) => ({
        ...p,
        compositions: compositionManager.updateLayer(p.compositions, p.activeCompositionId, layerId, patch),
      }));
    },
    [commit],
  );

  const addNode = useCallback(
    (type: NodeType, label: string, x: number, y: number) => {
      commit((p) => ({ ...p, nodes: nodeGraphEngine.addNode(p.nodes, type, label, x, y) }));
    },
    [commit],
  );

  const moveNode = useCallback(
    (nodeId: string, x: number, y: number) => {
      commit((p) => ({ ...p, nodes: nodeGraphEngine.moveNode(p.nodes, nodeId, x, y) }));
    },
    [commit],
  );

  const connectNodes = useCallback(
    (fromId: string, toId: string) => {
      commit((p) => ({
        ...p,
        connections: nodeGraphEngine.connect(p.connections, fromId, "out", toId, "in"),
      }));
    },
    [commit],
  );

  const addEffect = useCallback((effectId: string, name: string) => {
    setEffectStack((s) => effectStackManager.addEffect(s, effectId, name));
  }, []);

  const toggleEffect = useCallback((id: string) => {
    setEffectStack((s) => effectStackManager.toggle(s, id));
  }, []);

  const addMask = useCallback((label: string) => {
    setMasks((prev) => [
      ...prev,
      { id: `mask-${Date.now()}`, label, points: [], feather: 8, inverted: false },
    ]);
  }, []);

  const updateMask = useCallback((maskId: string, patch: Partial<MaskShape>) => {
    setMasks((prev) => prev.map((m) => (m.id === maskId ? { ...m, ...patch } : m)));
  }, []);

  const updateChromaKey = useCallback((patch: Partial<ChromaKeySettings>) => {
    setChromaKey((prev) => ({ ...prev, ...patch }));
  }, []);

  const addSceneObject = useCallback((type: SceneObject3D["type"]) => {
    const id = `obj-${Date.now()}`;
    setSceneObjects((prev) => [
      ...prev,
      {
        id,
        name: `${type} ${prev.length + 1}`,
        type,
        parentId: null,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        materialId: null,
      },
    ]);
    setSelectedObjectId(id);
  }, []);

  const startTracking = useCallback((mode: TrackingSession["mode"], label: string) => {
    setTrackingSessions((prev) => [cameraTrackerEngine.startSession(mode, label), ...prev]);
  }, []);

  const addParticle = useCallback((preset: ParticleEmitter["preset"]) => {
    setParticles((prev) => [...prev, particleSystemEngine.createEmitter(preset)]);
  }, []);

  const addPhysics = useCallback((type: PhysicsObject["type"]) => {
    setPhysicsObjects((prev) => [...prev, physicsSimulationEngine.createObject(type, `${type} object`)]);
  }, []);

  const addMaterial = useCallback((name = "New Material") => {
    const id = `mat-${Date.now()}`;
    setMaterials((prev) => [
      ...prev,
      { id, name, baseColor: "#ffffff", metallic: 0, roughness: 0.5, emission: 0 },
    ]);
    setSelectedMaterialId(id);
  }, []);

  const updateMaterial = useCallback((id: string, patch: Partial<Material3D>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const addShader = useCallback((label: string) => {
    setShaders((prev) => [...prev, { id: `sh-${Date.now()}`, label, code: "// shader node" }]);
  }, []);

  const addAnimKeyframe = useCallback((targetId: string, property: string, value: number) => {
    setAnimationKeyframes((prev) => [
      ...prev,
      { id: `akf-${Date.now()}`, targetId, property, frame: playheadFrame, value },
    ]);
  }, [playheadFrame]);

  const applyMotionTemplate = useCallback((t: MotionGraphicTemplate) => {
    setMotionGraphicTemplate(t);
    addLayer(`MG: ${t}`);
  }, [addLayer]);

  const runAIAction = useCallback((action: VFXAIAction) => {
    const task: VFXAITask = { id: `ai-${Date.now()}`, action, status: "running", progress: 0 };
    setAITasks((prev) => [task, ...prev]);
    let p = 0;
    const iv = setInterval(() => {
      p += 20;
      if (p >= 100) {
        clearInterval(iv);
        setAITasks((prev) =>
          prev.map((x) => (x.id === task.id ? { ...x, status: "completed", progress: 100 } : x)),
        );
      } else {
        setAITasks((prev) => prev.map((x) => (x.id === task.id ? { ...x, progress: p } : x)));
      }
    }, 300);
  }, []);

  const queueVFXExport = useCallback(
    (format: VFXExportFormat) => {
      const job: VFXExportJob = {
        id: `vexp-${Date.now()}`,
        compositionId: project.activeCompositionId,
        format,
        status: "queued",
        progress: 0,
        includeAlpha: format !== "mp4" && format !== "gif",
      };
      setExportJobs((prev) => [job, ...prev]);
      void visionaryVfxApi.queueExport(job);
    },
    [project.activeCompositionId],
  );

  const saveProject = useCallback(() => {
    void visionaryVfxApi.saveProject(project);
  }, [project]);

  useEffect(() => {
    void visionaryVfxApi.loadProject(project.id).catch(() => undefined);
  }, [project.id]);

  const value = useMemo<VisionaryVFXContextValue>(
    () => ({
      project,
      workspaceMode,
      setWorkspaceMode,
      inspectorTab,
      setInspectorTab,
      activeComposition,
      setActiveCompositionId: (id) => commit((p) => ({ ...p, activeCompositionId: id })),
      addComposition,
      addLayer,
      updateLayer,
      nodes: project.nodes,
      connections: project.connections,
      groups: project.groups,
      selectedNodeId,
      setSelectedNodeId,
      addNode,
      moveNode,
      connectNodes,
      effectStack,
      addEffect,
      toggleEffect,
      chromaKey,
      setChromaKey,
      updateChromaKey,
      masks,
      addMask,
      updateMask,
      trackingSessions,
      startTracking,
      particles,
      addParticle,
      physicsObjects,
      addPhysics,
      sceneObjects,
      selectedObjectId,
      setSelectedObjectId,
      addSceneObject,
      materials,
      addMaterial,
      updateMaterial,
      selectedMaterialId,
      setSelectedMaterialId,
      shaders,
      addShader,
      animationKeyframes,
      addAnimKeyframe,
      motionGraphicTemplate,
      applyMotionTemplate,
      aiTasks,
      runAIAction,
      exportJobs,
      queueVFXExport,
      playheadFrame,
      setPlayheadFrame,
      saveProject,
    }),
    [
      project,
      workspaceMode,
      inspectorTab,
      activeComposition,
      commit,
      addComposition,
      addLayer,
      updateLayer,
      selectedNodeId,
      addNode,
      moveNode,
      connectNodes,
      effectStack,
      addEffect,
      toggleEffect,
      chromaKey,
      masks,
      addMask,
      updateMask,
      updateChromaKey,
      trackingSessions,
      startTracking,
      particles,
      addParticle,
      physicsObjects,
      addPhysics,
      sceneObjects,
      selectedObjectId,
      addSceneObject,
      materials,
      addMaterial,
      updateMaterial,
      selectedMaterialId,
      shaders,
      addShader,
      animationKeyframes,
      addAnimKeyframe,
      motionGraphicTemplate,
      applyMotionTemplate,
      aiTasks,
      runAIAction,
      exportJobs,
      queueVFXExport,
      playheadFrame,
      saveProject,
    ],
  );

  return <VisionaryVFXContext.Provider value={value}>{children}</VisionaryVFXContext.Provider>;
}

export function useVisionaryVFX() {
  const ctx = useContext(VisionaryVFXContext);
  if (!ctx) throw new Error("useVisionaryVFX must be used within VisionaryVFXProvider");
  return ctx;
}
