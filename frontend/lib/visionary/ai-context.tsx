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
  AI_WORKFLOWS,
  createDefaultPrompt,
  MODULE_WORKFLOW_MAP,
  visionaryAIEngine,
} from "./ai";
import type {
  AIWorkflowKind,
  BrandKit,
  GenerationJob,
  GenerationPriority,
  GenerationRecord,
  ModelProviderId,
  PromptDraft,
  ProjectCollection,
  ProjectFolder,
  VisionaryAIProject,
  VisionaryAsset,
} from "./ai/types";
import { visionaryAiApi } from "./ai/visionary-ai-api";

export type BottomPanelMode = "timeline" | "queue" | "history";

export type VisionaryAIContextValue = {
  engine: typeof visionaryAIEngine;
  activeWorkflow: AIWorkflowKind;
  setActiveWorkflow: (w: AIWorkflowKind) => void;
  promptDraft: PromptDraft;
  setPromptDraft: React.Dispatch<React.SetStateAction<PromptDraft>>;
  savedPrompts: PromptDraft[];
  promptHistory: PromptDraft[];
  savePrompt: (label: string) => void;
  loadPrompt: (draft: PromptDraft) => void;
  applyTemplate: (templateId: string) => void;
  optimizePrompt: () => Promise<void>;
  optimizationScore: number | null;
  optimizationSuggestions: string[];
  queueJobs: GenerationJob[];
  submitGeneration: (opts?: { priority?: GenerationPriority; cloudRender?: boolean }) => Promise<boolean>;
  pauseJob: (id: string) => void;
  resumeJob: (id: string) => void;
  cancelJob: (id: string) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  historyRecords: GenerationRecord[];
  duplicateHistory: (id: string) => void;
  remixHistory: (id: string) => void;
  assets: VisionaryAsset[];
  brandKit: BrandKit;
  updateBrandKit: (patch: Partial<BrandKit>) => void;
  aiProjects: VisionaryAIProject[];
  activeAIProjectId: string;
  setActiveAIProjectId: (id: string) => void;
  collections: ProjectCollection[];
  folders: ProjectFolder[];
  bottomPanelMode: BottomPanelMode;
  setBottomPanelMode: (m: BottomPanelMode) => void;
  preferredProvider: ModelProviderId | "auto";
  setPreferredProvider: (p: ModelProviderId | "auto") => void;
  cloudSyncing: boolean;
  syncCloud: () => Promise<void>;
  syncModuleWorkflow: (moduleId: string) => void;
};

const VisionaryAIContext = createContext<VisionaryAIContextValue | null>(null);

const DEFAULT_BRAND_KIT: BrandKit = {
  id: "brand-001",
  projectId: "proj-visionary-001",
  logos: [
    { id: "logo-1", name: "Primary Mark", variant: "full-color" },
    { id: "logo-2", name: "Monochrome", variant: "mono" },
  ],
  fonts: [
    { id: "font-1", family: "Inter", weight: "600" },
    { id: "font-2", family: "Playfair Display", weight: "700" },
  ],
  colors: [
    { id: "c1", hex: "#67e8f9", role: "Primary" },
    { id: "c2", hex: "#0B0F19", role: "Background" },
    { id: "c3", hex: "#f472b6", role: "Accent" },
  ],
  brandVoice: "Confident, cinematic, enterprise-grade creative intelligence.",
  companyName: "OmniMind Creative",
  tagline: "Visionary Studio",
  autoBrandingEnabled: true,
};

const SEED_ASSETS: VisionaryAsset[] = [
  {
    id: "asset-seed-1",
    projectId: "proj-visionary-001",
    name: "Hero_Frame_01.png",
    kind: "image",
    mimeType: "image/png",
    sizeBytes: 4_200_000,
    cloudSynced: true,
    source: "generated",
    createdAt: new Date().toISOString(),
    workflow: "text-to-image",
  },
  {
    id: "asset-seed-2",
    projectId: "proj-visionary-001",
    name: "Brand_Logo_Vector.svg",
    kind: "logo",
    mimeType: "image/svg+xml",
    sizeBytes: 128_000,
    cloudSynced: true,
    source: "brand-kit",
    createdAt: new Date().toISOString(),
  },
];

