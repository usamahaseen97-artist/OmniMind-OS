"use client";

import { memo } from "react";
import { FolderTree, ListTodo, ScrollText, Terminal } from "lucide-react";
import { Group, Panel } from "react-resizable-panels";
import { useWorkspaceEngine } from "../../lib/workspace-engine-context";
import type { PanelId } from "../../lib/workspace-engine/types";
import { OmniWorkspaceTerminal } from "./OmniWorkspaceTerminal";
import { SplitResizeHandle } from "../ide/layouts/SplitWorkspace";
import { OS_TOKENS } from "../os/tokens";
import { cn } from "../../lib/utils";

const LEFT_PANELS: { id: PanelId; label: string; icon: typeof FolderTree }[] = [
  { id: "explorer", label: "Explorer", icon: FolderTree },
  { id: "projects", label: "Projects", icon: FolderTree },
  { id: "recent", label: "Recent", icon: FolderTree },
];

const BOTTOM_PANELS: { id: PanelId; label: string; icon: typeof Terminal }[] = [
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "tasks", label: "Tasks", icon: ListTodo },
];

function PanelPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col p-2 text-[10px] text-zinc-500">
      <p className="font-semibold uppercase tracking-wider text-zinc-400">{title}</p>
      <p className="mt-2 opacity-70">Dock panel — connect to OmniCore projects & agents.</p>
    </div>
  );
}

export const OmniMindWorkspaceDock = memo(function OmniMindWorkspaceDock({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dockPanels, activeLeftPanel, activeBottomPanel, toggleDockPanel } = useWorkspaceEngine();

  const leftPanel = dockPanels.find((p) => p.id === activeLeftPanel && p.region === "left");
  const bottomPanel = dockPanels.find((p) => p.id === activeBottomPanel && p.region === "bottom");
  const leftOpen = leftPanel && !leftPanel.collapsed;
  const bottomOpen = bottomPanel && !bottomPanel.collapsed;

  return (
    <Group orientation="horizontal" className="min-h-0 flex-1" autoSave="omni-ws-dock-main">
      {leftOpen ? (
        <>
          <Panel
            defaultSize={18}
            minSize={12}
            maxSize={35}
            className="flex min-h-0 flex-col overflow-hidden border-r"
            style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.sidebar }}
          >
            <div className="flex shrink-0 gap-0.5 border-b p-1" style={{ borderColor: OS_TOKENS.border.subtle }}>
              {LEFT_PANELS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => toggleDockPanel(id)}
                  className={cn(
                    "rounded p-1.5 transition",
                    activeLeftPanel === id ? "bg-cyan-500/15 text-cyan-300" : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            {activeLeftPanel === "terminal" ? null : <PanelPlaceholder title={activeLeftPanel} />}
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
        </>
      ) : null}

      <Panel minSize={30} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <Group orientation="vertical" className="min-h-0 flex-1" autoSave="omni-ws-dock-center">
          <Panel minSize={25} className="min-h-0 overflow-hidden">
            {children}
          </Panel>
          {bottomOpen ? (
            <>
              <SplitResizeHandle orientation="vertical" />
              <Panel defaultSize={22} minSize={12} maxSize={45} className="flex min-h-0 flex-col overflow-hidden border-t" style={{ borderColor: OS_TOKENS.border.subtle }}>
                <div className="flex shrink-0 gap-0.5 border-b p-1" style={{ borderColor: OS_TOKENS.border.subtle }}>
                  {BOTTOM_PANELS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      onClick={() => toggleDockPanel(id)}
                      className={cn(
                        "rounded px-2 py-1 text-[9px] transition",
                        activeBottomPanel === id
                          ? "bg-cyan-500/15 text-cyan-300"
                          : "text-zinc-500 hover:text-zinc-300",
                      )}
                    >
                      <Icon className="mr-1 inline h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  {activeBottomPanel === "terminal" ? (
                    <OmniWorkspaceTerminal />
                  ) : (
                    <PanelPlaceholder title={activeBottomPanel} />
                  )}
                </div>
              </Panel>
            </>
          ) : null}
        </Group>
      </Panel>
    </Group>
  );
});
