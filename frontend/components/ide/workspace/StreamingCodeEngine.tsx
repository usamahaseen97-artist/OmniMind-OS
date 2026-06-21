"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";
import { useIDE } from "../IDEProvider";
import { useWorkbenchLive } from "../../../lib/workbench-live-store";
import { languageForPath } from "../../../lib/omnimind-ide-config";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-[11px]" style={{ color: "var(--omni-text-muted)" }}>
      Loading code engine…
    </div>
  ),
});

/** Center panel — Monaco with live token streaming when agent processes */
export function StreamingCodeEngine() {
  const { selectedFile, projectFiles, openFile, updateFileContent } = useIDE();
  const live = useWorkbenchLive();
  const [displayContent, setDisplayContent] = useState("");
  const streamRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const persistEdit = useCallback(
    (path: string, content: string) => {
      updateFileContent(path, content);
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("omnimind:omniforge-file-save", {
            detail: { path, content },
          }),
        );
      }, 650);
    },
    [updateFileContent],
  );

  useEffect(() => {
    if (selectedFile) return;
    const target =
      projectFiles.find((f) => f.path === "frontend/app/page.tsx" && !f.isFolder) ??
      projectFiles.find((f) => !f.isFolder);
    if (target) openFile(target);
  }, [openFile, projectFiles, selectedFile]);

  const file = selectedFile ?? projectFiles.find((f) => f.path === "frontend/app/page.tsx" && !f.isFolder);

  useEffect(() => {
    if (!file) {
      setDisplayContent("");
      return;
    }
    if (streamRef.current) window.clearInterval(streamRef.current);

    if (!live.streaming) {
      setDisplayContent(file.content);
      return;
    }

    const full = file.content;
    let i = 0;
    setDisplayContent("");
    streamRef.current = window.setInterval(() => {
      i += Math.max(2, Math.floor(full.length / 80));
      setDisplayContent(full.slice(0, i));
      if (i >= full.length && streamRef.current) {
        window.clearInterval(streamRef.current);
        streamRef.current = null;
      }
    }, 24);

    return () => {
      if (streamRef.current) window.clearInterval(streamRef.current);
    };
  }, [file?.path, file?.content, live.streaming]);

  if (!file) {
    return (
      <div className="omni-dev-panel flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-mono text-sm font-medium tracking-tight" style={{ color: "var(--omni-text)" }}>
          Monospace Code Engine
        </p>
        <p className="max-w-sm font-mono text-[11px] tracking-tight" style={{ color: "var(--omni-text-muted)" }}>
          Agent output streams here with syntax highlighting as prompts execute.
        </p>
      </div>
    );
  }

  return (
    <div className="omni-dev-panel flex h-full min-h-0 flex-col">
      <div
        className="omni-dev-panel-header flex shrink-0 items-center justify-between border-b px-3 py-1.5 font-mono text-[10px] tracking-tight"
        style={{ color: "var(--omni-emerald)" }}
      >
        <span>{file.path}</span>
        {live.streaming ? (
          <span className="animate-pulse text-[9px] omni-state-ring rounded-full px-2 py-0.5">Streaming tokens…</span>
        ) : null}
      </div>
      <div className="min-h-0 flex-1">
        <MonacoEditor
          height="100%"
          language={file.language ?? languageForPath(file.path)}
          theme="vs-dark"
          value={displayContent}
          onChange={(v) => persistEdit(file.path, v ?? "")}
          options={{
            minimap: { enabled: true },
            fontSize: 12,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            automaticLayout: true,
            readOnly: live.streaming,
          }}
        />
      </div>
    </div>
  );
}