export function VisionaryAIProvider({ children }: { children: ReactNode }) {
  const [activeWorkflow, setActiveWorkflow] = useState<AIWorkflowKind>("text-to-image");
  const [promptDraft, setPromptDraft] = useState<PromptDraft>(() => createDefaultPrompt());
  const [savedPrompts, setSavedPrompts] = useState<PromptDraft[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptDraft[]>([]);
  const [queueJobs, setQueueJobs] = useState<GenerationJob[]>([]);
  const [historyRecords, setHistoryRecords] = useState<GenerationRecord[]>([]);
  const [assets, setAssets] = useState<VisionaryAsset[]>(SEED_ASSETS);
  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND_KIT);
  const [aiProjects, setAIProjects] = useState<VisionaryAIProject[]>([
    {
      id: "proj-visionary-001",
      name: "Untitled Creative Project",
      collectionId: "col-default",
      folderId: null,
      modifiedAt: new Date().toISOString(),
      savedAt: null,
      cloudSynced: true,
      version: 1,
    },
  ]);
  const [activeAIProjectId, setActiveAIProjectId] = useState("proj-visionary-001");
  const [collections] = useState<ProjectCollection[]>([
    { id: "col-default", name: "Default Collection", projectIds: ["proj-visionary-001"] },
  ]);
  const [folders] = useState<ProjectFolder[]>([
    { id: "folder-root", name: "Projects", parentId: null, projectIds: ["proj-visionary-001"] },
  ]);
  const [bottomPanelMode, setBottomPanelMode] = useState<BottomPanelMode>("timeline");
  const [preferredProvider, setPreferredProviderState] = useState<ModelProviderId | "auto">("auto");
  const [optimizationScore, setOptimizationScore] = useState<number | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  useEffect(() => {
    visionaryAIEngine.assets.seed(SEED_ASSETS);
    void visionaryAIEngine.loadFromBackend(activeAIProjectId);

    const unsubQueue = visionaryAIEngine.queue.subscribe(setQueueJobs);
    setHistoryRecords(visionaryAIEngine.history.list(activeAIProjectId));
    setAssets(visionaryAIEngine.assets.list({ projectId: activeAIProjectId }));

    const interval = setInterval(() => {
      setHistoryRecords(visionaryAIEngine.history.list(activeAIProjectId));
      setAssets(visionaryAIEngine.assets.list({ projectId: activeAIProjectId }));
    }, 1500);

    return () => {
      unsubQueue();
      clearInterval(interval);
    };
  }, [activeAIProjectId]);

  const setPreferredProvider = useCallback((p: ModelProviderId | "auto") => {
    setPreferredProviderState(p);
    visionaryAIEngine.modelRouter.setPreferredProvider(p);
  }, []);

  const savePrompt = useCallback(
    (label: string) => {
      const saved = { ...promptDraft, label, savedAt: new Date().toISOString() };
      visionaryAIEngine.templates.save(saved, label);
      setSavedPrompts((prev) => [saved, ...prev]);
    },
    [promptDraft],
  );

  const loadPrompt = useCallback((draft: PromptDraft) => {
    setPromptDraft(draft);
    setActiveWorkflow(draft.workflow);
    setPromptHistory((prev) => [draft, ...prev].slice(0, 30));
  }, []);

  const applyTemplate = useCallback((templateId: string) => {
    const draft = visionaryAIEngine.templates.applyTemplate(templateId, activeWorkflow);
    if (draft) loadPrompt(draft);
  }, [activeWorkflow, loadPrompt]);

  const optimizePrompt = useCallback(async () => {
    try {
      const res = await visionaryAiApi.optimizePrompt(promptDraft);
      setPromptDraft(res.optimized);
      setOptimizationScore(res.score);
      setOptimizationSuggestions(res.suggestions);
    } catch {
      const local = visionaryAIEngine.optimizer.optimize(promptDraft);
      setPromptDraft(local.optimized);
      setOptimizationScore(local.score);
      setOptimizationSuggestions(local.suggestions);
    }
  }, [promptDraft]);

  const submitGeneration = useCallback(
    async (opts?: { priority?: GenerationPriority; cloudRender?: boolean }) => {
      const result = await visionaryAIEngine.submitGeneration({
        draft: { ...promptDraft, workflow: activeWorkflow },
        projectId: activeAIProjectId,
        priority: opts?.priority,
        cloudRender: opts?.cloudRender,
      });
      if (result.errors.length > 0) return false;
      setPromptHistory((prev) => [{ ...promptDraft, id: `hist-p-${Date.now()}` }, ...prev].slice(0, 30));
      setBottomPanelMode("queue");
      return true;
    },
    [promptDraft, activeWorkflow, activeAIProjectId],
  );

  const pauseJob = useCallback((id: string) => {
    visionaryAIEngine.queue.pauseJob(id);
    void visionaryAiApi.pauseJob(id);
  }, []);

  const resumeJob = useCallback((id: string) => {
    visionaryAIEngine.queue.resumeJob(id);
    void visionaryAiApi.resumeJob(id);
  }, []);

  const cancelJob = useCallback((id: string) => {
    visionaryAIEngine.queue.cancelJob(id);
    void visionaryAiApi.cancelJob(id);
  }, []);

  const pauseAll = useCallback(() => visionaryAIEngine.queue.pauseAll(), []);
  const resumeAll = useCallback(() => visionaryAIEngine.queue.resumeAll(), []);

  const duplicateHistory = useCallback((id: string) => {
    visionaryAIEngine.history.duplicate(id);
    setHistoryRecords(visionaryAIEngine.history.list(activeAIProjectId));
  }, [activeAIProjectId]);

  const remixHistory = useCallback(
    (id: string) => {
      const record = visionaryAIEngine.history.get(id);
      if (!record) return;
      const remixed = visionaryAIEngine.history.remix(id, `${record.promptSummary} — remixed`);
      if (remixed) {
        setPromptDraft((p) => ({ ...p, positive: remixed.promptSummary }));
        setHistoryRecords(visionaryAIEngine.history.list(activeAIProjectId));
      }
    },
    [activeAIProjectId],
  );

  const updateBrandKit = useCallback((patch: Partial<BrandKit>) => {
    setBrandKit((prev) => {
      const next = { ...prev, ...patch };
      void visionaryAiApi.saveBrandKit(next).catch(() => undefined);
      return next;
    });
  }, []);

  const syncCloud = useCallback(async () => {
    setCloudSyncing(true);
    try {
      await visionaryAIEngine.cloudSync.syncAssets(assets);
      await visionaryAiApi.syncCloud(activeAIProjectId);
    } finally {
      setCloudSyncing(false);
    }
  }, [assets, activeAIProjectId]);

  const syncModuleWorkflow = useCallback((moduleId: string) => {
    const wf = MODULE_WORKFLOW_MAP[moduleId];
    if (wf) {
      setActiveWorkflow(wf);
      setPromptDraft((p) => ({ ...p, workflow: wf }));
      if (moduleId === "ai-creator") setBottomPanelMode("queue");
    }
  }, []);

  const value = useMemo<VisionaryAIContextValue>(
    () => ({
      engine: visionaryAIEngine,
      activeWorkflow,
      setActiveWorkflow,
      promptDraft,
      setPromptDraft,
      savedPrompts,
      promptHistory,
      savePrompt,
      loadPrompt,
      applyTemplate,
      optimizePrompt,
      optimizationScore,
      optimizationSuggestions,
      queueJobs,
      submitGeneration,
      pauseJob,
      resumeJob,
      cancelJob,
      pauseAll,
      resumeAll,
      historyRecords,
      duplicateHistory,
      remixHistory,
      assets,
      brandKit,
      updateBrandKit,
      aiProjects,
      activeAIProjectId,
      setActiveAIProjectId,
      collections,
      folders,
      bottomPanelMode,
      setBottomPanelMode,
      preferredProvider,
      setPreferredProvider,
      cloudSyncing,
      syncCloud,
      syncModuleWorkflow,
    }),
    [
      activeWorkflow,
      promptDraft,
      savedPrompts,
      promptHistory,
      savePrompt,
      loadPrompt,
      applyTemplate,
      optimizePrompt,
      optimizationScore,
      optimizationSuggestions,
      queueJobs,
      submitGeneration,
      pauseJob,
      resumeJob,
      cancelJob,
      historyRecords,
      duplicateHistory,
      remixHistory,
      assets,
      brandKit,
      updateBrandKit,
      aiProjects,
      activeAIProjectId,
      collections,
      folders,
      bottomPanelMode,
      preferredProvider,
      setPreferredProvider,
      cloudSyncing,
      syncCloud,
      syncModuleWorkflow,
    ],
  );

  return <VisionaryAIContext.Provider value={value}>{children}</VisionaryAIContext.Provider>;
}

export function useVisionaryAI() {
  const ctx = useContext(VisionaryAIContext);
  if (!ctx) throw new Error("useVisionaryAI must be used within VisionaryAIProvider");
  return ctx;
}

export { AI_WORKFLOWS };
