"use client";

import { memo, useMemo } from "react";
import { Group, Panel } from "react-resizable-panels";
import { useWorkspaceEngine } from "../../lib/workspace-engine-context";
import { SplitResizeHandle } from "../ide/layouts/SplitWorkspace";
import { OmniMindWorkspaceToolPane } from "./OmniMindWorkspaceToolPane";

const PANEL_CLASS = "flex min-h-0 min-w-0 flex-col overflow-hidden";

export const OmniMindWorkspaceSplitLayout = memo(function OmniMindWorkspaceSplitLayout() {
  const { splitMode, paneTabIds, tabs } = useWorkspaceEngine();

  const panes = useMemo(
    () =>
      paneTabIds.map((id) => (id ? tabs.find((t) => t.id === id) ?? null : null)),
    [paneTabIds, tabs],
  );

  if (splitMode === "single") {
    return (
      <div className="min-h-0 flex-1 overflow-hidden">
        <OmniMindWorkspaceToolPane tab={panes[0] ?? null} />
      </div>
    );
  }

  if (splitMode === "horizontal" || splitMode === "compare") {
    return (
      <Group orientation="horizontal" className="min-h-0 flex-1" autoSave="omni-ws-split-h">
        <Panel defaultSize={50} minSize={20} className={PANEL_CLASS}>
          <OmniMindWorkspaceToolPane tab={panes[0] ?? null} />
        </Panel>
        <SplitResizeHandle orientation="horizontal" />
        <Panel defaultSize={50} minSize={20} className={PANEL_CLASS}>
          <OmniMindWorkspaceToolPane tab={panes[1] ?? panes[0] ?? null} />
        </Panel>
      </Group>
    );
  }

  if (splitMode === "vertical" || splitMode === "preview") {
    return (
      <Group orientation="vertical" className="min-h-0 flex-1" autoSave="omni-ws-split-v">
        <Panel defaultSize={splitMode === "preview" ? 72 : 50} minSize={20} className={PANEL_CLASS}>
          <OmniMindWorkspaceToolPane tab={panes[0] ?? null} />
        </Panel>
        <SplitResizeHandle orientation="vertical" />
        <Panel defaultSize={splitMode === "preview" ? 28 : 50} minSize={15} className={PANEL_CLASS}>
          <OmniMindWorkspaceToolPane tab={panes[1] ?? panes[0] ?? null} />
        </Panel>
      </Group>
    );
  }

  if (splitMode === "quad") {
    return (
      <Group orientation="vertical" className="min-h-0 flex-1" autoSave="omni-ws-split-q-v">
        <Panel defaultSize={50} minSize={20} className={PANEL_CLASS}>
          <Group orientation="horizontal" className="h-full">
            <Panel defaultSize={50} minSize={15} className={PANEL_CLASS}>
              <OmniMindWorkspaceToolPane tab={panes[0] ?? null} />
            </Panel>
            <SplitResizeHandle orientation="horizontal" />
            <Panel defaultSize={50} minSize={15} className={PANEL_CLASS}>
              <OmniMindWorkspaceToolPane tab={panes[1] ?? null} />
            </Panel>
          </Group>
        </Panel>
        <SplitResizeHandle orientation="vertical" />
        <Panel defaultSize={50} minSize={20} className={PANEL_CLASS}>
          <Group orientation="horizontal" className="h-full">
            <Panel defaultSize={50} minSize={15} className={PANEL_CLASS}>
              <OmniMindWorkspaceToolPane tab={panes[2] ?? null} />
            </Panel>
            <SplitResizeHandle orientation="horizontal" />
            <Panel defaultSize={50} minSize={15} className={PANEL_CLASS}>
              <OmniMindWorkspaceToolPane tab={panes[3] ?? null} />
            </Panel>
          </Group>
        </Panel>
      </Group>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <OmniMindWorkspaceToolPane tab={panes[0] ?? null} />
    </div>
  );
});
