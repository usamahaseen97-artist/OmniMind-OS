"use client";

import { Group, Panel, Separator } from "react-resizable-panels";
import { OF } from "./omniforge-theme";

export function OmniForgeColHandle() {
  return (
    <Separator
      className="group relative z-20 flex w-1 shrink-0 cursor-col-resize items-center justify-center transition-colors hover:bg-cyan-500/20"
      style={{ background: OF.glassBorder }}
    >
      <span className="h-10 w-0.5 rounded-full bg-cyan-400/0 transition-all group-hover:bg-cyan-400/80" />
    </Separator>
  );
}

export function OmniForgeRowHandle() {
  return (
    <Separator
      className="group relative z-20 flex h-1 shrink-0 cursor-row-resize items-center justify-center transition-colors hover:bg-cyan-500/20"
      style={{ background: OF.glassBorder }}
    >
      <span className="h-0.5 w-10 rounded-full bg-cyan-400/0 transition-all group-hover:bg-cyan-400/80" />
    </Separator>
  );
}

/**
 * Unified 3-pane OmniForge workbench:
 * AI Agent · Code+Terminal (with embedded explorer) · Live Preview
 */
export function OmniForgeTriPaneGrid({
  agent,
  codingWorkspace,
  visualPreview,
}: {
  agent: React.ReactNode;
  codingWorkspace: React.ReactNode;
  visualPreview: React.ReactNode;
}) {
  return (
    <Group orientation="horizontal" className="h-full min-h-0 flex-1" autoSave="omniforge-tri-pane-v1">
      <Panel id="agent" defaultSize={22} minSize={16} maxSize={32} collapsible collapsedSize={3}>
        {agent}
      </Panel>
      <OmniForgeColHandle />
      <Panel id="editor" defaultSize={48} minSize={36}>
        {codingWorkspace}
      </Panel>
      <OmniForgeColHandle />
      <Panel id="preview" defaultSize={30} minSize={22} maxSize={42} collapsible collapsedSize={4}>
        {visualPreview}
      </Panel>
    </Group>
  );
}

/** @deprecated use OmniForgeTriPaneGrid */
export function OmniForgeProductionGrid({
  explorer,
  visualPreview,
  codingWorkspace,
  agent,
}: {
  explorer: React.ReactNode;
  visualPreview: React.ReactNode;
  codingWorkspace: React.ReactNode;
  agent: React.ReactNode;
}) {
  return (
    <OmniForgeTriPaneGrid
      agent={agent}
      codingWorkspace={codingWorkspace}
      visualPreview={visualPreview}
    />
  );
}

export function OmniForgeEditorTerminalSplit({
  editor,
  terminal,
  terminalDefault = 28,
  terminalOpen = true,
}: {
  editor: React.ReactNode;
  terminal: React.ReactNode;
  terminalDefault?: number;
  terminalOpen?: boolean;
}) {
  if (!terminalOpen) {
    return <div className="flex h-full min-h-0 flex-col overflow-hidden">{editor}</div>;
  }

  return (
    <Group orientation="vertical" className="h-full min-h-0" autoSave="omniforge-terminal-split-v4">
      <Panel defaultSize={100 - terminalDefault} minSize={40}>
        {editor}
      </Panel>
      <OmniForgeRowHandle />
      <Panel defaultSize={terminalDefault} minSize={14} maxSize={55}>
        {terminal}
      </Panel>
    </Group>
  );
}

export const OmniForgeFourPaneMatrix = OmniForgeTriPaneGrid;
