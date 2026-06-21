import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Binary,
  Eye,
  Film,
  Hammer,
  HeartPulse,
  Languages,
  Layers,
  Map,
  Megaphone,
  Music,
  Sparkles,
  TrendingUp,
  Tv,
  Video,
  Zap,
} from "lucide-react";
import type { AppViewId } from "./app-views";
import type { OmniRouteId } from "./omni-tools";
import { sovereignHrefForRoute, sovereignHrefForView } from "./sovereign-route-map";
import type { SovereignToolSlug } from "./sovereign-tool-registry";

/** All 19 OmniMind V11 tool nodes (image_20 architecture) */
export type UnifiedToolId =
  | "neural-chat"
  | "omni-music"
  | "omni-movies"
  | "omni-tv"
  | "translator"
  | "marketing-tool"
  | "visionary-ai"
  | "vfx-editor"
  | "architectural-designer"
  | "omniforge-engine"
  | "science-solver"
  | "analytics-server"
  | "medical-agent"
  | "quantum-trading"
  | "omni-charge"
  | "omni-map";

export type UtilityTab = "chat" | "search" | "media" | "docs";

export type NavTreeItem = {
  id: UnifiedToolId;
  name: string;
  icon: LucideIcon;
};

export type NavTreeCategory = {
  category: string;
  items: NavTreeItem[];
};

/** Complete 19-tool navigation — grouped by professional architecture */
export const OMNIMIND_NAV_TREE: NavTreeCategory[] = [
  {
    category: "Core Intelligence",
    items: [
      { id: "neural-chat", name: "1. Neural Chatbot", icon: Sparkles },
      { id: "translator", name: "5. AI Translator", icon: Languages },
      { id: "medical-agent", name: "16. Medical Diagnostic Agent", icon: HeartPulse },
    ],
  },
  {
    category: "Media & Entertainment",
    items: [
      { id: "omni-music", name: "2. OmniMusic Core", icon: Music },
      { id: "omni-movies", name: "3. OmniMovies Engine", icon: Video },
      { id: "omni-tv", name: "4. OmniTV Console", icon: Tv },
    ],
  },
  {
    category: "Creative & Design AI",
    items: [
      { id: "visionary-ai", name: "8. Visionary Image/Video Gen", icon: Eye },
      { id: "vfx-editor", name: "9. VFX Editor Studio", icon: Film },
      { id: "architectural-designer", name: "10. Architectural Designer", icon: Layers },
      { id: "marketing-tool", name: "7. AI Marketing Tool", icon: Megaphone },
    ],
  },
  {
    category: "Build & Deploy Infrastructure",
    items: [
      { id: "omniforge-engine", name: "OmniForge Engine", icon: Hammer },
    ],
  },
  {
    category: "Computational & Financial",
    items: [
      { id: "analytics-server", name: "15. Business Analytics Server", icon: BarChart3 },
      { id: "quantum-trading", name: "17. Quantum Trading Module", icon: TrendingUp },
      { id: "science-solver", name: "14. NASA Science Solver", icon: Binary },
      { id: "omni-charge", name: "18. OmniCharge Utility", icon: Zap },
      { id: "omni-map", name: "19. OmniMap System", icon: Map },
    ],
  },
];

const ROUTE_TO_TOOL: Partial<Record<string, UnifiedToolId>> = {
  dashboard: "neural-chat",
  "ai-omnimaps": "omni-map",
  "marketing-ad-king": "marketing-tool",
  "creative-visionary": "visionary-ai",
  "vfx-editor": "vfx-editor",
  "vfx-master": "vfx-editor",
  "architectural-designer": "architectural-designer",
  "omniforge-engine": "omniforge-engine",
  "business-software-architect": "omniforge-engine",
  "app-and-develop": "omniforge-engine",
  "game-app-architect": "omniforge-engine",
  "business-analytics": "analytics-server",
  "medical-diagnostic": "medical-agent",
  "quantum-trading": "quantum-trading",
  "nasa-science-solver": "science-solver",
};

const TOOL_TO_ROUTE: Partial<Record<UnifiedToolId, OmniRouteId>> = {
  "neural-chat": "dashboard",
  translator: "dashboard",
  "omni-map": "ai-omnimaps",
  "marketing-tool": "marketing-ad-king",
  "visionary-ai": "creative-visionary",
  "vfx-editor": "vfx-editor",
  "architectural-designer": "architectural-designer",
  "omniforge-engine": "omniforge-engine",
  "analytics-server": "business-analytics",
  "medical-agent": "medical-diagnostic",
  "quantum-trading": "quantum-trading",
  "science-solver": "nasa-science-solver",
};

const TOOL_TO_VIEW: Partial<Record<UnifiedToolId, AppViewId>> = {
  "omni-music": "omnimusic",
  "omni-movies": "omnimovies",
  "omni-tv": "omnitv",
  "omni-charge": "omnicharge",
};

export function routeIdToUnifiedTool(routeId: string): UnifiedToolId {
  return ROUTE_TO_TOOL[routeId] ?? "neural-chat";
}

export function unifiedToolToRouteId(tool: UnifiedToolId): OmniRouteId | null {
  return TOOL_TO_ROUTE[tool] ?? null;
}

export function unifiedToolToAppView(tool: UnifiedToolId): AppViewId | null {
  return TOOL_TO_VIEW[tool] ?? null;
}

const UNIFIED_TOOL_SOVEREIGN_SLUG: Partial<Record<UnifiedToolId, SovereignToolSlug>> = {
  translator: "omnitranslator",
  "omniforge-engine": "omniforge-engine",
};

/** Preferred Next.js path for mounting the full specialized tool dashboard. */
export function unifiedToolNavigationHref(tool: UnifiedToolId): string | null {
  const view = unifiedToolToAppView(tool);
  if (view) {
    return sovereignHrefForView(view);
  }

  const slug = UNIFIED_TOOL_SOVEREIGN_SLUG[tool];
  if (slug) {
    return `/${slug}`;
  }

  const route = unifiedToolToRouteId(tool);
  if (route) {
    return sovereignHrefForRoute(route);
  }

  return null;
}

/** Whether selecting this tool should stay on the home shell (no dedicated route). */
export function unifiedToolUsesHomeShell(tool: UnifiedToolId): boolean {
  return tool === "omni-charge";
}

export function toolDisplayName(tool: UnifiedToolId): string {
  for (const cat of OMNIMIND_NAV_TREE) {
    const hit = cat.items.find((item) => item.id === tool);
    if (hit) return hit.name;
  }
  return formatToolLabel(tool);
}

export function formatToolLabel(tool: UnifiedToolId): string {
  return tool.replace(/-/g, " ");
}
