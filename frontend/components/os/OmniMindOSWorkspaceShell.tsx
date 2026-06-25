"use client";

import type { ReactNode } from "react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { OmniMindAppShell } from "./OmniMindAppShell";

/** @deprecated Use OmniMindAppShell — backward-compatible alias */
export function OmniMindOSWorkspaceShell({
  tool,
  workspace,
  designMode,
  workspaceTitle,
}: {
  tool: SovereignToolDef;
  workspace: ReactNode;
  designMode?: boolean;
  workspaceTitle?: string;
}) {
  return (
    <OmniMindAppShell
      tool={tool}
      workspace={workspace}
      designMode={designMode}
      workspaceTitle={workspaceTitle}
    />
  );
}

export type OmniMindOSWorkspaceShellProps = {
  tool: SovereignToolDef;
  workspace: ReactNode;
  designMode?: boolean;
  workspaceTitle?: string;
};
