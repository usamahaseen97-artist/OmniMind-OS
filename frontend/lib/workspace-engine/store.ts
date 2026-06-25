import {
  getSovereignTool,
  type SovereignToolDef,
  type SovereignToolSlug,
  SOVEREIGN_TOOLS,
} from "../sovereign-tool-registry";
import type {
  DockPanelState,
  PanelId,
  SplitMode,
  WindowSnap,
  WorkspaceEngineState,
  WorkspaceTab,
  WorkspaceTabKind,
} from "./types";

const MAX_CLOSED_HISTORY = 24;
const MAX_MRU = 32;

const DEFAULT_DOCK: DockPanelState[] = [
  { id: "explorer", region: "left", size: 220, collapsed: false, visible: true },
  { id: "projects", region: "left", size: 220, collapsed: true, visible: false },
  { id: "terminal", region: "bottom", size: 160, collapsed: true, visible: true },
  { id: "logs", region: "bottom", size: 160, collapsed: true, visible: false },
  { id: "tasks", region: "bottom", size: 160, collapsed: true, visible: false },
  { id: "properties", region: "right", size: 0, collapsed: true, visible: false },
  { id: "inspector", region: "right", size: 0, collapsed: true, visible: false },
];

let state: WorkspaceEngineState = createInitialState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function patch(partial: Partial<WorkspaceEngineState>) {
  state = { ...state, ...partial };
  emit();
}

export function createInitialState(): WorkspaceEngineState {
  return {
    tabs: [],
    activeTabId: null,
    closedTabHistory: [],
    mruTabIds: [],
    dockPanels: structuredClone(DEFAULT_DOCK),
    activeLeftPanel: "explorer",
    activeBottomPanel: "terminal",
    splitMode: "single",
    paneTabIds: [null, null, null, null],
    splitSizes: [50, 50],
    windows: [],
    quickSwitcherOpen: false,
    workspaceName: "Default Workspace",
  };
}

export function subscribeWorkspaceEngine(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWorkspaceEngineSnapshot(): WorkspaceEngineState {
  return state;
}

function newTabId() {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function touchMru(tabId: string) {
  return [tabId, ...state.mruTabIds.filter((id) => id !== tabId)].slice(0, MAX_MRU);
}

function tabFromTool(tool: SovereignToolDef): WorkspaceTab {
  const now = Date.now();
  return {
    id: newTabId(),
    kind: "tool",
    toolSlug: tool.slug,
    href: tool.href,
    title: tool.name,
    pinned: false,
    lastAccessedAt: now,
    createdAt: now,
  };
}

function tabFromHref(href: string, title: string, kind: WorkspaceTabKind = "platform"): WorkspaceTab {
  const now = Date.now();
  const slug = href.replace(/^\//, "") as SovereignToolSlug;
  const tool = getSovereignTool(slug);
  return {
    id: newTabId(),
    kind: tool ? "tool" : kind,
    toolSlug: tool?.slug,
    href,
    title: tool?.name ?? title,
    pinned: false,
    lastAccessedAt: now,
    createdAt: now,
  };
}

export function openToolTab(slug: SovereignToolSlug, opts?: { focus?: boolean; pinned?: boolean }) {
  const tool = getSovereignTool(slug);
  if (!tool) return null;

  const existing = state.tabs.find((t) => t.toolSlug === slug);
  if (existing) {
    focusTab(existing.id);
    return existing;
  }

  const tab = tabFromTool(tool);
  if (opts?.pinned) tab.pinned = true;

  const tabs = [...state.tabs, tab];
  const paneTabIds = [...state.paneTabIds];
  if (!paneTabIds[0]) paneTabIds[0] = tab.id;

  patch({
    tabs,
    activeTabId: opts?.focus !== false ? tab.id : state.activeTabId,
    mruTabIds: touchMru(tab.id),
    paneTabIds,
  });
  return tab;
}

export function openHrefTab(href: string, title?: string) {
  const normalized = href.split("?")[0] || "/";
  const existing = state.tabs.find((t) => t.href === normalized);
  if (existing) {
    focusTab(existing.id);
    return existing;
  }
  const tab = tabFromHref(normalized, title ?? normalized);
  const tabs = [...state.tabs, tab];
  const paneTabIds = [...state.paneTabIds];
  if (!paneTabIds[0]) paneTabIds[0] = tab.id;
  patch({
    tabs,
    activeTabId: tab.id,
    mruTabIds: touchMru(tab.id),
    paneTabIds,
  });
  return tab;
}

export function focusTab(tabId: string) {
  const tab = state.tabs.find((t) => t.id === tabId);
  if (!tab) return;
  const tabs = state.tabs.map((t) =>
    t.id === tabId ? { ...t, lastAccessedAt: Date.now() } : t,
  );
  const paneTabIds = [...state.paneTabIds];
  if (!paneTabIds[0]) paneTabIds[0] = tabId;
  patch({
    tabs,
    activeTabId: tabId,
    mruTabIds: touchMru(tabId),
    paneTabIds,
  });
}

export function closeTab(tabId: string) {
  const tab = state.tabs.find((t) => t.id === tabId);
  if (!tab || tab.pinned) return;

  const tabs = state.tabs.filter((t) => t.id !== tabId);
  const closedTabHistory = [tab, ...state.closedTabHistory.filter((t) => t.id !== tabId)].slice(
    0,
    MAX_CLOSED_HISTORY,
  );

  let activeTabId = state.activeTabId;
  if (activeTabId === tabId) {
    const idx = state.tabs.findIndex((t) => t.id === tabId);
    const next = tabs[idx] ?? tabs[idx - 1] ?? tabs[0];
    activeTabId = next?.id ?? null;
  }

  const paneTabIds = state.paneTabIds.map((id) => (id === tabId ? activeTabId : id));

  patch({ tabs, activeTabId, closedTabHistory, paneTabIds });
}

export function pinTab(tabId: string, pinned = true) {
  patch({
    tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, pinned } : t)),
  });
}

