import { DEV_FILE_TREE_SLUGS, type DevFileTreeSlug } from "./dev-file-trees";
import type { SovereignToolSlug } from "./sovereign-tool-registry";

/** App & Websites · Business Website · Game Development — exclusive IDE trio */
export const DEV_TRIO_SLUGS = DEV_FILE_TREE_SLUGS;

export type DevTrioSlug = DevFileTreeSlug;

export function isDevTrioSlug(slug: string): slug is DevTrioSlug {
  return (DEV_TRIO_SLUGS as readonly string[]).includes(slug);
}

export function assertDevTrioSlug(slug: SovereignToolSlug): DevTrioSlug {
  if (!isDevTrioSlug(slug)) {
    throw new Error(`Dev trio layout is restricted to omniforge-engine (got ${slug})`);
  }
  return slug;
}
