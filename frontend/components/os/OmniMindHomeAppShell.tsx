"use client";

import { OMNI_OS_HOME_TOOL } from "../../lib/omnimind-os-pilot";
import { useActiveWorkspaceTool } from "../../lib/workspace-engine-context";
import { OmniMindWorkspaceEngine } from "../workspace-engine/OmniMindWorkspaceEngine";
import { OmniMindOSCopilot } from "./OmniMindOSCopilot";
import { OmniMindOSHeader } from "./OmniMindOSHeader";
import { OmniMindOSSidebar } from "./OmniMindOSSidebar";
import { OmniMindOSStatusBar } from "./OmniMindOSStatusBar";
import { OS_TOKENS } from "./tokens";

/**
 * Home route App Shell — Workspace Engine drives dashboard / chat tabs.
 */
export function OmniMindHomeAppShell() {
  const activeTool = useActiveWorkspaceTool() ?? OMNI_OS_HOME_TOOL;

  return (
    <div
      className="omni-os-shell omni-app-shell flex h-full min-h-0 w-full flex-col overflow-hidden"
      style={{ background: OS_TOKENS.bg.shell, color: OS_TOKENS.text.primary }}
      data-omni-app-shell="home"
    >
      <OmniMindOSHeader />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <OmniMindOSSidebar />

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <section
            className="min-h-0 min-w-0 flex-1 overflow-hidden"
            style={{ background: OS_TOKENS.bg.workspace }}
          >
            <OmniMindWorkspaceEngine />
          </section>

          <OmniMindOSCopilot tool={activeTool} />
        </div>
      </div>

      <OmniMindOSStatusBar />
    </div>
  );
}
