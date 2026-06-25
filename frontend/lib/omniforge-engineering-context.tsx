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
import type { GeneratedFileAsset } from "./execution-preview";
import { analyzeArchitectRequirements } from "./omniforge-architect-api";
import { useOmniForgeShell } from "./omniforge-shell-context";
import {
  activateBuildStage,
  analyzeAndSuggestFix,
  blueprintFromAnalysis,
  completeBuildPipeline,
  composeScaffoldPrompt,
  createInitialBuildStages,
  generateAllDocs,
  nextWizardStep,
  parseBuildErrors,
  prevWizardStep,
  recommendStack,
  reviewGeneratedFile,
  reviewScore,
  stageFromArchitectPhase,
  stageFromFileProgress,
  stageFromSwarmAgent,
  targetStackFromProjectType,
  type ArchitectBlueprint,
  type BuildStage,
  type ExportFormat,
  type PendingGeneratedFile,
  type WizardState,
  type WizardStepId,
} from "./omniforge-engineering";
import { runExport } from "./omniforge-engineering/export-engine";

type EngineeringContextValue = {
  wizardOpen: boolean;
  architectOpen: boolean;
  exportOpen: boolean;
  filePanelOpen: boolean;
  buildActive: boolean;
  wizard: WizardState;
  blueprint: ArchitectBlueprint | null;
  buildStages: BuildStage[];
  pendingFiles: PendingGeneratedFile[];
  activePendingId: string | null;
  autoFixLog: string[];
  openWizard: (seed?: { description?: string; projectName?: string }) => void;
  closeWizard: () => void;
  setWizardStep: (step: WizardStepId) => void;
  wizardNext: () => void;
  wizardBack: () => void;
  updateWizard: (patch: Partial<WizardState>) => void;
  toggleFeature: (feature: string) => void;
  submitWizardForArchitect: () => Promise<void>;
  approveArchitectAndBuild: () => void;
  rejectArchitect: () => void;
  openExport: () => void;
  closeExport: () => void;
  runProjectExport: (format: ExportFormat, files: GeneratedFileAsset[]) => void;
  acceptFile: (id: string) => void;
  rejectFile: (id: string) => void;
  regenerateFile: (id: string) => void;
  explainFile: (id: string) => void;
  editPendingFile: (id: string, content: string) => void;
  setActivePending: (id: string | null) => void;
  injectDocumentation: (files: GeneratedFileAsset[]) => GeneratedFileAsset[];
  retryAutoFix: (errorLine: string) => void;
};

const defaultWizard = (): WizardState => ({
  step: "project_type",
  projectType: null,
  projectName: "",
  description: "",
  stack: recommendStack("web_app"),
  features: [],
  targetStack: "web",
});

const EngineeringContext = createContext<EngineeringContextValue | null>(null);

