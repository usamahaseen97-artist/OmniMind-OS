"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
import { getSovereignTool } from "../../lib/sovereign-tool-registry";
import { isProtectedShellTool } from "../../lib/omnimind-os-pilot";
import type { WorkspaceTab } from "../../lib/workspace-engine/types";
import { WidgetLoading } from "../ide/WidgetLoading";

const WorkbenchLayoutRouter = dynamic(
  () =>
    import("../ide/layouts/WorkbenchLayoutRouter").then((m) => ({
      default: m.WorkbenchLayoutRouter,
    })),
  { ssr: false, loading: () => <WidgetLoading label="tool" /> },
);

const OmniMindHomeDashboard = dynamic(
  () =>
    import("../ecosystem/os/OmniMindHomeDashboard").then((m) => ({
      default: m.OmniMindHomeDashboard,
    })),
  { ssr: false, loading: () => <WidgetLoading label="dashboard" /> },
);

export const OmniMindWorkspaceToolPane = memo(function OmniMindWorkspaceToolPane({
  tab,
}: {
  tab: WorkspaceTab | null;
}) {
  if (!tab) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
        Open a tool from the sidebar or press ⌘K
      </div>
    );
  }

  if (tab.href === "/" || tab.kind === "home") {
    return <OmniMindHomeDashboard />;
  }

  const tool = tab.toolSlug
    ? getSovereignTool(tab.toolSlug)
    : getSovereignTool(tab.href.replace(/^\//, ""));

  if (!tool) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
        Loading {tab.title}…
      </div>
    );
  }

  if (isProtectedShellTool(tool.slug)) {
    return <WorkbenchLayoutRouter tool={tool} />;
  }

  return <WorkbenchLayoutRouter tool={tool} />;
});
