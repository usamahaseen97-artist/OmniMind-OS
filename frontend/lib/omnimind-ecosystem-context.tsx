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
import { usePathname, useRouter } from "next/navigation";
import {
  buildBreadcrumbs,
  ECOSYSTEM_TOOLS,
  ecosystemToolByPath,
  type EcosystemToolId,
  type SwarmAgentId,
  type WorkspaceProfileId,
} from "./omnimind-ecosystem-registry";
import {
  DEFAULT_NAV_MATRIX,
  domainFromPathname,
  postOmniMindExecute,
  type NavMatrixItem,
} from "./omnimind-execute-api";
import { normalizeHomeRoute } from "./normalize-home-route";

export type ProjectTab = {
  id: string;
  name: string;
  domain?: string;
  updatedAt: string;
};

export type SessionSnapshot = {
  id: string;
  label: string;
  at: string;
  projectId?: string;
  profile: WorkspaceProfileId;
};

export type ProgressTask = {
  id: string;
  label: string;
  progress: number;
  status: "idle" | "running" | "done" | "error";
};

export type PromptHistoryEntry = {
  id: string;
  text: string;
  at: string;
  agent: SwarmAgentId;
};

export type AiSuggestion = {
  id: string;
  text: string;
  at: string;
};

export type EcosystemNotification = {
  id: string;
  text: string;
  at: string;
  level: "info" | "warn" | "success";
};

export type TechStackMemory = {
  frontend: string[];
  backend: string[];
  database: string[];
  styling: string[];
  auth: string[];
};

export type NavHistoryEntry = {
  href: string;
  toolId: EcosystemToolId;
  snapshot: Record<string, unknown>;
  at: string;
};

type OmniMindEcosystemContextValue = {
  workspaceProfile: WorkspaceProfileId;
  setWorkspaceProfile: (p: WorkspaceProfileId) => void;
  projectTabs: ProjectTab[];
  activeProjectTabId: string | null;
  setActiveProjectTabId: (id: string) => void;
  addProjectTab: (name: string, domain?: string) => string;
  closeProjectTab: (id: string) => void;
  recentProjects: ProjectTab[];
  snapshots: SessionSnapshot[];
  saveSnapshot: (label: string) => void;
  restoreSnapshot: (id: string) => void;
  techStack: TechStackMemory;
  setTechStack: (s: Partial<TechStackMemory>) => void;
  activeAgent: SwarmAgentId;
  setActiveAgent: (a: SwarmAgentId) => void;
  progressTasks: ProgressTask[];
  upsertProgressTask: (task: ProgressTask) => void;
  clearProgressTasks: () => void;
  promptHistory: PromptHistoryEntry[];
  pushPromptHistory: (text: string, agent?: SwarmAgentId) => void;
  undoLastPrompt: () => PromptHistoryEntry | null;
  aiSuggestions: AiSuggestion[];
  pushAiSuggestion: (text: string) => void;
  notifications: EcosystemNotification[];
  pushNotification: (text: string, level?: EcosystemNotification["level"]) => void;
  breadcrumbs: string[];
  setBreadcrumbSegments: (segments: string[]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
  quickSearchOpen: boolean;
  setQuickSearchOpen: (v: boolean) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  navigateBack: () => void;
  executeNavigateBack: (command?: string) => Promise<void>;
  navigateForward: () => void;
  navigateHome: () => void;
  navigateToTool: (toolId: EcosystemToolId) => void;
  navMenuItems: NavMatrixItem[];
  navMatrixVersion: number;
  routeDispatching: boolean;
  screenFrozen: boolean;
  applyRouteDispatch: (targetRoute: string, menu?: NavMatrixItem[]) => void;
  saveWorkspaceState: () => void;
  droppedAssets: { name: string; type: string; size: number; at: string }[];
  ingestDroppedFiles: (files: FileList | File[]) => void;
  agentPanelOpen: boolean;
  setAgentPanelOpen: (v: boolean) => void;
  lastScaffoldPrompt: string;
  setLastScaffoldPrompt: (p: string) => void;
  dispatchEcosystemCommand: (command: string) => void;
};

const STORAGE_KEY = "omnimind_ecosystem_v1";

const OmniMindEcosystemContext = createContext<OmniMindEcosystemContextValue | null>(null);

function loadPersisted(): Partial<{
  workspaceProfile: WorkspaceProfileId;
  projectTabs: ProjectTab[];
  activeProjectTabId: string | null;
  recentProjects: ProjectTab[];
  snapshots: SessionSnapshot[];
  techStack: TechStackMemory;
  promptHistory: PromptHistoryEntry[];
}> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistState(data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const prev = loadPersisted();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...data }));
  } catch {
    /* quota */
  }
}

