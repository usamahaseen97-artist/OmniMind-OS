import type { OmniProject, OmniToolSlug } from "./types";

export const PROJECT_SEED: OmniProject[] = [
  {
    id: "proj-omniforge-001",
    name: "OmniForge Workspace",
    kind: "tool-scoped",
    toolSlugs: ["omniforge-engine"],
    pinned: true,
    favorite: true,
    metadata: { language: "typescript" },
    version: 1,
    modifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-cross-001",
    name: "OmniMind Launch Campaign",
    kind: "cross-tool",
    toolSlugs: ["visionary-studio", "omnimusic", "business-analytics"],
    pinned: false,
    favorite: true,
    metadata: { client: "OmniMind" },
    version: 3,
    modifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "proj-universal-001",
    name: "Universal Sandbox",
    kind: "universal",
    toolSlugs: [],
    pinned: false,
    favorite: false,
    metadata: {},
    version: 1,
    modifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_LAYOUT_PRESETS = [
  { id: "layout-default", name: "Default Three Panel" },
  { id: "layout-focus", name: "Focus Editor" },
  { id: "layout-dual", name: "Dual Split" },
];

export const COMMAND_SEED = [
  { id: "cmd-open-palette", label: "Open Command Palette", category: "navigation" as const, keys: "Ctrl+Shift+P" },
  { id: "cmd-global-search", label: "Search Everywhere", category: "navigation" as const, keys: "Ctrl+K" },
  { id: "cmd-quick-open", label: "Quick Open File", category: "file" as const, keys: "Ctrl+P" },
  { id: "cmd-save", label: "Save Workspace", category: "workspace" as const, keys: "Ctrl+S" },
  { id: "cmd-save-as", label: "Save Workspace As Snapshot", category: "workspace" as const, keys: "Ctrl+Shift+S" },
  { id: "cmd-toggle-sidebar", label: "Toggle Sidebar", category: "navigation" as const, keys: "Ctrl+B" },
  { id: "cmd-toggle-terminal", label: "Toggle Terminal", category: "developer" as const, keys: "Ctrl+`" },
  { id: "cmd-search-symbols", label: "Go to Symbol", category: "navigation" as const, keys: "Ctrl+/" },
  { id: "cmd-open-omniforge", label: "Open OmniForge Engine", category: "tool" as const, keys: null },
  { id: "cmd-open-visionary", label: "Open Visionary Studio", category: "tool" as const, keys: null },
  { id: "cmd-open-omnimusic", label: "Open OmniMusic Studio", category: "tool" as const, keys: null },
  { id: "cmd-open-medical", label: "Open Medical Diagnostic", category: "tool" as const, keys: null },
  { id: "cmd-open-marketing", label: "Open Marketing Suite", category: "tool" as const, keys: null },
  { id: "cmd-open-vfx", label: "Open VFX Engine", category: "tool" as const, keys: null },
  { id: "cmd-open-analytics", label: "Open Business Analytics", category: "tool" as const, keys: null },
  { id: "cmd-open-quantum", label: "Open Quantum Trading", category: "tool" as const, keys: null },
  { id: "cmd-open-omnicharge", label: "Open OmniCharge", category: "tool" as const, keys: null },
  { id: "cmd-ai-assist", label: "AI Assistant", category: "ai" as const, keys: "Ctrl+Shift+A" },
  { id: "cmd-ai-natural", label: "Natural Language Command", category: "ai" as const, keys: null },
  { id: "cmd-dev-console", label: "Developer Console", category: "developer" as const, keys: "Ctrl+`" },
  { id: "cmd-plugin-manager", label: "Plugin Manager", category: "plugin" as const, keys: null },
  { id: "cmd-settings", label: "Open Settings", category: "settings" as const, keys: null },
  { id: "cmd-cloud-sync", label: "Sync to Cloud", category: "settings" as const, keys: null },
  { id: "cmd-project-hub", label: "Open Project Hub", category: "workspace" as const, keys: null },
];

export const GLOBAL_SHORTCUTS = [
  { id: "sc-palette", label: "Command Palette", keys: "Ctrl+Shift+P", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-search", label: "Search Everywhere", keys: "Ctrl+K", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-quick-open", label: "Quick Open", keys: "Ctrl+P", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-save", label: "Save", keys: "Ctrl+S", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-save-as", label: "Save Snapshot", keys: "Ctrl+Shift+S", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-sidebar", label: "Toggle Sidebar", keys: "Ctrl+B", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-terminal", label: "Terminal", keys: "Ctrl+`", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-symbol", label: "Go to Symbol", keys: "Ctrl+/", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-undo", label: "Undo", keys: "Ctrl+Z", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-redo", label: "Redo", keys: "Ctrl+Shift+Z", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-ai", label: "AI Assistant", keys: "Ctrl+Shift+A", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-project-tab", label: "Next Project Tab", keys: "Ctrl+Tab", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-workspace", label: "Next Workspace", keys: "Alt+Tab", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-tool-1", label: "Switch Tool 1", keys: "Ctrl+1", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-tool-2", label: "Switch Tool 2", keys: "Ctrl+2", scope: "global" as const, toolSlug: null, profileId: "default" },
  { id: "sc-tool-3", label: "Switch Tool 3", keys: "Ctrl+3", scope: "global" as const, toolSlug: null, profileId: "default" },
];

export const THEME_TOKENS = [
  { id: "omnimind-dark" as const, label: "OmniMind Dark", background: "#0B0F19", foreground: "#e2e8f0", accent: "#38bdf8" },
  { id: "omnimind-light" as const, label: "OmniMind Light", background: "#f8fafc", foreground: "#0f172a", accent: "#0284c7" },
  { id: "high-contrast" as const, label: "High Contrast", background: "#000000", foreground: "#ffffff", accent: "#ffff00" },
];

export const SUPPORTED_LOCALES = [
  { id: "en" as const, label: "English" },
  { id: "ur" as const, label: "Urdu" },
  { id: "ar" as const, label: "Arabic" },
  { id: "es" as const, label: "Spanish" },
];

export const OMNICORE_VERSION = "1.0.0-rc1";

export type { OmniToolSlug };
