import { APP_VIEWS } from "./app-views";
import { ACTIVITY_MENU_GROUPS } from "./workbench-layout";
import { SOVEREIGN_TOOLS, type SovereignToolSlug } from "./sovereign-tool-registry";

const MEDIA_VIEW_IDS = new Set(["omnimusic", "omnimovies", "omnitv", "omnimap", "omnicharge"]);

const MEDIA_SOVEREIGN_SLUGS = new Set<SovereignToolSlug>([
  "omnimusic",
  "omnimovies",
  "omnitv",
  "omnimap",
]);

const ACTIVITY_SLUGS = new Set(
  ACTIVITY_MENU_GROUPS.flatMap((g) => g.slugs),
);

/** Home — Neural Chatbot dashboard entry. */
export function getGlobalMenuHome() {
  return APP_VIEWS.find((v) => v.id === "sovereign-core")!;
}

/** Media & maps macros — shown once (not repeated under sovereign tools). */
export function getGlobalMenuMediaViews() {
  return APP_VIEWS.filter((v) => MEDIA_VIEW_IDS.has(v.id));
}

/** Workbench tool groups — canonical sovereign tool list (no duplicates). */
export function getGlobalMenuToolGroups() {
  return ACTIVITY_MENU_GROUPS;
}

/** Sovereign tools not covered by media macros or activity groups (e.g. OmniTranslator). */
export function getGlobalMenuExtraTools() {
  return SOVEREIGN_TOOLS.filter(
    (t) => !MEDIA_SOVEREIGN_SLUGS.has(t.slug) && !ACTIVITY_SLUGS.has(t.slug),
  );
}
