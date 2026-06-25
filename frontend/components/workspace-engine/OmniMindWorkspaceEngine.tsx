"use client";

import { memo } from "react";
import { OmniMindWorkspaceDock } from "./OmniMindWorkspaceDock";
import { OmniMindWorkspaceQuickSwitcher } from "./OmniMindWorkspaceQuickSwitcher";
import { OmniMindWorkspaceSplitLayout } from "./OmniMindWorkspaceSplitLayout";
import { OmniMindWorkspaceTabBar } from "./OmniMindWorkspaceTabBar";
import { OmniMindWorkspaceWindowChrome } from "./OmniMindWorkspaceWindowChrome";

export type OmniMindWorkspaceEngineProps = {
  /** Legacy inline workspace — used when engine has no tabs yet */
  fallback?: React.ReactNode;
};

/**
 * Enterprise Workspace Engine — tabs, splits, dock panels, session restore.
 * Every tool opens as a desktop-style tab inside one unified workspace.
 */
export const OmniMindWorkspaceEngine = memo(function OmniMindWorkspaceEngine({
  fallback,
}: OmniMindWorkspaceEngineProps) {
  return (
    <div className="omni-workspace-engine flex h-full min-h-0 w-full flex-col overflow-hidden" data-omni-workspace-engine>
      <OmniMindWorkspaceTabBar />
      <OmniMindWorkspaceWindowChrome />
      <OmniMindWorkspaceDock>
        <OmniMindWorkspaceSplitLayout />
      </OmniMindWorkspaceDock>
      <OmniMindWorkspaceQuickSwitcher />
      {fallback ? <div className="hidden">{fallback}</div> : null}
    </div>
  );
});
