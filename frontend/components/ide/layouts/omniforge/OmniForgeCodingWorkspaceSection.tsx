"use client";

import { PanelLeft } from "lucide-react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { useIDE } from "../../IDEProvider";
import type { WorkspaceTab } from "../../../../lib/omniforge-layout-context";
import { useOmniForgeLayout } from "../../../../lib/omniforge-layout-context";
import { useOmniForgeShell } from "../../../../lib/omniforge-shell-context";
import { StreamingCodeEngine } from "../../workspace/StreamingCodeEngine";
import { OmniForgeEditorTerminalSplit } from "./OmniForgeResizableShell";
import { OmniForgeTerminal } from "./OmniForgeTerminal";
import { OmniForgeExplorerSection } from "./OmniForgeExplorerSection";
import { GlassSection } from "./ui/GlassSection";
import { OF } from "./omniforge-theme";

function tabKey(tab: WorkspaceTab): string {
  if (tab.kind === "file") return `file:${tab.path}`;
  return "welcome";
}

function BlankEditor() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center font-mono">
      <p className="text-sm" style={{ color: OF.textMuted }}>
        // JS/TS · Python · Dart · C# — prompt agent to scaffold.
      </p>
      <p className="text-[10px]" style={{ color: OF.textMuted }}>
        Monaco · IntelliSense · minimap · split editor
      </p>
    </div>
  );
}

/** Center pane — embedded explorer + Monaco + terminal */
export function OmniForgeCodingWorkspaceSection() {
  const { projectFiles, selectedFile, openFile } = useIDE();
  const { tabs, activeTab, setActiveTab, closeFileTab } = useOmniForgeLayout();
  const { terminalOpen, setTerminalOpen, explorerOpen, setExplorerOpen } = useOmniForgeShell();

  useEffect(() => {
    if (activeTab.kind !== "file") return;
    const file = projectFiles.find((f) => f.path === activeTab.path && !f.isFolder);
    if (file && selectedFile?.path !== file.path) openFile(file);
  }, [activeTab, openFile, projectFiles, selectedFile?.path]);

  return (
    <GlassSection
      title="Code Workspace"
      subtitle={selectedFile?.path ?? "Polyglot editor"}
      actions={
        <button
          type="button"
          onClick={() => setExplorerOpen(!explorerOpen)}
          className="rounded-md p-1 transition hover:bg-white/[0.06]"
          style={{ color: explorerOpen ? OF.cyan : OF.textMuted }}
          title="Toggle project explorer"
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
      }
      noPad
    >
      <div className="flex h-full min-h-0">
        {explorerOpen ? (
          <div className="w-[min(220px,38%)] shrink-0 border-r" style={{ borderColor: OF.glassBorder }}>
            <OmniForgeExplorerSection embedded />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="flex shrink-0 items-center overflow-x-auto border-b"
            style={{ borderColor: OF.glassBorder, background: "rgba(0,0,0,0.2)" }}
          >
            {tabs.map((tab) => {
              const active = tabKey(tab) === tabKey(activeTab);
              const label = tab.kind === "welcome" ? "Welcome" : tab.label;
              return (
                <div key={tabKey(tab)} className="group flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab.kind === "file") {
                        const file = projectFiles.find((f) => f.path === tab.path);
                        if (file) openFile(file);
                      }
                    }}
                    className="border-r px-3 py-2 font-mono text-[10px] transition"
                    style={{
                      borderColor: OF.glassBorder,
                      borderTopWidth: active ? 2 : 0,
                      borderTopColor: active ? OF.cyan : "transparent",
                      color: active ? OF.cyan : OF.textMuted,
                    }}
                  >
                    {label}
                  </button>
                  {tab.kind === "file" ? (
                    <button
                      type="button"
                      onClick={() => closeFileTab(tab.path)}
                      className="mr-1 rounded p-0.5 opacity-0 transition group-hover:opacity-100 hover:bg-white/10"
                      style={{ color: OF.textMuted }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <OmniForgeEditorTerminalSplit
              editor={activeTab.kind === "welcome" ? <BlankEditor /> : <StreamingCodeEngine />}
              terminal={<OmniForgeTerminal onClose={() => setTerminalOpen(false)} />}
              terminalOpen={terminalOpen}
              terminalDefault={28}
            />
          </div>

          {!terminalOpen ? (
            <button
              type="button"
              onClick={() => setTerminalOpen(true)}
              className="shrink-0 border-t px-3 py-1 text-left font-mono text-[9px]"
              style={{ borderColor: OF.glassBorder, color: OF.textMuted }}
            >
              Terminal ▲
            </button>
          ) : null}
        </div>
      </div>
    </GlassSection>
  );
}
