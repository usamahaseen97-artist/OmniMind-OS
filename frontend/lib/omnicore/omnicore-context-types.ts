import type {
  AccessibilityPrefs,
  DockState,
  LayoutPreset,
  LocaleId,
  OmniCommand,
  OmniNotification,
  OmniProject,
  OmniSession,
  OmniShortcut,
  OmniToolSlug,
  SearchResult,
  ThemeId,
  WorkspacePreset,
} from "../../core/omnicore/types";

import type { OmniCoreAiContextSlice } from "./omnicore-ai-context-types";
import type { OmniCoreAssetsContextSlice } from "./omnicore-assets-context-types";
import type { OmniCorePluginsContextSlice } from "./omnicore-plugins-context-types";
import type { OmniCoreCollaborationContextSlice } from "./omnicore-collaboration-context-types";
import type { OmniCoreSecurityContextSlice } from "./omnicore-security-context-types";

export type OmniCoreContextSlice = {
  coreReady: boolean;
  coreVersion: string;
  projects: OmniProject[];
  activeProject: OmniProject | null;
  openProject: (id: string, toolSlug: OmniToolSlug) => void;
  createProject: (name: string, kind: OmniProject["kind"], toolSlugs?: OmniToolSlug[]) => void;
  toggleProjectPin: (id: string) => void;
  workspacePresets: WorkspacePreset[];
  activeWorkspacePresetId: string;
  switchWorkspacePreset: (id: string) => void;
  layoutPresets: LayoutPreset[];
  dockState: DockState;
  notifications: OmniNotification[];
  showNotification: (title: string, body: string) => void;
  commandPaletteOpen: boolean;
  toggleCommandPalette: (open?: boolean) => void;
  commandQuery: string;
  setCommandQuery: (q: string) => void;
  commands: OmniCommand[];
  executeCommand: (id: string) => void;
  searchQuery: string;
  searchResults: SearchResult[];
  setSearchQuery: (q: string) => void;
  shortcuts: OmniShortcut[];
  shortcutConflicts: { shortcutId: string; conflictsWith: string; keys: string }[];
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
  t: (key: string) => string;
  accessibility: AccessibilityPrefs;
  updateAccessibility: (patch: Partial<AccessibilityPrefs>) => void;
  session: OmniSession;
  activeThemeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  undo: (toolSlug: OmniToolSlug) => void;
  redo: (toolSlug: OmniToolSlug) => void;
  copyToClipboard: (text: string, toolSlug?: OmniToolSlug | null) => void;
} & OmniCoreAiContextSlice & OmniCoreAssetsContextSlice & OmniCorePluginsContextSlice & OmniCoreCollaborationContextSlice & OmniCoreSecurityContextSlice;
