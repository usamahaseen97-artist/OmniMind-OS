"use client";

import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import {
  WorkspaceAppDev,
} from "../workspace/IDEWorkspacePanels";
import {
  ToolWorkspaceAnalytics,
  ToolWorkspaceDesign,
  ToolWorkspaceGeneric,
  ToolWorkspaceMedical,
  ToolWorkspaceScience,
  ToolWorkspaceTrading,
  ToolWorkspaceVideo,
  ToolWorkspaceVfx,
} from "./workspace/ToolWorkspacePanels";

export function ToolWorkspaceMatrix({ tool }: { tool: SovereignToolDef }) {
  switch (tool.slug) {
    case "omniforge-engine":
      return <WorkspaceAppDev />;
    case "architectural-designer":
    case "interior-landscape":
      return (
        <ToolWorkspaceDesign mode={tool.slug === "interior-landscape" ? "interior" : "exterior"} />
      );
    case "medical-diagnostic":
      return <ToolWorkspaceMedical />;
    case "quantum-trading":
      return <ToolWorkspaceTrading />;
    case "creative-visionary":
      return <ToolWorkspaceVideo />;
    case "business-analytics":
      return <ToolWorkspaceAnalytics />;
    case "vfx-master":
      return <ToolWorkspaceVfx />;
    case "nasa-solver":
      return <ToolWorkspaceScience />;
    default:
      return <ToolWorkspaceGeneric tool={tool} />;
  }
}
