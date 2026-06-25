"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OmniForgeTargetStack } from "./omniforge-project-profile";
import type { ArchitectAnalysis, ArchitectPlan } from "./omniforge-architect-api";
import type { IdeModuleId } from "./omniforge-ide-modules";

export type ExplorerView = "tree" | "search" | "assets" | "git" | "recent";
export type TerminalPanelTab = "terminal" | "output" | "problems" | "debug" | "ports" | "logs" | "tasks" | "profiler";
export type PreviewDevice = "mobile" | "tablet" | "desktop" | "browser";

type OmniForgeShellContextValue = {
  explorerView: ExplorerView;
  setExplorerView: (v: ExplorerView) => void;
  terminalTab: TerminalPanelTab;
  setTerminalTab: (t: TerminalPanelTab) => void;
  terminalOpen: boolean;
  setTerminalOpen: (v: boolean) => void;
  recentFiles: string[];
  pushRecentFile: (path: string) => void;
  previewDevice: PreviewDevice;
  setPreviewDevice: (d: PreviewDevice) => void;
  previewFullscreen: boolean;
  setPreviewFullscreen: (v: boolean) => void;
  explorerOpen: boolean;
  setExplorerOpen: (v: boolean) => void;
  targetStack: OmniForgeTargetStack;
  setTargetStack: (s: OmniForgeTargetStack) => void;
  useFreeOpenSourcePipeline: boolean;
  setUseFreeOpenSourcePipeline: (v: boolean) => void;
  architectPlan: ArchitectPlan | null;
  setArchitectPlan: (p: ArchitectPlan | null) => void;
  architectAnalysis: ArchitectAnalysis | null;
  setArchitectAnalysis: (a: ArchitectAnalysis | null) => void;
  approvedDatabase: string | null;
  setApprovedDatabase: (db: string | null) => void;
  activeIdeModule: IdeModuleId | null;
  setActiveIdeModule: (m: IdeModuleId | null) => void;
  buildRunning: boolean;
  setBuildRunning: (v: boolean) => void;
};

const OmniForgeShellContext = createContext<OmniForgeShellContextValue | null>(null);

const FREE_PIPELINE_KEY = "omniforge_free_open_source_pipeline";

export function OmniForgeShellProvider({ children }: { children: ReactNode }) {
  const [explorerView, setExplorerView] = useState<ExplorerView>("tree");
  const [terminalTab, setTerminalTab] = useState<TerminalPanelTab>("terminal");
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("mobile");
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [targetStack, setTargetStack] = useState<OmniForgeTargetStack>("polyglot");
  const [useFreeOpenSourcePipeline, setUseFreeOpenSourcePipeline] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(FREE_PIPELINE_KEY) === "1";
  });
  const [architectPlan, setArchitectPlan] = useState<ArchitectPlan | null>(null);
  const [architectAnalysis, setArchitectAnalysis] = useState<ArchitectAnalysis | null>(null);
  const [approvedDatabase, setApprovedDatabase] = useState<string | null>(null);
  const [activeIdeModule, setActiveIdeModule] = useState<IdeModuleId | null>(null);
  const [buildRunning, setBuildRunning] = useState(false);

  const setUseFreeOpenSourcePipelinePersist = useCallback((v: boolean) => {
    setUseFreeOpenSourcePipeline(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(FREE_PIPELINE_KEY, v ? "1" : "0");
    }
  }, []);

  const pushRecentFile = useCallback((path: string) => {
    setRecentFiles((prev) => [path, ...prev.filter((p) => p !== path)].slice(0, 12));
  }, []);

  const value = useMemo(
    () => ({
      explorerView,
      setExplorerView,
      terminalTab,
      setTerminalTab,
      terminalOpen,
      setTerminalOpen,
      recentFiles,
      pushRecentFile,
      previewDevice,
      setPreviewDevice,
      previewFullscreen,
      setPreviewFullscreen,
      explorerOpen,
      setExplorerOpen,
      targetStack,
      setTargetStack,
      useFreeOpenSourcePipeline,
      setUseFreeOpenSourcePipeline: setUseFreeOpenSourcePipelinePersist,
      architectPlan,
      setArchitectPlan,
      architectAnalysis,
      setArchitectAnalysis,
      approvedDatabase,
      setApprovedDatabase,
      activeIdeModule,
      setActiveIdeModule,
      buildRunning,
      setBuildRunning,
    }),
    [
      explorerView,
      terminalTab,
      terminalOpen,
      recentFiles,
      pushRecentFile,
      previewDevice,
      previewFullscreen,
      explorerOpen,
      targetStack,
      useFreeOpenSourcePipeline,
      setUseFreeOpenSourcePipelinePersist,
      architectPlan,
      architectAnalysis,
      approvedDatabase,
      activeIdeModule,
      buildRunning,
    ],
  );

  return <OmniForgeShellContext.Provider value={value}>{children}</OmniForgeShellContext.Provider>;
}

export function useOmniForgeShell() {
  const ctx = useContext(OmniForgeShellContext);
  if (!ctx) throw new Error("useOmniForgeShell must be used within OmniForgeShellProvider");
  return ctx;
}

export function useOmniForgeShellOptional() {
  return useContext(OmniForgeShellContext);
}
