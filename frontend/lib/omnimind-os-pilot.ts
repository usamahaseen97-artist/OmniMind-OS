import type { SovereignToolDef, SovereignToolSlug } from "./sovereign-tool-registry";
import { getSovereignTool, SOVEREIGN_TOOLS } from "./sovereign-tool-registry";
import { Sparkles } from "lucide-react";

/**
 * Protected systems — keep native shells (OmniForge Engine, Architectural Designer core).
 * Integrate via existing interfaces; never replace these layouts.
 */
export const PROTECTED_SHELL_SLUGS: ReadonlySet<SovereignToolSlug> = new Set([
  "omniforge-engine",
  "architectural-designer",
]);

/** Platform routes that use the unified OS shell (dedicated workspaces). */
export const OS_PLATFORM_ROUTES = new Set([
  "/",
  "/mission-control",
  "/automation-engine",
  "/omnicloud",
  "/marketplace",
]);

export function isProtectedShellTool(slug: SovereignToolSlug): boolean {
  return PROTECTED_SHELL_SLUGS.has(slug);
}

/** All sovereign tools except protected systems use the unified OmniMind App Shell. */
export function usesOmniMindOSShell(slug: SovereignToolSlug): boolean {
  return !PROTECTED_SHELL_SLUGS.has(slug);
}

export function shouldHideEcosystemChrome(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? "/";
  if (OS_PLATFORM_ROUTES.has(path)) return true;
  const slug = path.replace(/^\//, "") as SovereignToolSlug;
  const tool = getSovereignTool(slug);
  return tool ? usesOmniMindOSShell(tool.slug) : false;
}

/** Virtual home tool for the global AI copilot on `/`. */
export const OMNI_OS_HOME_TOOL: SovereignToolDef = {
  slug: "business-analytics",
  href: "/business-analytics",
  name: "OmniMind OS",
  tagline: "Neural command center",
  description: "Universal AI operating system — tools, agents, and workspaces",
  icon: Sparkles,
  layout: "analytics-dashboard",
  omniRouteId: "dashboard",
};

export const OMNI_OS_PILOT_SLUGS: ReadonlySet<SovereignToolSlug> = new Set(
  SOVEREIGN_TOOLS.filter((t) => usesOmniMindOSShell(t.slug)).map((t) => t.slug),
);
