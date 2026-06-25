"use client";

import type { ReactNode } from "react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { useActiveWorkspaceTool } from "../../lib/workspace-engine-context";
import { OmniMindWorkspaceEngine } from "../workspace-engine/OmniMindWorkspaceEngine";
import { OmniMindOSCopilot } from "./OmniMindOSCopilot";
import { OmniMindOSHeader } from "./OmniMindOSHeader";
import { OmniMindOSSidebar } from "./OmniMindOSSidebar";
import { OmniMindOSStatusBar } from "./OmniMindOSStatusBar";
import { OS_TOKENS } from "./tokens";

export type OmniMindAppShellProps = {
  tool: SovereignToolDef;
  workspace?: ReactNode;
  designMode?: boolean;
  workspaceTitle?: string;
  hideWorkspaceHeader?: boolean;
};

/**
 * Canonical OmniMind OS App Shell — single layout for every tool.
 * Center region is the Workspace Engine (tabs, splits, dock panels).
 */
export function OmniMindAppShell({
  tool,
  workspace,
  designMode,
}: OmniMindAppShellProps) {
  const activeTool = useActiveWorkspaceTool() ?? tool;

  return (
    <div
      className="omni-os-shell omni-app-shell flex h-full min-h-0 w-full flex-col overflow-hidden"
      style={{ background: OS_TOKENS.bg.shell, color: OS_TOKENS.text.primary }}
      data-omni-app-shell="true"
      data-tool={activeTool.slug}
    >
      <OmniMindOSHeader tool={activeTool} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <OmniMindOSSidebar activeSlug={activeTool.slug} />

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <section
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            style={{ background: OS_TOKENS.bg.workspace }}
          >
            {workspace ?? <OmniMindWorkspaceEngine />}
          </section>

          <OmniMindOSCopilot tool={activeTool} designMode={designMode} />
        </div>
      </div>

      <OmniMindOSStatusBar tool={activeTool} />
    </div>
  );
}
