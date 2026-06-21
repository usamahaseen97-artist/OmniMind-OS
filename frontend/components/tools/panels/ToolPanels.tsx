"use client";

import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { SovereignWorkbenchShell } from "../../ide/SovereignWorkbenchShell";

/** Unified sovereign workbench — all 16 tools share the IDE chrome + tool matrix */
export function SovereignToolContent({ tool }: { tool: SovereignToolDef }) {
  return <SovereignWorkbenchShell tool={tool} />;
}
