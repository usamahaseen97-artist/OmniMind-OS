"use client";

import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { usesOmniMindOSShell } from "../../lib/omnimind-os-pilot";
import { getLayoutFlags } from "../../lib/workbench-layout";
import { assertDevTrioSlug } from "../../lib/dev-trio";
import {
  OmniForgeIdeSync,
  OmniForgeWorkspaceProvider,
} from "../../lib/omniforge-workspace";
import { OmniMindAppShell } from "../os/OmniMindAppShell";
import { IDETabBar } from "./IDETabBar";
import { IDETopMenuBar } from "./IDETopMenuBar";
import { ToolWorkbenchHeader } from "./ToolWorkbenchHeader";
import { ToolSwitcher } from "./ToolSwitcher";
import { WorkbenchLayoutRouter } from "./layouts/WorkbenchLayoutRouter";
import { ThemeHub } from "../theme/ThemeHub";

interface SovereignWorkbenchShellProps {
  tool: SovereignToolDef;
}

export function SovereignWorkbenchShell({ tool }: SovereignWorkbenchShellProps) {
  const { fullIdeMode } = getLayoutFlags(tool.slug);
  const isOmniForge = tool.slug === "omniforge-engine";
  const isOsShell = usesOmniMindOSShell(tool.slug);

  const shell = (
    <>
      {isOmniForge ? <OmniForgeIdeSync /> : null}
      <div
        className="omni-workbench-shell flex h-screen max-h-screen w-full max-w-[100vw] flex-col overflow-hidden"
        style={{
          background: isOmniForge ? "#13151A" : undefined,
          color: isOmniForge ? "#FFFFFF" : "#e1dbf5",
        }}
      >
        {fullIdeMode && !isOmniForge && !isOsShell ? (
          <>
            <IDETopMenuBar tool={tool} trailing={<ThemeHub />} />
            <IDETabBar />
          </>
        ) : isOmniForge || isOsShell ? null : tool.slug === "digital-marketing-hub" || tool.slug === "visionary-studio" ? null : (
          <ToolWorkbenchHeader tool={tool} trailing={<ThemeHub />} />
        )}
        {tool.slug === "digital-marketing-hub" ? (
          <div className="omni-studio-header flex h-10 shrink-0 items-center justify-between gap-2 border-b px-3">
            <ToolSwitcher tool={tool} />
            <ThemeHub />
          </div>
        ) : null}
        <WorkbenchLayoutRouter tool={tool} />
      </div>
    </>
  );

  if (isOmniForge) {
    return (
      <OmniForgeWorkspaceProvider toolSlug={assertDevTrioSlug(tool.slug)}>
        {shell}
      </OmniForgeWorkspaceProvider>
    );
  }

  if (isOsShell) {
    return (
      <OmniMindAppShell tool={tool} hideWorkspaceHeader designMode={undefined} />
    );
  }

  return shell;
}

export function OmniMindIDEShell({ tool }: SovereignWorkbenchShellProps) {
  return <SovereignWorkbenchShell tool={tool} />;
}
