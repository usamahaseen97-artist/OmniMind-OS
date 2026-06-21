"use client";

import { useEffect } from "react";
import { Group, Panel } from "react-resizable-panels";
import { useIDE } from "../../IDEProvider";
import { useOmniForgeLayout } from "../../../../lib/omniforge-layout-context";
import { StreamingCodeEngine } from "../../workspace/StreamingCodeEngine";
import { OmniForgeFileExplorer } from "./OmniForgeFileExplorer";
import { OmniForgeColHandle } from "./OmniForgeResizableShell";
import { OF } from "./omniforge-theme";

function tabKey(tab: ReturnType<typeof useOmniForgeLayout>["activeTab"]): string {
  if (tab.kind === "file") return `file:${tab.path}`;
  return "welcome";
}

function BlankWelcome() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="font-mono text-sm font-semibold tracking-tight" style={{ color: OF.text }}>
        Monospace Code Engine
      </p>
      <p className="max-w-md text-[11px] leading-relaxed" style={{ color: OF.textMuted }}>
        Workspace is empty. Tell the Sovereign Agent what to build — e.g.{" "}
        <span style={{ color: OF.cyan }}>mujhe ek business website banani hy clothes k liye</span> — and files will
        appear here in real time.
      </p>
    </div>
  );
}

/** Pane 2 — File tree + multi-tab Monaco editor */
export function OmniForgeCodePane() {
  const { projectFiles, selectedFile, openFile } = useIDE();
  const { tabs, activeTab, setActiveTab } = useOmniForgeLayout();

  useEffect(() => {
    if (activeTab.kind !== "file") return;
    const file = projectFiles.find((f) => f.path === activeTab.path && !f.isFolder);
    if (file && selectedFile?.path !== file.path) openFile(file);
  }, [activeTab, openFile, projectFiles, selectedFile?.path]);

  return (
    <main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden" style={{ background: OF.bg, borderRight: `1px solid ${OF.border}` }}>
      <Group orientation="horizontal" className="min-h-0 flex-1" autoSave="omniforge-code-explorer">
        <Panel defaultSize={22} minSize={14} maxSize={36} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <OmniForgeFileExplorer />
        </Panel>
        <OmniForgeColHandle />
        <Panel defaultSize={78} minSize={40} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div
            className="flex shrink-0 items-end gap-0 overflow-x-auto border-b"
            style={{ borderColor: OF.border, background: OF.panelAlt }}
          >
            {tabs.map((tab) => {
              const active = tabKey(tab) === tabKey(activeTab);
              const label = tab.kind === "welcome" ? "Welcome" : tab.label;
              return (
                <button
                  key={tabKey(tab)}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab.kind === "file") {
                      const file = projectFiles.find((f) => f.path === tab.path);
                      if (file) openFile(file);
                    }
                  }}
                  className="shrink-0 border-b-2 px-3 py-2 font-mono text-[10px] transition"
                  style={{
                    borderBottomColor: active ? OF.cyan : "transparent",
                    color: active ? OF.cyan : OF.textMuted,
                    background: active ? "rgba(0,229,255,0.06)" : "transparent",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {activeTab.kind === "welcome" ? <BlankWelcome /> : <StreamingCodeEngine />}
          </div>
        </Panel>
      </Group>
    </main>
  );
}
