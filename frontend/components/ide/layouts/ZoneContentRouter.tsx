"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { getModuleGroup, type WorkbenchModuleGroup } from "../../../lib/workbench-layout";
import { resetWorkbenchZones } from "../../../lib/workbench-zone-store";
import { DynamicToolLiveSimMatrix } from "../dynamic-workbench-widgets";
import { CreativeVisionaryShell } from "./CreativeVisionaryShell";
import { DigitalMarketingHubShell } from "../../marketing/DigitalMarketingHubShell";
import { ThreePanelDevShell } from "./ThreePanelDevShell";
import { SpatialStudioShell } from "./SpatialStudioShell";
import { MedicalStudioShell } from "./MedicalStudioShell";
import { WorkspaceShell } from "./WorkspaceShell";
import { BusinessAnalyticsEnterpriseWorkspace } from "../../analytics/enterprise/BusinessAnalyticsEnterpriseWorkspace";
import {
  DynamicMedicalEnterpriseWorkspace,
  DynamicOmniMusicStudioShell,
} from "./dynamic-flagship-workspaces";
import { isProtectedShellTool } from "../../../lib/omnimind-os-pilot";

function VfxRightWorkspace({ tool }: { tool: SovereignToolDef }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className="flex min-h-0 flex-[2] items-center justify-center border-b"
        style={{ borderColor: "#1E293B", background: "#000" }}
      >
        <p className="text-[10px]" style={{ color: "var(--omni-text-muted)" }}>
          Program monitor · cinematic grade preview
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <DynamicToolLiveSimMatrix tool={tool} />
      </div>
    </div>
  );
}

const GROUP_WORKSPACE: Record<
  Exclude<WorkbenchModuleGroup, "A">,
  (tool: SovereignToolDef) => { workspace: ReactNode; designMode?: boolean }
> = {
  B: (tool) => ({
    workspace: <DynamicToolLiveSimMatrix tool={tool} />,
    designMode: true,
  }),
  C: (tool) => ({ workspace: <DynamicToolLiveSimMatrix tool={tool} /> }),
  D: (tool) => ({ workspace: <DynamicToolLiveSimMatrix tool={tool} /> }),
  E: (tool) => ({ workspace: <DynamicToolLiveSimMatrix tool={tool} /> }),
  F: (tool) => ({
    workspace:
      tool.slug === "business-analytics" ? (
        <BusinessAnalyticsEnterpriseWorkspace tool={tool} />
      ) : (
        <DynamicToolLiveSimMatrix tool={tool} />
      ),
  }),
  G: (tool) => ({ workspace: <DynamicToolLiveSimMatrix tool={tool} /> }),
  H: (tool) => ({ workspace: <VfxRightWorkspace tool={tool} /> }),
  I: (tool) => ({ workspace: <DynamicToolLiveSimMatrix tool={tool} /> }),
  generic: (tool) => ({ workspace: <DynamicToolLiveSimMatrix tool={tool} /> }),
};

const embedded = { embeddedInAppShell: true as const };

export function ZoneContentRouter({ tool }: { tool: SovereignToolDef }) {
  const group = getModuleGroup(tool.slug);
  const osEmbedded = !isProtectedShellTool(tool.slug);

  useEffect(() => {
    resetWorkbenchZones();
  }, [tool.slug]);

  if (group === "A") {
    return <ThreePanelDevShell tool={tool} />;
  }

  if (group === "B") {
    return <SpatialStudioShell tool={tool} embeddedInAppShell={osEmbedded} />;
  }

  if (tool.slug === "medical-diagnostic-suite") {
    return <DynamicMedicalEnterpriseWorkspace tool={tool} {...embedded} />;
  }

  if (tool.slug === "visionary-studio" || tool.slug === "creative-visionary") {
    return <CreativeVisionaryShell tool={tool} embeddedInAppShell={osEmbedded} />;
  }

  if (tool.slug === "omnimusic") {
    return <DynamicOmniMusicStudioShell tool={tool} {...embedded} />;
  }

  if (group === "D") {
    return <MedicalStudioShell tool={tool} embeddedInAppShell={osEmbedded} />;
  }

  if (tool.slug === "digital-marketing-hub") {
    return <DigitalMarketingHubShell tool={tool} embeddedInAppShell={osEmbedded} />;
  }

  const cfg = GROUP_WORKSPACE[group](tool);

  return (
    <WorkspaceShell
      tool={tool}
      workspace={cfg.workspace}
      designMode={cfg.designMode}
      embeddedInAppShell={osEmbedded}
    />
  );
}