export function duplicateTab(tabId: string) {
  const src = state.tabs.find((t) => t.id === tabId);
  if (!src) return;
  const now = Date.now();
  const tab: WorkspaceTab = {
    ...src,
    id: newTabId(),
    pinned: false,
    createdAt: now,
    lastAccessedAt: now,
    state: src.state ? { ...src.state } : undefined,
  };
  patch({
    tabs: [...state.tabs, tab],
    activeTabId: tab.id,
    mruTabIds: touchMru(tab.id),
  });
}

export function reopenClosedTab() {
  const [tab, ...rest] = state.closedTabHistory;
  if (!tab) return;
  const revived: WorkspaceTab = {
    ...tab,
    id: newTabId(),
    lastAccessedAt: Date.now(),
  };
  patch({
    tabs: [...state.tabs, revived],
    activeTabId: revived.id,
    closedTabHistory: rest,
    mruTabIds: touchMru(revived.id),
  });
}

export function cycleTab(reverse = false) {
  if (state.tabs.length < 2) return;
  const unpinned = state.tabs.filter((t) => !t.pinned);
  const pool = unpinned.length ? unpinned : state.tabs;
  const idx = pool.findIndex((t) => t.id === state.activeTabId);
  const next = reverse
    ? pool[(idx - 1 + pool.length) % pool.length]
    : pool[(idx + 1) % pool.length];
  if (next) focusTab(next.id);
}

export function setSplitMode(mode: SplitMode) {
  const paneTabIds = [...state.paneTabIds];
  const active = state.activeTabId;
  if (active) {
    if (mode === "single") paneTabIds[0] = active;
    if (mode === "horizontal" || mode === "vertical" || mode === "compare") {
      if (!paneTabIds[0]) paneTabIds[0] = active;
      if (!paneTabIds[1]) paneTabIds[1] = active;
    }
    if (mode === "quad" || mode === "preview") {
      for (let i = 0; i < 4; i++) {
        if (!paneTabIds[i]) paneTabIds[i] = active;
      }
    }
  }
  patch({ splitMode: mode, paneTabIds });
}

export function assignPaneTab(paneIndex: number, tabId: string | null) {
  const paneTabIds = [...state.paneTabIds];
  paneTabIds[paneIndex] = tabId;
  if (tabId) focusTab(tabId);
  patch({ paneTabIds });
}

export function setSplitSizes(sizes: number[]) {
  patch({ splitSizes: sizes });
}

export function toggleDockPanel(panelId: PanelId) {
  const dockPanels = state.dockPanels.map((p) => {
    if (p.id !== panelId) return p;
    return { ...p, collapsed: !p.collapsed, visible: true };
  });
  const panel = dockPanels.find((p) => p.id === panelId);
  const partial: Partial<WorkspaceEngineState> = { dockPanels };
  if (panel?.region === "left") partial.activeLeftPanel = panelId;
  if (panel?.region === "bottom") partial.activeBottomPanel = panelId;
  patch(partial);
}

export function setDockPanelSize(panelId: PanelId, size: number) {
  patch({
    dockPanels: state.dockPanels.map((p) => (p.id === panelId ? { ...p, size } : p)),
  });
}

export function setQuickSwitcherOpen(open: boolean) {
  patch({ quickSwitcherOpen: open });
}

export function setWorkspaceSnap(snap: WindowSnap) {
  const active = state.activeTabId;
  if (!active) return;
  const win = state.windows.find((w) => w.tabId === active);
  if (win) {
    patch({
      windows: state.windows.map((w) =>
        w.tabId === active ? { ...w, snap, maximized: snap === "fullscreen", minimized: false } : w,
      ),
    });
  } else {
    patch({
      windows: [
        ...state.windows,
        {
          id: `win-${Date.now()}`,
          tabId: active,
          snap,
          minimized: false,
          maximized: snap === "fullscreen",
          floating: false,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          zIndex: 1,
        },
      ],
    });
  }
}

export function toggleMinimize() {
  const active = state.activeTabId;
  if (!active) return;
  const existing = state.windows.find((w) => w.tabId === active);
  if (existing) {
    patch({
      windows: state.windows.map((w) =>
        w.tabId === active ? { ...w, minimized: !w.minimized } : w,
      ),
    });
  }
}

export function reorderTabs(fromIndex: number, toIndex: number) {
  const tabs = [...state.tabs];
  const [moved] = tabs.splice(fromIndex, 1);
  if (!moved) return;
  tabs.splice(toIndex, 0, moved);
  patch({ tabs });
}

export function hydrateWorkspaceEngine(next: WorkspaceEngineState) {
  state = { ...createInitialState(), ...next };
  emit();
}

export function resetWorkspaceEngine() {
  state = createInitialState();
  emit();
}

export const PLATFORM_TAB_ROUTES: { href: string; title: string }[] = [
  { href: "/mission-control", title: "Mission Control" },
  { href: "/automation-engine", title: "Automation Engine" },
  { href: "/omnicloud", title: "OmniCloud" },
  { href: "/marketplace", title: "Marketplace" },
];

export function allOpenableTools(): SovereignToolDef[] {
  return [...SOVEREIGN_TOOLS];
}
