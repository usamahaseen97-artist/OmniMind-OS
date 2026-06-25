"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { SovereignToolSlug } from "./sovereign-tool-registry";
import { getSovereignTool } from "./sovereign-tool-registry";
import { isProtectedShellTool } from "./omnimind-os-pilot";
import {
  assignPaneTab,
  closeTab,
  cycleTab,
  duplicateTab,
  focusTab,
  getWorkspaceEngineSnapshot,
  openHrefTab,
  openToolTab,
  pinTab,
  reopenClosedTab,
  reorderTabs,
  setQuickSwitcherOpen,
  setSplitMode,
  setWorkspaceSnap,
  subscribeWorkspaceEngine,
  toggleDockPanel,
  toggleMinimize,
  type WorkspaceEngineState,
} from "./workspace-engine";
import { restoreSession, scheduleSessionSave } from "./workspace-engine/session";
import type { PanelId, SplitMode, WindowSnap } from "./workspace-engine/types";

type WorkspaceEngineContextValue = WorkspaceEngineState & {
  activeTab: ReturnType<typeof getActiveTab>;
  openTool: (slug: SovereignToolSlug) => void;
  openRoute: (href: string, title?: string) => void;
  focusTab: (id: string) => void;
  closeTab: (id: string) => void;
  pinTab: (id: string, pinned?: boolean) => void;
  duplicateTab: (id: string) => void;
  reopenClosedTab: () => void;
  cycleTab: (reverse?: boolean) => void;
  setSplitMode: (mode: SplitMode) => void;
  assignPaneTab: (pane: number, tabId: string | null) => void;
  toggleDockPanel: (id: PanelId) => void;
  setQuickSwitcherOpen: (open: boolean) => void;
  setWorkspaceSnap: (snap: WindowSnap) => void;
  toggleMinimize: () => void;
  reorderTabs: (from: number, to: number) => void;
};

const WorkspaceEngineContext = createContext<WorkspaceEngineContextValue | null>(null);

function getActiveTab(state: WorkspaceEngineState) {
  return state.tabs.find((t) => t.id === state.activeTabId) ?? null;
}

export function WorkspaceEngineProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const state = useSyncExternalStore(
    subscribeWorkspaceEngine,
    getWorkspaceEngineSnapshot,
    getWorkspaceEngineSnapshot,
  );

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    scheduleSessionSave();
  }, [state]);

  useEffect(() => {
    const path = pathname.split("?")[0] || "/";
    if (path === "/") {
      openHrefTab("/", "Neural Command Center");
      return;
    }
    const slug = path.replace(/^\//, "") as SovereignToolSlug;
    const tool = getSovereignTool(slug);
    if (tool) openToolTab(tool.slug);
    else openHrefTab(path, path.slice(1));
  }, [pathname]);

  const openTool = useCallback((slug: SovereignToolSlug) => {
    openToolTab(slug);
  }, []);

  const openRoute = useCallback((href: string, title?: string) => {
    openHrefTab(href, title);
  }, []);

  const value: WorkspaceEngineContextValue = {
    ...state,
    activeTab: getActiveTab(state),
    openTool,
    openRoute,
    focusTab,
    closeTab,
    pinTab,
    duplicateTab,
    reopenClosedTab,
    cycleTab,
    setSplitMode,
    assignPaneTab,
    toggleDockPanel,
    setQuickSwitcherOpen,
    setWorkspaceSnap,
    toggleMinimize,
    reorderTabs,
  };

  return (
    <WorkspaceEngineContext.Provider value={value}>{children}</WorkspaceEngineContext.Provider>
  );
}

export function useWorkspaceEngine(): WorkspaceEngineContextValue {
  const ctx = useContext(WorkspaceEngineContext);
  if (!ctx) throw new Error("useWorkspaceEngine must be used within WorkspaceEngineProvider");
  return ctx;
}

export function useWorkspaceEngineOptional() {
  return useContext(WorkspaceEngineContext);
}

export function useActiveWorkspaceTool() {
  const { activeTab } = useWorkspaceEngine();
  if (!activeTab?.toolSlug) return null;
  return getSovereignTool(activeTab.toolSlug);
}

export function useIsProtectedActiveTool() {
  const tool = useActiveWorkspaceTool();
  return tool ? isProtectedShellTool(tool.slug) : false;
}
