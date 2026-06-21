import type { SovereignToolSlug } from "./sovereign-tool-registry";
import { isDevFileTreeSlug } from "./dev-file-trees";

const EMBEDDED_UTILITY_SLUGS: SovereignToolSlug[] = [
  "architectural-designer",
  "interior-landscape",
  "creative-visionary",
  "digital-marketing-hub",
];

/** Non-dev tools that render ProjectUtilityDeck in WorkspaceShell header */
export function showWorkspaceUtilityDeck(slug: SovereignToolSlug): boolean {
  if (isDevFileTreeSlug(slug)) return false;
  if (EMBEDDED_UTILITY_SLUGS.includes(slug)) return false;
  return true;
}
