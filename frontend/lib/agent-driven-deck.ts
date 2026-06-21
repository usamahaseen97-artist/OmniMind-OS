import type { OmniRouteId } from "./omni-tools";

/** Routes whose live deck is driven by stream interceptor + workbench screen sync. */
export const AGENT_DRIVEN_DECK_ROUTES: readonly OmniRouteId[] = [
  "business-analytics",
  "omniforge-engine",
  "medical-diagnostic",
  "quantum-trading",
  "architectural-designer",
  "nasa-science-solver",
  "creative-visionary",
  "vfx-master",
  "marketing-ad-king",
] as const;

export function isAgentDrivenDeckRoute(routeId: string): boolean {
  return (AGENT_DRIVEN_DECK_ROUTES as readonly string[]).includes(routeId);
}
