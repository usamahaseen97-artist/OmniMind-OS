/** OmniMind Ecosystem — unified tool routes, breadcrumbs, command palette entries. */

export type EcosystemToolId =
  | "omniforge"
  | "omnimusic"
  | "omnivision"
  | "omnicode"
  | "omnichat"
  | "omnidocs"
  | "omniai"
  | "omnicloud"
  | "omnideploy"
  | "settings";

export type WorkspaceProfileId =
  | "personal"
  | "business"
  | "client"
  | "gaming"
  | "ai"
  | "school"
  | "recent";

export type SwarmAgentId =
  | "general"
  | "backend"
  | "frontend"
  | "database"
  | "security"
  | "testing"
  | "devops"
  | "ui"
  | "game"
  | "music";

export const ECOSYSTEM_TOOLS: {
  id: EcosystemToolId;
  label: string;
  href: string;
  breadcrumb: string;
}[] = [
  { id: "omniforge", label: "OmniForge", href: "/omniforge-engine", breadcrumb: "OmniForge" },
  { id: "omnimusic", label: "OmniMusic", href: "/omnimusic", breadcrumb: "OmniMusic" },
  { id: "omnivision", label: "OmniVision", href: "/creative-visionary", breadcrumb: "OmniVision" },
  { id: "omnicode", label: "OmniCode", href: "/omniforge-engine?mode=code", breadcrumb: "OmniCode" },
  { id: "omnichat", label: "OmniChat", href: "/", breadcrumb: "OmniChat" },
  { id: "omnidocs", label: "OmniDocs", href: "/?tab=docs", breadcrumb: "OmniDocs" },
  { id: "omniai", label: "OmniAI", href: "/", breadcrumb: "OmniAI" },
  { id: "omnicloud", label: "OmniCloud", href: "/omnicloud", breadcrumb: "OmniCloud" },
  { id: "omnideploy", label: "OmniDeploy", href: "/omniforge-engine?panel=deploy", breadcrumb: "OmniDeploy" },
  { id: "settings", label: "Settings", href: "/?settings=1", breadcrumb: "Settings" },
];

export const WORKSPACE_PROFILES: { id: WorkspaceProfileId; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "business", label: "Business" },
  { id: "client", label: "Client" },
  { id: "gaming", label: "Gaming" },
  { id: "ai", label: "AI" },
  { id: "school", label: "School" },
  { id: "recent", label: "Recent" },
];

export const SWARM_AGENTS: { id: SwarmAgentId; label: string; color: string }[] = [
  { id: "general", label: "General", color: "#a5b4fc" },
  { id: "backend", label: "Backend", color: "#34d399" },
  { id: "frontend", label: "Frontend", color: "#22d3ee" },
  { id: "database", label: "Database", color: "#fbbf24" },
  { id: "security", label: "Security", color: "#f87171" },
  { id: "testing", label: "Testing", color: "#c084fc" },
  { id: "devops", label: "DevOps", color: "#fb923c" },
  { id: "ui", label: "UI", color: "#e879f9" },
  { id: "game", label: "Game", color: "#4ade80" },
  { id: "music", label: "Music", color: "#38bdf8" },
];

export type CommandPaletteItem = {
  id: string;
  label: string;
  group: string;
  keywords?: string;
  action: "navigate" | "command" | "tool";
  href?: string;
  toolId?: EcosystemToolId;
  command?: string;
};

export const COMMAND_PALETTE_ITEMS: CommandPaletteItem[] = [
  { id: "build-website", label: "Build Website", group: "OmniForge", action: "command", command: "scaffold:Build a production website" },
  { id: "fix-bugs", label: "Fix Bugs", group: "OmniForge", action: "command", command: "agent:Find and fix bugs in the workspace" },
  { id: "switch-omniforge", label: "Open OmniForge", group: "Switch Tool", action: "tool", toolId: "omniforge" },
  { id: "switch-music", label: "Open OmniMusic", group: "Switch Tool", action: "tool", toolId: "omnimusic" },
  { id: "switch-vision", label: "Open OmniVision", group: "Switch Tool", action: "tool", toolId: "omnivision" },
  { id: "switch-chat", label: "Open OmniChat", group: "Switch Tool", action: "tool", toolId: "omnichat" },
  { id: "switch-deploy", label: "Open OmniDeploy", group: "Switch Tool", action: "tool", toolId: "omnideploy" },
  { id: "new-project", label: "New Project", group: "Project", action: "command", command: "project:new" },
  { id: "clone-project", label: "Clone Project", group: "Project", action: "command", command: "project:clone" },
  { id: "export-project", label: "Export Project", group: "Project", action: "command", command: "project:export" },
  { id: "toggle-sidebar", label: "Toggle Sidebar", group: "View", action: "command", command: "view:toggle-sidebar" },
  { id: "run-preview", label: "Run Preview (F5)", group: "Run", action: "command", command: "run:preview" },
];

export function ecosystemToolByPath(pathname: string): (typeof ECOSYSTEM_TOOLS)[number] {
  if (pathname.startsWith("/omniforge-engine")) return ECOSYSTEM_TOOLS.find((t) => t.id === "omniforge")!;
  if (pathname.startsWith("/omnimusic")) return ECOSYSTEM_TOOLS.find((t) => t.id === "omnimusic")!;
  if (pathname.startsWith("/creative-visionary") || pathname.startsWith("/visionary-studio")) {
    return ECOSYSTEM_TOOLS.find((t) => t.id === "omnivision")!;
  }
  if (pathname.startsWith("/omnicloud")) return ECOSYSTEM_TOOLS.find((t) => t.id === "omnicloud")!;
  if (pathname === "/" || pathname.startsWith("/dashboard")) return ECOSYSTEM_TOOLS.find((t) => t.id === "omnichat")!;
  return ECOSYSTEM_TOOLS.find((t) => t.id === "omniforge")!;
}

/** Platform shell routes not in ECOSYSTEM_TOOLS — used for breadcrumbs only. */
export const SHELL_ROUTE_LABELS: Record<string, string> = {
  "/mission-control": "Mission Control",
  "/automation-engine": "Automation Engine",
  "/marketplace": "Marketplace",
  "/medical-diagnostic": "Medical Diagnostic",
  "/architectural-designer": "Architectural Designer",
  "/interior-landscape": "Interior Landscape",
  "/quantum-trading": "Quantum Trading",
  "/business-analytics": "Business Analytics",
  "/vfx-master": "VFX Master",
  "/nasa-solver": "NASA Solver",
  "/digital-marketing-hub": "Marketing Hub",
  "/omnimap": "OmniMap",
  "/omnitv": "OmniTV",
  "/omnimovies": "OmniMovies",
  "/omnitranslator": "OmniTranslator",
};

export function shellRouteLabel(pathname: string): string | null {
  const base = pathname.split("?")[0] ?? pathname;
  if (SHELL_ROUTE_LABELS[base]) return SHELL_ROUTE_LABELS[base];
  for (const [route, label] of Object.entries(SHELL_ROUTE_LABELS)) {
    if (base.startsWith(route)) return label;
  }
  return null;
}

export function buildBreadcrumbs(
  tool: (typeof ECOSYSTEM_TOOLS)[number],
  segments: string[],
  pathname?: string,
): string[] {
  const shell = pathname ? shellRouteLabel(pathname) : null;
  if (shell) return ["OmniMind", shell, ...segments.filter(Boolean)];
  return ["OmniMind", tool.breadcrumb, ...segments.filter(Boolean)];
}
