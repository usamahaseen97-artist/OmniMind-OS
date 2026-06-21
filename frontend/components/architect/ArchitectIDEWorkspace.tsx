"use client";

import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import type { ArchitectBuildMode } from "../../lib/architect-flow";
import { ArchitectBuildWorkspace } from "./ArchitectBuildWorkspace";

interface ArchitectIDEWorkspaceProps {
  tool: SovereignToolDef;
  mode: ArchitectBuildMode;
}

/** @deprecated Use ArchitectBuildWorkspace / OmniMindIDEShell */
export function ArchitectIDEWorkspace({ tool }: ArchitectIDEWorkspaceProps) {
  return <ArchitectBuildWorkspace tool={tool} mode="game" />;
}
