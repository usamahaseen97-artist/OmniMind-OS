"use client";

import { useCallback } from "react";
import { useWorkbenchLive } from "../../../lib/workbench-live-store";
import { useIDEOptional } from "../IDEProvider";

const STORAGE_KEY = "omnimind-project-profile";

/** Copy · Save · Export — non-dev tool header actions */
export function ProjectUtilityDeck({
  toolSlug,
  exportLabel = "Export Render",
}: {
  toolSlug: string;
  exportLabel?: string;
}) {
  const live = useWorkbenchLive();
  const ide = useIDEOptional();

  const activeText =
    ide?.selectedFile?.content ??
    live.streamText ??
    live.lastPrompt ??
    live.statusText ??
    "";

  const copyOutput = useCallback(async () => {
    const text = activeText || JSON.stringify(live, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }, [activeText, live]);

  const saveProject = useCallback(() => {
    const payload = {
      toolSlug,
      savedAt: new Date().toISOString(),
      prompt: live.lastPrompt,
      preview: live.preview,
      files: ide?.projectFiles?.filter((f) => !f.isFolder).map((f) => ({ path: f.path, content: f.content })),
    };
    try {
      localStorage.setItem(`${STORAGE_KEY}:${toolSlug}`, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [ide?.projectFiles, live.lastPrompt, live.preview, toolSlug]);

  const exportAsset = useCallback(() => {
    const blob = new Blob([activeText || live.lastPrompt || "{}"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolSlug}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeText, live.lastPrompt, toolSlug]);

  const btn =
    "omni-state-ring flex items-center gap-1 rounded-md border px-2.5 py-1 text-[9px] font-medium transition hover:brightness-110";

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button type="button" onClick={copyOutput} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}>
        Copy Output 📋
      </button>
      <button type="button" onClick={saveProject} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}>
        Save Project 💾
      </button>
      <button type="button" onClick={exportAsset} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}>
        {exportLabel} 📤
      </button>
    </div>
  );
}