export function OmniForgeEngineeringProvider({ children }: { children: ReactNode }) {
  const shell = useOmniForgeShell();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [architectOpen, setArchitectOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filePanelOpen, setFilePanelOpen] = useState(false);
  const [buildActive, setBuildActive] = useState(false);
  const [wizard, setWizard] = useState<WizardState>(defaultWizard);
  const [blueprint, setBlueprint] = useState<ArchitectBlueprint | null>(null);
  const [buildStages, setBuildStages] = useState<BuildStage[]>(createInitialBuildStages);
  const [pendingFiles, setPendingFiles] = useState<PendingGeneratedFile[]>([]);
  const [activePendingId, setActivePendingId] = useState<string | null>(null);
  const [autoFixLog, setAutoFixLog] = useState<string[]>([]);
  const [approvedPrompt, setApprovedPrompt] = useState<string | null>(null);

  const openWizard = useCallback((seed?: { description?: string; projectName?: string }) => {
    const w = defaultWizard();
    if (seed?.description) w.description = seed.description;
    if (seed?.projectName) w.projectName = seed.projectName;
    setWizard(w);
    setWizardOpen(true);
    setArchitectOpen(false);
    setBuildStages(createInitialBuildStages());
    setPendingFiles([]);
    setActivePendingId(null);
  }, []);

  const closeWizard = useCallback(() => setWizardOpen(false), []);

  const updateWizard = useCallback((patch: Partial<WizardState>) => {
    setWizard((prev) => {
      const next = { ...prev, ...patch };
      if (patch.projectType) {
        next.stack = recommendStack(patch.projectType);
        next.targetStack = targetStackFromProjectType(patch.projectType);
      }
      if (patch.stack?.mode === "ai_recommended" && next.projectType) {
        next.stack = { ...recommendStack(next.projectType), mode: "ai_recommended" };
      }
      return next;
    });
  }, []);

  const setWizardStep = useCallback((step: WizardStepId) => {
    setWizard((prev) => ({ ...prev, step }));
  }, []);

  const wizardNext = useCallback(() => {
    setWizard((prev) => {
      const next = nextWizardStep(prev.step, prev.stack.mode);
      return next ? { ...prev, step: next } : prev;
    });
  }, []);

  const wizardBack = useCallback(() => {
    setWizard((prev) => {
      const back = prevWizardStep(prev.step, prev.stack.mode);
      return back ? { ...prev, step: back } : prev;
    });
  }, []);

  const toggleFeature = useCallback((feature: string) => {
    setWizard((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  }, []);

  const submitWizardForArchitect = useCallback(async () => {
    if (!wizard.projectType) return;
    const prompt = composeScaffoldPrompt(
      wizard.projectName || "OmniForge App",
      wizard.projectType,
      wizard.description,
      wizard.features,
      wizard.stack,
    );
    shell.setTargetStack(wizard.targetStack);
    setWizardOpen(false);
    setArchitectOpen(true);
    setBuildStages(activateBuildStage(createInitialBuildStages(), "planning", "AI Architect analyzing requirements…"));

    const result = await analyzeArchitectRequirements(prompt, { targetStack: wizard.targetStack, mode: "vibe" });
    if (result.analysis) {
      shell.setArchitectAnalysis(result.analysis);
      shell.setApprovedDatabase(result.analysis.database.recommended);
      setBlueprint(blueprintFromAnalysis(result.analysis, wizard.stack, wizard.projectName));
    }
    if (result.plan) shell.setArchitectPlan(result.plan);
    setApprovedPrompt(prompt);
  }, [shell, wizard]);

  const approveArchitectAndBuild = useCallback(() => {
    if (!approvedPrompt) return;
    setArchitectOpen(false);
    setBuildActive(true);
    setFilePanelOpen(true);
    setBuildStages(activateBuildStage(createInitialBuildStages(), "generating", "Starting multi-agent build…"));
    window.dispatchEvent(
      new CustomEvent("omnimind:omniforge-approved-build", {
        detail: { prompt: approvedPrompt, targetStack: wizard.targetStack, stack: wizard.stack },
      }),
    );
  }, [approvedPrompt, wizard.stack, wizard.targetStack]);

  const rejectArchitect = useCallback(() => {
    setArchitectOpen(false);
    setWizardOpen(true);
    setWizardStep("review");
  }, [setWizardStep]);

  const runProjectExport = useCallback(
    (format: ExportFormat, files: GeneratedFileAsset[]) => {
      runExport(format, files, wizard.projectName || "omniforge-project");
      setExportOpen(false);
    },
    [wizard.projectName],
  );

  const acceptFile = useCallback((id: string) => {
    setPendingFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "accepted" } : f)));
  }, []);

  const rejectFile = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        window.dispatchEvent(new CustomEvent("omnimind:omniforge-file-reject", { detail: { path: file.path } }));
      }
      return prev.map((f) => (f.id === id ? { ...f, status: "rejected" } : f));
    });
  }, []);

  const regenerateFile = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        window.dispatchEvent(
          new CustomEvent("omnimind:ecosystem-agent-prompt", {
            detail: { text: `Regenerate file ${file.path} with improvements. Current issues: ${file.reviewIssues?.map((i) => i.message).join("; ") ?? "general polish"}` },
          }),
        );
      }
      return prev.map((f) => (f.id === id ? { ...f, status: "regenerating" } : f));
    });
  }, []);

  const explainFile = useCallback((id: string) => {
    const file = pendingFiles.find((f) => f.id === id);
    if (!file) return;
    window.dispatchEvent(
      new CustomEvent("omnimind:ecosystem-agent-prompt", {
        detail: { text: `Explain the purpose and structure of ${file.path}:\n\n\`\`\`\n${file.content.slice(0, 2000)}\n\`\`\`` },
      }),
    );
  }, [pendingFiles]);

  const editPendingFile = useCallback((id: string, content: string) => {
    setPendingFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        window.dispatchEvent(
          new CustomEvent("omnimind:omniforge-files-loaded", {
            detail: { files: [{ path: f.path, content, language: f.language }], mode: "merge" },
          }),
        );
        return { ...f, content, status: "accepted" };
      }),
    );
  }, []);

  const injectDocumentation = useCallback(
    (files: GeneratedFileAsset[]): GeneratedFileAsset[] => {
      const docs = generateAllDocs(wizard, blueprint, shell.architectAnalysis);
      return [...files, ...docs.map((d) => ({ path: d.path, content: d.content, language: "markdown" }))];
    },
    [wizard, blueprint, shell.architectAnalysis],
  );

  const retryAutoFix = useCallback((errorLine: string) => {
    const errors = parseBuildErrors([errorLine]);
    const suggestion = errors[0] ? analyzeAndSuggestFix(errors[0]) : null;
    setAutoFixLog((prev) => [
      ...prev,
      suggestion ? `Analyze: ${suggestion.analyzed}` : errorLine,
      suggestion ? `Fix: ${suggestion.fix}` : "Retrying build…",
    ]);
    window.dispatchEvent(
      new CustomEvent("omnimind:ecosystem-agent-prompt", {
        detail: { text: `Auto-fix build error:\n${errorLine}\n\n${suggestion?.fix ?? "Fix and retry."}` },
      }),
    );
    setBuildStages((s) => activateBuildStage(s, "coding", "Auto-fix in progress…"));
  }, []);

  useEffect(() => {
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent<{ description?: string; projectName?: string }>).detail;
      openWizard(detail);
    };
    window.addEventListener("omnimind:omniforge-start-wizard", onStart);
    return () => window.removeEventListener("omnimind:omniforge-start-wizard", onStart);
  }, [openWizard]);

  useEffect(() => {
    const onArchitect = (e: Event) => {
      const detail = (e as CustomEvent<{ phase: string }>).detail;
      if (!buildActive && !architectOpen) return;
      const stage = stageFromArchitectPhase(detail.phase);
      setBuildStages((s) => activateBuildStage(s, stage, detail.phase));
    };
    const onSwarm = (e: Event) => {
      const d = (e as CustomEvent<{ agent: string; task: string }>).detail;
      if (!buildActive) return;
      const stage = stageFromSwarmAgent(d.agent);
      setBuildStages((s) => activateBuildStage(s, stage, `${d.agent}: ${d.task}`));
    };
    const onFile = (e: Event) => {
      const d = (e as CustomEvent<{
        file: GeneratedFileAsset;
        index: number;
        total: number;
        files?: GeneratedFileAsset[];
      }>).detail;
      if (!d?.file || d.file.path.startsWith(".omniforge/")) return;

      const allPaths = (d.files ?? []).map((f) => f.path);
      const issues = reviewGeneratedFile(d.file.path, d.file.content ?? "", allPaths);
      const pending: PendingGeneratedFile = {
        id: `${d.file.path}-${d.index}`,
        path: d.file.path,
        content: d.file.content ?? "",
        language: d.file.language ?? "plaintext",
        status: "pending",
        reviewIssues: issues,
        reviewScore: reviewScore(issues),
        index: d.index,
        total: d.total,
      };

      if (buildActive) {
        setPendingFiles((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          const existing = map.get(pending.id);
          map.set(pending.id, existing?.status === "accepted" ? { ...pending, status: "accepted" } : pending);
          return Array.from(map.values()).sort((a, b) => a.index - b.index);
        });
        setFilePanelOpen(true);
        setActivePendingId((cur) => cur ?? pending.id);
        setBuildStages((s) => activateBuildStage(s, stageFromFileProgress(d.index, d.total), d.file.path));
      }
    };
    const onLog = (e: Event) => {
      const lines = (e as CustomEvent<{ lines?: string[] }>).detail?.lines ?? [];
      const errors = parseBuildErrors(lines);
      for (const err of errors) {
        const fix = analyzeAndSuggestFix(err);
        setAutoFixLog((prev) => [...prev.slice(-8), `✗ ${err.message}`, `→ ${fix.fix}`]);
        if (buildActive && fix.canRetry) {
          window.dispatchEvent(
            new CustomEvent("omnimind:omniforge-auto-fix", { detail: { error: err.message, fix: fix.fix } }),
          );
        }
      }
    };
    const onBuildDone = () => {
      setBuildStages((s) => completeBuildPipeline(s));
      setBuildActive(false);
    };

    window.addEventListener("omnimind:omniforge-architect", onArchitect);
    window.addEventListener("omnimind:omniforge-swarm", onSwarm);
    window.addEventListener("omnimind:omniforge-file-stream", onFile);
    window.addEventListener("omnimind:omniforge-scaffold-log", onLog);
    window.addEventListener("omnimind:omniforge-build-complete", onBuildDone);
    return () => {
      window.removeEventListener("omnimind:omniforge-architect", onArchitect);
      window.removeEventListener("omnimind:omniforge-swarm", onSwarm);
      window.removeEventListener("omnimind:omniforge-file-stream", onFile);
      window.removeEventListener("omnimind:omniforge-scaffold-log", onLog);
      window.removeEventListener("omnimind:omniforge-build-complete", onBuildDone);
    };
  }, [architectOpen, buildActive]);

  const value = useMemo(
    () => ({
      wizardOpen,
      architectOpen,
      exportOpen,
      filePanelOpen,
      buildActive,
      wizard,
      blueprint,
      buildStages,
      pendingFiles,
      activePendingId,
      autoFixLog,
      openWizard,
      closeWizard,
      setWizardStep,
      wizardNext,
      wizardBack,
      updateWizard,
      toggleFeature,
      submitWizardForArchitect,
      approveArchitectAndBuild,
      rejectArchitect,
      openExport: () => setExportOpen(true),
      closeExport: () => setExportOpen(false),
      runProjectExport,
      acceptFile,
      rejectFile,
      regenerateFile,
      explainFile,
      editPendingFile,
      setActivePending: setActivePendingId,
      injectDocumentation,
      retryAutoFix,
    }),
    [
      wizardOpen,
      architectOpen,
      exportOpen,
      filePanelOpen,
      buildActive,
      wizard,
      blueprint,
      buildStages,
      pendingFiles,
      activePendingId,
      autoFixLog,
      openWizard,
      closeWizard,
      setWizardStep,
      wizardNext,
      wizardBack,
      updateWizard,
      toggleFeature,
      submitWizardForArchitect,
      approveArchitectAndBuild,
      rejectArchitect,
      runProjectExport,
      acceptFile,
      rejectFile,
      regenerateFile,
      explainFile,
      editPendingFile,
      injectDocumentation,
      retryAutoFix,
    ],
  );

  return <EngineeringContext.Provider value={value}>{children}</EngineeringContext.Provider>;
}

export function useOmniForgeEngineering() {
  const ctx = useContext(EngineeringContext);
  if (!ctx) throw new Error("useOmniForgeEngineering must be used within OmniForgeEngineeringProvider");
  return ctx;
}

export function useOmniForgeEngineeringOptional() {
  return useContext(EngineeringContext);
}
