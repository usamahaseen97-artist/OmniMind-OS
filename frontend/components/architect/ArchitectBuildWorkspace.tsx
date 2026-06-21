"use client";

import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import type { ArchitectBuildMode } from "../../lib/architect-flow";
import { SovereignWorkbenchShell } from "../ide/SovereignWorkbenchShell";

interface ArchitectBuildWorkspaceProps {
  tool: SovereignToolDef;
  mode: ArchitectBuildMode;
}

/** Production IDE shell — App, Game, Business modules */
export function ArchitectBuildWorkspace({ tool }: ArchitectBuildWorkspaceProps) {
  return <SovereignWorkbenchShell tool={tool} />;
}
