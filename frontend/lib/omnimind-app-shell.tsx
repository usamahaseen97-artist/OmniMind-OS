"use client";

import type { ReactNode } from "react";
import type { SovereignToolDef } from "./sovereign-tool-registry";
import { usesOmniMindOSShell } from "./omnimind-os-pilot";
import { OmniMindAppShell } from "../components/os/OmniMindAppShell";

/** Wrap tool workspace in the canonical App Shell when not a protected system. */
export function wrapInAppShell(
  tool: SovereignToolDef,
  workspace: ReactNode,
  opts?: { designMode?: boolean; workspaceTitle?: string; hideWorkspaceHeader?: boolean },
): ReactNode {
  if (!usesOmniMindOSShell(tool.slug)) return workspace;

  return (
    <OmniMindAppShell
      tool={tool}
      workspace={workspace}
      designMode={opts?.designMode}
      workspaceTitle={opts?.workspaceTitle ?? tool.name}
      hideWorkspaceHeader={opts?.hideWorkspaceHeader ?? true}
    />
  );
}
