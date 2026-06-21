"use client";

import { FolderPlus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { DevFileWritten } from "../../../lib/dev-engine-api";
import { languageForPath } from "../../../lib/omnimind-ide-config";
import type { DevTrioSlug } from "../../../lib/dev-trio";
import { assertDevTrioSlug } from "../../../lib/dev-trio";
import { IDEProjectFileTree } from "../IDEProjectFileTree";
import { useIDE } from "../IDEProvider";

const TITLES: Record<DevTrioSlug, string> = {
  "omniforge-engine": "OmniForge · JS/TS · Python · Dart · C#",
};

/** Full-height adaptive storage tree — dynamic-only, no pre-built mock arrays */
export function DevFileTreeColumn({ toolSlug }: { toolSlug: DevTrioSlug }) {
  assertDevTrioSlug(toolSlug);
  const {
    projectFiles,
    mergeGenerated,
    openFile,
    workspaceInitialized,
    initializeWorkspace,
    addProjectPath,
  } = useIDE();
  const [pathInput, setPathInput] = useState("");
  const [showPathInput, setShowPathInput] = useState(false);
  const isEmpty = projectFiles.length === 0;

  useEffect(() => {
    const onWritten = (e: Event) => {
      const file = (e as CustomEvent<DevFileWritten>).detail;
      if (!file?.path) return;
      mergeGenerated([
        {
          path: file.path,
          content: file.content,
          language: languageForPath(file.path),
        },
      ]);
      openFile({
        path: file.path,
        content: file.content,
        language: languageForPath(file.path),
      });
    };
    window.addEventListener("omnimind:dev-file-written", onWritten);
    return () => window.removeEventListener("omnimind:dev-file-written", onWritten);
  }, [mergeGenerated, openFile]);

  const submitPath = () => {
    const raw = pathInput.trim();
    if (!raw) return;
    addProjectPath(raw);
    setPathInput("");
    setShowPathInput(false);
  };

  return (
    <div className="omni-dev-panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="omni-dev-panel-header shrink-0 border-b px-3 py-2">
        <p className="truncate text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--omni-text-muted)" }}>
          File Explorer
        </p>
        <p className="truncate whitespace-nowrap text-[8px]" style={{ color: "var(--omni-text-muted)" }}>
          {TITLES[toolSlug]}
        </p>
      </header>

      {workspaceInitialized || !isEmpty ? (
        <div className="flex shrink-0 items-center gap-1 border-b px-2 py-1 omni-dev-panel-header">
          <button
            type="button"
            onClick={() => setShowPathInput((v) => !v)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] transition hover:bg-white/[0.04]"
            style={{ color: "var(--omni-text-muted)" }}
            title="Add file or folder path"
          >
            <Plus className="h-3 w-3" />
            Path
          </button>
        </div>
      ) : null}

      {showPathInput ? (
        <div className="flex shrink-0 gap-1 border-b px-2 py-1.5 omni-dev-panel-header">
          <input
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitPath()}
            placeholder="src/app/page.tsx"
            className="min-w-0 flex-1 rounded border bg-transparent px-2 py-1 font-mono text-[10px] outline-none"
            style={{ borderColor: "var(--omni-border)", color: "var(--omni-text)" }}
          />
          <button
            type="button"
            onClick={submitPath}
            className="shrink-0 rounded border px-2 py-1 font-mono text-[9px]"
            style={{ borderColor: "var(--omni-border)", color: "var(--omni-emerald)" }}
          >
            Add
          </button>
        </div>
      ) : null}

      <div className="ide-pane-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
        {isEmpty ? (
          <div className="omni-dev-explorer-empty flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <FolderPlus className="h-8 w-8 opacity-30" style={{ color: "var(--omni-text-muted)" }} />
            <div className="space-y-1">
              <p className="font-mono text-[11px] tracking-tight" style={{ color: "var(--omni-text)" }}>
                No workspace structure
              </p>
              <p className="max-w-[180px] text-[10px] leading-relaxed" style={{ color: "var(--omni-text-muted)" }}>
                Initialize manually or let the agent scaffold files during compilation.
              </p>
            </div>
            <button
              type="button"
              onClick={initializeWorkspace}
              className="omni-state-ring rounded-lg border px-3 py-2 font-mono text-[10px] tracking-tight transition hover:brightness-110"
              style={{
                borderColor: "var(--omni-border)",
                color: "var(--omni-emerald-bright)",
                background: "color-mix(in srgb, var(--omni-emerald) 6%, transparent)",
              }}
            >
              ➕ Initialize Workspace Structure
            </button>
          </div>
        ) : (
          <IDEProjectFileTree compact showExplorerHeader />
        )}
      </div>
    </div>
  );
}
