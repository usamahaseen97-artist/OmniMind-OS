import type { OmniRouteId } from "./omni-tools";
import type { SovereignToolSlug } from "./sovereign-tool-registry";

/** Maps legacy OmniRouteId (home menu) → sovereign Next.js path. */
export const OMNI_ROUTE_TO_SOVEREIGN: Partial<Record<OmniRouteId, `/${SovereignToolSlug}`>> = {
  "omniforge-engine": "/omniforge-engine",
  "game-app-architect": "/omniforge-engine",
  "app-and-develop": "/omniforge-engine",
  "architectural-designer": "/architectural-designer",
  "business-software-architect": "/omniforge-engine",
  "medical-diagnostic": "/medical-diagnostic",
  "medical-diagnostic-suite": "/medical-diagnostic-suite",
  "quantum-trading": "/quantum-trading",
  "creative-visionary": "/creative-visionary",
  "visionary-studio": "/visionary-studio",
  "business-analytics": "/business-analytics",
  "vfx-master": "/vfx-master",
  "vfx-editor": "/vfx-master",
  "nasa-science-solver": "/nasa-solver",
  "marketing-ad-king": "/digital-marketing-hub",
  "ai-omnimaps": "/omnimap",
};

export const APP_VIEW_TO_SOVEREIGN: Partial<Record<string, `/${SovereignToolSlug}`>> = {
  omnimusic: "/omnimusic",
  omnitv: "/omnitv",
  omnimovies: "/omnimovies",
  omnistream: "/omnimovies",
  omnimap: "/omnimap",
};

export function sovereignHrefForRoute(routeId: OmniRouteId): `/${SovereignToolSlug}` | null {
  return OMNI_ROUTE_TO_SOVEREIGN[routeId] ?? null;
}

export function sovereignHrefForView(viewId: string): `/${SovereignToolSlug}` | null {
  return APP_VIEW_TO_SOVEREIGN[viewId] ?? null;
}
