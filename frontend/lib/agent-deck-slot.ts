import type { OmniRouteId } from "./omni-tools";

/** Right-deck visual mode — one slot per agent architecture family. */
export type AgentDeckSlot =
  | "idle"
  | "devops"
  | "vfx"
  | "creative"
  | "architecture"
  | "marketing"
  | "analytics"
  | "trading"
  | "medical"
  | "game"
  | "nasa"
  | "maps"
  | "meta";

const ROUTE_SLOT: Partial<Record<OmniRouteId, AgentDeckSlot>> = {
  dashboard: "idle",
  "omniforge-engine": "devops",
  "app-and-develop": "devops",
  "business-software-architect": "devops",
  "game-app-architect": "game",
  "vfx-editor": "vfx",
  "vfx-master": "vfx",
  "creative-visionary": "creative",
  "architectural-designer": "architecture",
  "marketing-ad-king": "marketing",
  "business-analytics": "analytics",
  "quantum-trading": "trading",
  "medical-diagnostic": "medical",
  "nasa-science-solver": "nasa",
  "ai-omnimaps": "maps",
  "meta-agent": "meta",
};

export function resolveAgentDeckSlot(routeId: string): AgentDeckSlot {
  return ROUTE_SLOT[routeId as OmniRouteId] ?? "idle";
}
