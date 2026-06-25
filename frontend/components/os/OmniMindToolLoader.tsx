"use client";

import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { DynamicSovereignWorkbenchShell } from "../ide/dynamic-sovereign-shell";

export type OmniMindToolLoaderProps = {
  tool: SovereignToolDef;
};

/**
 * Single workspace loader — every sovereign tool loads through the registry.
 * App Shell wrapping is handled by SovereignWorkbenchShell for non-protected tools.
 */
export function OmniMindToolLoader({ tool }: OmniMindToolLoaderProps) {
  return <DynamicSovereignWorkbenchShell tool={tool} />;
}
