/** OmniCore Platform — shared OS foundation types (Phase 1). */

export type OmniToolSlug =
  | "omniforge-engine"
  | "visionary-studio"
  | "omnimusic"
  | "medical-diagnostic-suite"
  | "business-analytics"
  | string;

export type OmniProjectKind = "universal" | "cross-tool" | "tool-scoped";

export type OmniProject = {
  id: string;
  name: string;
  kind: OmniProjectKind;
  toolSlugs: OmniToolSlug[];
  pinned: boolean;
  favorite: boolean;
  metadata: Record<string, string>;
  version: number;
  modifiedAt: string;
  createdAt: string;
};

export type WorkspacePreset = {
  id: string;
  name: string;
  toolSlug: OmniToolSlug | "*";
  layoutId: string;
  dockState: DockState;
};

export type WindowState = {
  id: string;
  panelId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floating: boolean;
  zIndex: number;
  visible: boolean;
};

export type SplitDirection = "horizontal" | "vertical";

export type LayoutNode =
  | { type: "split"; id: string; direction: SplitDirection; ratio: number; a: LayoutNode; b: LayoutNode }
  | { type: "panel"; id: string; panelId: string };

export type LayoutPreset = {
  id: string;
  name: string;
  root: LayoutNode;
  savedAt: string;
};

export type DockSlot = {
  id: string;
  panelId: string;
  region: "left" | "right" | "bottom" | "top";
  size: number;
  collapsed: boolean;
};

export type DockState = {
  slots: DockSlot[];
  activePanelId: string | null;
};

export type OmniCoreEventMap = {
  "project:opened": { projectId: string; toolSlug: OmniToolSlug };
  "project:closed": { projectId: string };
  "workspace:changed": { presetId: string };
  "layout:saved": { layoutId: string };
  "command:executed": { commandId: string };
  "search:query": { query: string };
  "search:select": { resultId: string; kind: SearchResultKind };
  "notification:show": { id: string; title: string };
  "settings:changed": { scope: SettingsScope; key: string };
  "session:started": { sessionId: string };
  "undo:push": { stackId: string; label: string };
  "theme:changed": { themeId: string };
  "clipboard:copy": { mime: string };
  "shortcut:triggered": { shortcutId: string };
  "brain:context": { toolSlug: OmniToolSlug | null };
  "brain:sync": { source: string };
  "cloud:sync": { domain: string };
  "activity:new": { id: string; kind: string };
  "hub:switch": { toolSlug: OmniToolSlug | string };
  "hub:reorder": { fromId: string; toId: string };
  "sidebar:toggle": { collapsed: boolean };
  "ai-task:retry": { id: string };
  "background-agent:spawn": { id: string; kind: string };
  "notification:live": { id: string; level: string };
  "hub:tool-registered": { toolSlug: OmniToolSlug | string };
  "automation:workflow-created": { workflowId: string };
  "automation:execution-started": { executionId: string; workflowId: string };
  "automation:execution-control": { executionId: string; action: string };
  "automation:ai-generated": { workflowId: string };
  "mission:agent-control": { agentId: string; action: string };
  "mission:log": { source: string; level: string };
};

export type OmniCoreEventName = keyof OmniCoreEventMap;

export type OmniCoreEventHandler<K extends OmniCoreEventName> = (payload: OmniCoreEventMap[K]) => void;

export type NotificationLevel = "info" | "success" | "warning" | "error";

export type OmniNotification = {
  id: string;
  title: string;
  body: string;
  level: NotificationLevel;
  toolSlug: OmniToolSlug | null;
  read: boolean;
  createdAt: string;
};

export type CommandCategory =
  | "navigation"
  | "tool"
  | "file"
  | "ai"
  | "developer"
  | "recent"
  | "workspace"
  | "settings"
  | "plugin";

export type OmniCommand = {
  id: string;
  label: string;
  category: CommandCategory;
  shortcutId: string | null;
  keywords: string[];
  run: () => void;
};

export type SearchResultKind =
  | "project"
  | "file"
  | "asset"
  | "tool"
  | "setting"
  | "ai-chat"
  | "history"
  | "command"
  | "image"
  | "video"
  | "music"
  | "document"
  | "plugin"
  | "template"
  | "api"
  | "database";

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  toolSlug: OmniToolSlug | null;
  score: number;
  actionId?: string;
};

export type RecentItemKind = "project" | "file" | "tool" | "command";

export type RecentItem = {
  id: string;
  kind: RecentItemKind;
  label: string;
  toolSlug: OmniToolSlug | null;
  accessedAt: string;
};

export type ClipboardEntry = {
  id: string;
  mime: string;
  text: string;
  toolSlug: OmniToolSlug | null;
  copiedAt: string;
};

export type ShortcutScope = "global" | "tool";

export type OmniShortcut = {
  id: string;
  label: string;
  keys: string;
  scope: ShortcutScope;
  toolSlug: OmniToolSlug | null;
  profileId: string;
};

export type ShortcutConflict = {
  shortcutId: string;
  conflictsWith: string;
  keys: string;
};

export type UndoEntry = {
  id: string;
  label: string;
  toolSlug: OmniToolSlug;
  projectId: string | null;
  beat: number | null;
  timestamp: string;
};

export type UndoStack = {
  id: string;
  toolSlug: OmniToolSlug;
  projectId: string | null;
  undo: UndoEntry[];
  redo: UndoEntry[];
};

export type ThemeId = "omnimind-dark" | "omnimind-light" | "high-contrast";

export type ThemeTokens = {
  id: ThemeId;
  label: string;
  background: string;
  foreground: string;
  accent: string;
};

export type SettingsScope = "global" | "tool" | "workspace";

export type OmniSetting = {
  key: string;
  scope: SettingsScope;
  toolSlug: OmniToolSlug | null;
  value: unknown;
  cloudSync: boolean;
};

export type LocaleId = "en" | "ur" | "ar" | "es" | "fr" | "de" | "ja" | "zh";

export type AccessibilityPrefs = {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderHints: boolean;
  keyboardNavigation: boolean;
};

export type OmniSession = {
  id: string;
  userId: string | null;
  startedAt: string;
  lastActiveAt: string;
  activeToolSlug: OmniToolSlug | null;
  activeProjectId: string | null;
};

export type UpdateChannel = "stable" | "beta" | "nightly";

export type UpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  channel: UpdateChannel;
  available: boolean;
  releaseNotes: string;
};