const DEFAULT_STACK: TechStackMemory = {
  frontend: ["React"],
  backend: ["FastAPI"],
  database: ["PostgreSQL"],
  styling: ["Tailwind"],
  auth: ["JWT"],
};

export function OmniMindEcosystemProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/omniforge-engine";
  const router = useRouter();
  const persisted = useMemo(() => loadPersisted(), []);

  const [workspaceProfile, setWorkspaceProfileState] = useState<WorkspaceProfileId>(
    persisted.workspaceProfile ?? "personal",
  );
  const [projectTabs, setProjectTabs] = useState<ProjectTab[]>(
    persisted.projectTabs ?? [{ id: "default", name: "Perfume Website", domain: "Website", updatedAt: new Date().toISOString() }],
  );
  const [activeProjectTabId, setActiveProjectTabIdState] = useState<string | null>(
    persisted.activeProjectTabId ?? "default",
  );
  const [recentProjects, setRecentProjects] = useState<ProjectTab[]>(persisted.recentProjects ?? []);
  const [snapshots, setSnapshots] = useState<SessionSnapshot[]>(persisted.snapshots ?? []);
  const [techStack, setTechStackState] = useState<TechStackMemory>(persisted.techStack ?? DEFAULT_STACK);
  const [activeAgent, setActiveAgent] = useState<SwarmAgentId>("general");
  const [progressTasks, setProgressTasks] = useState<ProgressTask[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>(persisted.promptHistory ?? []);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [notifications, setNotifications] = useState<EcosystemNotification[]>([]);
  const [breadcrumbSegments, setBreadcrumbSegments] = useState<string[]>(["Website", "Perfume Store"]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [navBack, setNavBack] = useState<NavHistoryEntry[]>([]);
  const [navForward, setNavForward] = useState<NavHistoryEntry[]>([]);
  const [droppedAssets, setDroppedAssets] = useState<{ name: string; type: string; size: number; at: string }[]>([]);
  const [agentPanelOpen, setAgentPanelOpen] = useState(true);
  const [lastScaffoldPrompt, setLastScaffoldPrompt] = useState("");
  const [navMenuItems, setNavMenuItems] = useState<NavMatrixItem[]>(DEFAULT_NAV_MATRIX);
  const [navMatrixVersion, setNavMatrixVersion] = useState(0);
  const [routeDispatching, setRouteDispatching] = useState(false);
  const [screenFrozen, setScreenFrozen] = useState(false);

  const tool = useMemo(() => ecosystemToolByPath(pathname), [pathname]);
  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(tool, breadcrumbSegments, pathname),
    [tool, breadcrumbSegments, pathname],
  );

  const setWorkspaceProfile = useCallback((p: WorkspaceProfileId) => {
    setWorkspaceProfileState(p);
    persistState({ workspaceProfile: p });
  }, []);

  const setActiveProjectTabId = useCallback((id: string) => {
    setActiveProjectTabIdState(id);
    persistState({ activeProjectTabId: id });
    setProjectTabs((tabs) => {
      const hit = tabs.find((t) => t.id === id);
      if (hit) {
        setRecentProjects((prev) => [hit, ...prev.filter((p) => p.id !== id)].slice(0, 12));
      }
      return tabs;
    });
  }, []);

  const addProjectTab = useCallback((name: string, domain?: string) => {
    const id = `proj-${Date.now()}`;
    const tab: ProjectTab = { id, name, domain, updatedAt: new Date().toISOString() };
    setProjectTabs((prev) => {
      const next = [...prev, tab];
      persistState({ projectTabs: next });
      return next;
    });
    setActiveProjectTabId(id);
    return id;
  }, [setActiveProjectTabId]);

  const closeProjectTab = useCallback(
    (id: string) => {
      setProjectTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        persistState({ projectTabs: next });
        if (activeProjectTabId === id && next.length) {
          setActiveProjectTabId(next[next.length - 1]!.id);
        }
        return next;
      });
    },
    [activeProjectTabId, setActiveProjectTabId],
  );

  const pushNotification = useCallback((text: string, level: EcosystemNotification["level"] = "info") => {
    const n: EcosystemNotification = { id: `n-${Date.now()}`, text, at: new Date().toISOString(), level };
    setNotifications((prev) => [n, ...prev].slice(0, 30));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omnimind:ecosystem-notification", { detail: n }));
    }
  }, []);

  const saveSnapshot = useCallback(
    (label: string) => {
      const snap: SessionSnapshot = {
        id: `snap-${Date.now()}`,
        label,
        at: new Date().toISOString(),
        projectId: activeProjectTabId ?? undefined,
        profile: workspaceProfile,
      };
      setSnapshots((prev) => {
        const next = [snap, ...prev].slice(0, 20);
        persistState({ snapshots: next });
        return next;
      });
      pushNotification(`Snapshot saved: ${label}`, "success");
    },
    [activeProjectTabId, pushNotification, workspaceProfile],
  );

  const restoreSnapshot = useCallback(
    (id: string) => {
      const snap = snapshots.find((s) => s.id === id);
      if (!snap) return;
      setWorkspaceProfile(snap.profile);
      if (snap.projectId) setActiveProjectTabId(snap.projectId);
      pushNotification(`Restored session: ${snap.label}`, "info");
    },
    [pushNotification, setActiveProjectTabId, setWorkspaceProfile, snapshots],
  );

  const setTechStack = useCallback((partial: Partial<TechStackMemory>) => {
    setTechStackState((prev) => {
      const next = { ...prev, ...partial };
      persistState({ techStack: next });
      return next;
    });
  }, []);

  const upsertProgressTask = useCallback((task: ProgressTask) => {
    setProgressTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx === -1) return [...prev, task];
      const next = [...prev];
      next[idx] = task;
      return next;
    });
  }, []);

  const clearProgressTasks = useCallback(() => setProgressTasks([]), []);

  const pushPromptHistory = useCallback((text: string, agent: SwarmAgentId = "general") => {
    const entry: PromptHistoryEntry = {
      id: `ph-${Date.now()}`,
      text,
      at: new Date().toISOString(),
      agent,
    };
    setPromptHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      persistState({ promptHistory: next });
      return next;
    });
  }, []);

  const undoLastPrompt = useCallback(() => {
    let last: PromptHistoryEntry | null = null;
    setPromptHistory((prev) => {
      if (!prev.length) return prev;
      last = prev[0]!;
      const next = prev.slice(1);
      persistState({ promptHistory: next });
      return next;
    });
    return last;
  }, []);

  const pushAiSuggestion = useCallback((text: string) => {
    setAiSuggestions((prev) => [{ id: `sg-${Date.now()}`, text, at: new Date().toISOString() }, ...prev].slice(0, 8));
  }, []);

  const captureSnapshot = useCallback((): Record<string, unknown> => {
    return {
      workspaceProfile,
      activeProjectTabId,
      breadcrumbSegments,
      techStack,
      activeAgent,
      path: pathname,
    };
  }, [activeAgent, activeProjectTabId, breadcrumbSegments, pathname, techStack, workspaceProfile]);

  const saveWorkspaceState = useCallback(() => {
    persistState({
      workspaceProfile,
      projectTabs,
      activeProjectTabId,
      recentProjects,
      techStack,
    });
  }, [activeProjectTabId, projectTabs, recentProjects, techStack, workspaceProfile]);

  const pushNav = useCallback(
    (href: string, toolId: EcosystemToolId) => {
      setNavBack((prev) => [
        ...prev,
        { href: pathname, toolId: tool.id, snapshot: captureSnapshot(), at: new Date().toISOString() },
      ]);
      setNavForward([]);
      saveWorkspaceState();
    },
    [captureSnapshot, pathname, saveWorkspaceState, tool.id],
  );

  const applyRouteDispatch = useCallback(
    (targetRoute: string, menu?: NavMatrixItem[]) => {
      setScreenFrozen(false);
      setRouteDispatching(false);
      if (menu?.length) {
        setNavMenuItems(menu);
      } else {
        setNavMenuItems([...DEFAULT_NAV_MATRIX]);
      }
      setNavMatrixVersion((v) => v + 1);
      saveWorkspaceState();
      const resolved = normalizeHomeRoute(targetRoute);
      router.push(resolved);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("omnimind:route-dispatch", {
            detail: { target_route: resolved, navigation_menu: menu },
          }),
        );
      }
    },
    [router, saveWorkspaceState],
  );

  const navigateToTool = useCallback(
    async (toolId: EcosystemToolId) => {
      const target = ECOSYSTEM_TOOLS.find((t) => t.id === toolId);
      if (!target) return;
      pushNav(target.href, toolId);
      saveWorkspaceState();
      try {
        const activeTab = projectTabs.find((t) => t.id === activeProjectTabId);
        const res = await postOmniMindExecute({
          domain: domainFromPathname(pathname),
          command: `switch_tool:${toolId}`,
          current_project: activeTab?.name ?? "Default Project",
          action_type: "switch_tool",
        });
        if (res.action === "ROUTE_DISPATCH") {
          applyRouteDispatch(res.target_route ?? target.href, res.navigation_menu);
          return;
        }
      } catch {
        /* matrix offline */
      }
      router.push(target.href);
    },
    [activeProjectTabId, applyRouteDispatch, pathname, projectTabs, pushNav, router, saveWorkspaceState],
  );

  const executeNavigateBack = useCallback(
    async (command = "Back to Neural Chatbot") => {
      setRouteDispatching(true);
      setScreenFrozen(true);
      try {
        saveWorkspaceState();
        const activeTab = projectTabs.find((t) => t.id === activeProjectTabId);
        const res = await postOmniMindExecute({
          domain: domainFromPathname(pathname),
          command,
          current_project: activeTab?.name ?? "Default Project",
          action_type: "navigate_back",
        });
        if (res.action === "ROUTE_DISPATCH" && res.target_route) {
          pushNotification(res.msg ?? "Navigating…", "info");
          applyRouteDispatch(res.target_route, res.navigation_menu);
          return;
        }
        setScreenFrozen(false);
        router.push("/");
      } catch {
        setScreenFrozen(false);
        pushNotification("Routing matrix offline — local fallback", "warn");
        router.push("/");
      } finally {
        setRouteDispatching(false);
        setScreenFrozen(false);
      }
    },
    [
      activeProjectTabId,
      applyRouteDispatch,
      pathname,
      projectTabs,
      pushNotification,
      router,
      saveWorkspaceState,
    ],
  );

  const navigateBack = useCallback(() => {
    setNavBack((prev) => {
      if (!prev.length) return prev;
      const entry = prev[prev.length - 1]!;
      setNavForward((f) => [{ href: pathname, toolId: tool.id, snapshot: captureSnapshot(), at: new Date().toISOString() }, ...f]);
      window.location.href = entry.href;
      return prev.slice(0, -1);
    });
  }, [captureSnapshot, pathname, tool.id]);

  const navigateForward = useCallback(() => {
    setNavForward((prev) => {
      if (!prev.length) return prev;
      const entry = prev[0]!;
      setNavBack((b) => [...b, { href: pathname, toolId: tool.id, snapshot: captureSnapshot(), at: new Date().toISOString() }]);
      window.location.href = entry.href;
      return prev.slice(1);
    });
  }, [captureSnapshot, pathname, tool.id]);

  const navigateHome = useCallback(() => {
    void executeNavigateBack("Back to dashboard menu");
  }, [executeNavigateBack]);

  const ingestDroppedFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).map((f) => ({
      name: f.name,
      type: f.type || "application/octet-stream",
      size: f.size,
      at: new Date().toISOString(),
    }));
    setDroppedAssets((prev) => [...list, ...prev].slice(0, 24));
    pushNotification(`Ingested ${list.length} asset(s) for agent`, "success");
    window.dispatchEvent(new CustomEvent("omnimind:ecosystem-assets-dropped", { detail: { files: list } }));
  }, [pushNotification]);

  const dispatchEcosystemCommand = useCallback(
    (command: string) => {
      window.dispatchEvent(new CustomEvent("omnimind:ecosystem-command", { detail: { command } }));
      if (command === "view:toggle-sidebar") setSidebarOpen((v) => !v);
      if (command === "run:preview") window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
      if (command.startsWith("scaffold:")) {
        window.dispatchEvent(
          new CustomEvent("omnimind:ecosystem-agent-prompt", { detail: { text: command.slice(9) } }),
        );
      }
      if (command.startsWith("agent:")) {
        window.dispatchEvent(
          new CustomEvent("omnimind:ecosystem-agent-prompt", { detail: { text: command.slice(6) } }),
        );
      }
      if (command === "project:new") addProjectTab("New Project");
    },
    [addProjectTab],
  );

  useEffect(() => {
    const onWorkspaceCtx = (e: Event) => {
      const detail = (e as CustomEvent<{ context?: { summary?: string } }>).detail;
      if (detail?.context?.summary) {
        pushAiSuggestion(`Brain context synced for active tool.`);
      }
    };
    const onArchitect = (e: Event) => {
      const analysis = (e as CustomEvent<{ analysis?: { languages?: string[]; database?: { recommended?: string }; auth?: { strategy?: string } } }>).detail?.analysis;
      if (!analysis) return;
      setTechStack({
        frontend: analysis.languages?.filter((l) => /react|vue|angular|html|javascript|typescript/i.test(l)) ?? undefined,
        backend: analysis.languages?.filter((l) => /python|go|java|fastapi/i.test(l)) ?? undefined,
        database: analysis.database?.recommended ? [analysis.database.recommended] : undefined,
        auth: analysis.auth?.strategy ? [analysis.auth.strategy] : undefined,
      });
      if (analysis.database?.recommended) {
        pushAiSuggestion(
          `I noticed your project may benefit from ${analysis.database.recommended.toUpperCase()} for structured data.`,
        );
      }
    };
    window.addEventListener("omnimind:brain-workspace-context", onWorkspaceCtx);
    window.addEventListener("omnimind:omniforge-architect", onArchitect);
    return () => {
      window.removeEventListener("omnimind:brain-workspace-context", onWorkspaceCtx);
      window.removeEventListener("omnimind:omniforge-architect", onArchitect);
    };
  }, [pushAiSuggestion, setTechStack]);

  const value = useMemo(
    () => ({
      workspaceProfile,
      setWorkspaceProfile,
      projectTabs,
      activeProjectTabId,
      setActiveProjectTabId,
      addProjectTab,
      closeProjectTab,
      recentProjects,
      snapshots,
      saveSnapshot,
      restoreSnapshot,
      techStack,
      setTechStack,
      activeAgent,
      setActiveAgent,
      progressTasks,
      upsertProgressTask,
      clearProgressTasks,
      promptHistory,
      pushPromptHistory,
      undoLastPrompt,
      aiSuggestions,
      pushAiSuggestion,
      notifications,
      pushNotification,
      breadcrumbs,
      setBreadcrumbSegments,
      sidebarOpen,
      setSidebarOpen,
      commandPaletteOpen,
      setCommandPaletteOpen,
      quickSearchOpen,
      setQuickSearchOpen,
      canGoBack: navBack.length > 0 || (pathname !== "/" && !pathname.startsWith("/dashboard")),
      canGoForward: navForward.length > 0,
      navigateBack,
      executeNavigateBack,
      navigateForward,
      navigateHome,
      navigateToTool,
      navMenuItems,
      navMatrixVersion,
      routeDispatching,
      screenFrozen,
      applyRouteDispatch,
      saveWorkspaceState,
      droppedAssets,
      ingestDroppedFiles,
      agentPanelOpen,
      setAgentPanelOpen,
      lastScaffoldPrompt,
      setLastScaffoldPrompt,
      dispatchEcosystemCommand,
    }),
    [
      workspaceProfile,
      setWorkspaceProfile,
      projectTabs,
      activeProjectTabId,
      setActiveProjectTabId,
      addProjectTab,
      closeProjectTab,
      recentProjects,
      snapshots,
      saveSnapshot,
      restoreSnapshot,
      techStack,
      setTechStack,
      activeAgent,
      progressTasks,
      upsertProgressTask,
      clearProgressTasks,
      promptHistory,
      pushPromptHistory,
      undoLastPrompt,
      aiSuggestions,
      pushAiSuggestion,
      notifications,
      pushNotification,
      breadcrumbs,
      sidebarOpen,
      commandPaletteOpen,
      quickSearchOpen,
      navBack.length,
      navForward.length,
      pathname,
      navigateBack,
      executeNavigateBack,
      navigateForward,
      navigateHome,
      navigateToTool,
      navMenuItems,
      navMatrixVersion,
      routeDispatching,
      screenFrozen,
      applyRouteDispatch,
      saveWorkspaceState,
      droppedAssets,
      ingestDroppedFiles,
      agentPanelOpen,
      lastScaffoldPrompt,
      dispatchEcosystemCommand,
    ],
  );

  return <OmniMindEcosystemContext.Provider value={value}>{children}</OmniMindEcosystemContext.Provider>;
}

export function useOmniMindEcosystem() {
  const ctx = useContext(OmniMindEcosystemContext);
  if (!ctx) throw new Error("useOmniMindEcosystem must be used within OmniMindEcosystemProvider");
  return ctx;
}

export function useOmniMindEcosystemOptional() {
  return useContext(OmniMindEcosystemContext);
}
