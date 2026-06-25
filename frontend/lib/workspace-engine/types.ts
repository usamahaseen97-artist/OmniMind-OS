import type { SovereignToolSlug } from "../sovereign-tool-registry";

export const WORKSPACE_SESSION_VERSION = 2 as const;
export const WORKSPACE_SESSION_KEY = "omnimind_workspace_engine_v2";

export type WorkspaceTabKind = "tool" | "home" | "platform";

export type WorkspaceTab = {
  id: string;
  kind: WorkspaceTabKind;
  toolSlug?: SovereignToolSlug;
  href: string;
  title: string;
  pinned: boolean;
  groupId?: string;
  state?: Record<string, unknown>;
  lastAccessedAt: number;
  createdAt: number;
};

export type PanelId =
  | "explorer"
  | "projects"
  | "files"
  | "recent"
  | "agents"
  | "search"
  | "bookmarks"
  | "terminal"
  | "logs"
  | "problems"
  | "output"
  | "tasks"
  | "ai-console"
  | "jobs"
  | "properties"
  | "inspector"
  | "notifications"
  | "plugins";

export type DockRegion = "left" | "right" | "bottom";

export type DockPanelState = {
  id: PanelId;
  region: DockRegion;
  size: number;
  collapsed: boolean;
  visible: boolean;
};

export type SplitMode = "single" | "horizontal" | "vertical" | "quad" | "compare" | "preview";

export type WindowSnap = "none" | "left" | "right" | "grid" | "fullscreen";

export type WorkspaceWindow = {
  id: string;
  tabId: string;
  snap: WindowSnap;
  minimized: boolean;
  maximized: boolean;
  floating: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

export type WorkspaceEngineState = {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  closedTabHistory: WorkspaceTab[];
  mruTabIds: string[];
  dockPanels: DockPanelState[];
  activeLeftPanel: PanelId;
  activeBottomPanel: PanelId;
  splitMode: SplitMode;
  /** Tab id per pane (up to 4 for quad) */
  paneTabIds: (string | null)[];
  splitSizes: number[];
  windows: WorkspaceWindow[];
  quickSwitcherOpen: boolean;
  workspaceName: string;
};

export type WorkspaceSessionDocument = WorkspaceEngineState & {
  version: typeof WORKSPACE_SESSION_VERSION;
  savedAt: string;
};
