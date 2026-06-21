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
import type { GeneratedFileAsset } from "../../lib/execution-preview";
import type { ArchitectFlowSelections, ArchitectStep } from "../../lib/architect-flow";
import type { SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import { isDevFileTreeSlug } from "../../lib/dev-file-trees";
import { minimalWorkspaceScaffold, expandManualPath } from "../../lib/dev-workspace-scaffold";
import { useOmniForgeWorkspaceOptional } from "../../lib/omniforge-workspace";
import { emitDevTerminalLine } from "../../lib/dev-terminal-telemetry";
import type { DevTrioSlug } from "../../lib/dev-trio";
import {
  defaultProjectTree,
  mergeGeneratedFiles,
  slugToCoreModule,
  type IDEBottomTab,
  type IDEMainView,
  type IDERightView,
  type IDETopTab,
  type IDEProjectFile,
  type OmniCoreModule,
} from "../../lib/omnimind-ide-config";

export type IDEWorkspaceState = {
  step: ArchitectStep;
  selections: ArchitectFlowSelections;
  files: GeneratedFileAsset[];
  status: string | null;
  loading: boolean;
  deployReady: boolean;
};

type IDEContextValue = {
  toolSlug: SovereignToolSlug;
  coreModule: OmniCoreModule;
  topTab: IDETopTab;
  setTopTab: (t: IDETopTab) => void;
  bottomTab: IDEBottomTab;
  setBottomTab: (t: IDEBottomTab) => void;
  rightView: IDERightView;
  setRightView: (v: IDERightView) => void;
  mainView: IDEMainView;
  setMainView: (v: IDEMainView) => void;
  projectFiles: IDEProjectFile[];
  selectedFile: IDEProjectFile | null;
  openFile: (file: IDEProjectFile) => void;
  updateFileContent: (path: string, content: string) => void;
  mergeGenerated: (files: GeneratedFileAsset[]) => void;
  workspaceInitialized: boolean;
  initializeWorkspace: () => void;
  addProjectPath: (rawPath: string) => void;
  rightExplorerOpen: boolean;
  setRightExplorerOpen: (o: boolean) => void;
  leftExplorerOpen: boolean;
  setLeftExplorerOpen: (o: boolean) => void;
  terminalLines: string[];
  appendTerminal: (line: string) => void;
  clearTerminal: () => void;
  workspaceState: IDEWorkspaceState;
  patchWorkspaceState: (patch: Partial<IDEWorkspaceState> & {
    step?: ArchitectStep;
    selections?: ArchitectFlowSelections;
    files?: GeneratedFileAsset[];
    status?: string | null;
    loading?: boolean;
    deployReady?: boolean;
  }) => void;
};

const IDEContext = createContext<IDEContextValue | null>(null);

export function useIDE() {
  const ctx = useContext(IDEContext);
  if (!ctx) throw new Error("useIDE must be used within IDEProvider");
  return ctx;
}

/** Safe read when live preview bridge runs outside full IDE chrome. */
export function useIDEOptional() {
  return useContext(IDEContext);
}

export function IDEProvider({
  toolSlug,
  children,
}: {
  toolSlug: SovereignToolSlug;
  children: ReactNode;
}) {
  const coreModule = slugToCoreModule(toolSlug);
  const omniforge = useOmniForgeWorkspaceOptional();
  const [topTab, setTopTabRaw] = useState<IDETopTab>("live-server");
  const [bottomTab, setBottomTab] = useState<IDEBottomTab>("terminal");
  const [rightView, setRightView] = useState<IDERightView>("codebot");
  const [mainView, setMainView] = useState<IDEMainView>("architect");
  const isDevTrio = isDevFileTreeSlug(toolSlug);
  const [projectFiles, setProjectFiles] = useState<IDEProjectFile[]>(() =>
    isDevTrio ? [] : defaultProjectTree(coreModule),
  );
  const [selectedFile, setSelectedFile] = useState<IDEProjectFile | null>(null);
  const [rightExplorerOpen, setRightExplorerOpen] = useState(false);
  const [leftExplorerOpen, setLeftExplorerOpen] = useState(() => isDevTrio);
  const [terminalLines, setTerminalLines] = useState<string[]>(() =>
    isDevTrio ? [] : [],
  );

  const workspaceInitialized =
    isDevTrio &&
    projectFiles.some((f) => f.path.startsWith(".omnimind/") || f.path === ".omnimind/workspace.json");

  useEffect(() => {
    setLeftExplorerOpen(isDevFileTreeSlug(toolSlug));
    if (!isDevFileTreeSlug(toolSlug)) {
      setRightView((v) => (v === "files" ? "codebot" : v));
      setProjectFiles(defaultProjectTree(slugToCoreModule(toolSlug)));
      setTerminalLines([]);
    } else {
      setProjectFiles([]);
      setSelectedFile(null);
      setTerminalLines([]);
    }
  }, [toolSlug]);
  const [workspaceState, setWorkspaceState] = useState<IDEWorkspaceState>({
    step: 1,
    selections: { projectPrompt: "" },
    files: [],
    status: null,
    loading: false,
    deployReady: false,
  });

  useEffect(() => {
    const onLoaded = (e: Event) => {
      const detail = (e as CustomEvent<{ files: GeneratedFileAsset[]; mode?: "replace" | "merge" }>).detail;
      const files = Array.isArray(detail) ? detail : detail?.files ?? [];
      const mode = Array.isArray(detail) ? "merge" : detail?.mode ?? "merge";

      if (mode === "replace") {
        setProjectFiles(files.map((f) => ({ ...f, isFolder: Boolean(f.isFolder) })));
      } else if (files.length) {
        setProjectFiles((prev) => mergeGeneratedFiles(prev, files));
      }
      if (files.length) {
        emitDevTerminalLine(`✓ Synced ${files.length} file(s) from OmniForge project store`, "success");
      }
    };
    window.addEventListener("omnimind:omniforge-files-loaded", onLoaded);
    return () => window.removeEventListener("omnimind:omniforge-files-loaded", onLoaded);
  }, []);

  useEffect(() => {
    const onSave = (e: Event) => {
      const detail = (e as CustomEvent<{ path: string; content: string }>).detail;
      if (!detail?.path || omniforge?.status !== "ready") return;
      void omniforge.persistFile(detail.path, detail.content);
    };
    window.addEventListener("omnimind:omniforge-file-save", onSave);
    return () => window.removeEventListener("omnimind:omniforge-file-save", onSave);
  }, [omniforge]);

  const setTopTab = useCallback((t: IDETopTab) => {
    setTopTabRaw(t);
    if (t === "review-code") setMainView("editor");
    if (t === "live-server") setMainView("architect");
    if (t === "llm") {
      setRightView("codebot");
      setRightExplorerOpen(true);
    }
  }, []);

  const openFile = useCallback((file: IDEProjectFile) => {
    if (file.isFolder) return;
    setSelectedFile(file);
    setMainView("editor");
    setTopTabRaw("review-code");
    setRightExplorerOpen(true);
    setRightView("files");
  }, []);

  const updateFileContent = useCallback((path: string, content: string) => {
    setProjectFiles((prev) => prev.map((f) => (f.path === path ? { ...f, content } : f)));
    setSelectedFile((prev) => (prev?.path === path ? { ...prev, content } : prev));
  }, []);

  const mergeGenerated = useCallback((files: GeneratedFileAsset[]) => {
    if (!files.length) return;
    setProjectFiles((prev) => mergeGeneratedFiles(prev, files));
    const names = files.map((f) => f.path).join(", ");
    const line = `✓ Wrote ${files.length} node(s): ${names}`;
    setTerminalLines((prev) => [...prev, line]);
    emitDevTerminalLine(line, "success");
  }, []);

  const appendTerminal = useCallback((line: string) => {
    setTerminalLines((prev) => [...prev, line]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
  }, []);

  const initializeWorkspace = useCallback(() => {
    if (!isDevFileTreeSlug(toolSlug)) return;
    void (async () => {
      try {
        if (omniforge?.status === "ready") {
          const scaffold = await omniforge.initializeWorkspace();
          setProjectFiles((prev) => mergeGeneratedFiles(prev, scaffold));
          emitDevTerminalLine(`✓ Workspace initialized · project ${omniforge.projectId}`, "success");
          return;
        }
        const scaffold = minimalWorkspaceScaffold(toolSlug as DevTrioSlug);
        setProjectFiles((prev) => mergeGeneratedFiles(prev, scaffold));
        emitDevTerminalLine(`✓ Local workspace structure initialized · ${toolSlug}`, "success");
      } catch (err) {
        emitDevTerminalLine(
          `✗ Workspace init failed: ${err instanceof Error ? err.message : String(err)}`,
          "error",
        );
      }
    })();
  }, [omniforge, toolSlug]);

  const addProjectPath = useCallback((rawPath: string) => {
    const nodes = expandManualPath(rawPath);
    if (!nodes.length) return;
    setProjectFiles((prev) => mergeGeneratedFiles(prev, nodes));
    const leaf = nodes[nodes.length - 1]!;
    emitDevTerminalLine(`✓ Added ${leaf.isFolder ? "folder" : "file"}: ${leaf.path}`, "success");
    if (!leaf.isFolder) {
      setSelectedFile(leaf);
      setMainView("editor");
      setTopTabRaw("review-code");
    }
  }, []);

  const patchWorkspaceState = useCallback(
    (patch: Partial<IDEWorkspaceState>) => {
      setWorkspaceState((s) => ({
        ...s,
        ...patch,
        selections: patch.selections ?? s.selections,
      }));
      if (patch.files?.length) mergeGenerated(patch.files);
    },
    [mergeGenerated],
  );

  const value = useMemo(
    () => ({
      toolSlug,
      coreModule,
      topTab,
      setTopTab,
      bottomTab,
      setBottomTab,
      rightView,
      setRightView,
      mainView,
      setMainView,
      projectFiles,
      selectedFile,
      openFile,
      updateFileContent,
      mergeGenerated,
      workspaceInitialized,
      initializeWorkspace,
      addProjectPath,
      rightExplorerOpen,
      setRightExplorerOpen,
      leftExplorerOpen,
      setLeftExplorerOpen,
      terminalLines,
      appendTerminal,
      clearTerminal,
      workspaceState,
      patchWorkspaceState,
    }),
    [
      appendTerminal,
      clearTerminal,
      bottomTab,
      coreModule,
      leftExplorerOpen,
      mainView,
      mergeGenerated,
      workspaceInitialized,
      initializeWorkspace,
      addProjectPath,
      openFile,
      patchWorkspaceState,
      projectFiles,
      rightExplorerOpen,
      rightView,
      selectedFile,
      terminalLines,
      toolSlug,
      topTab,
      updateFileContent,
      workspaceState,
    ],
  );

  return <IDEContext.Provider value={value}>{children}</IDEContext.Provider>;
}
