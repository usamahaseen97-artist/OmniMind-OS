"use client";

import { useCallback } from "react";
import { appendWorkbenchLog, useWorkbenchLive } from "../../../lib/workbench-live-store";
import {
  exportSpatialRender,
  saveSpatialBlueprint,
  spatialModuleForSlug,
} from "../../../lib/spatial-engine-api";
import { useSpatialConfigText, useSpatialRenderMode, useSpatialSessionId } from "../../../lib/spatial-render-store";

export function SpatialUtilityDeck({ toolSlug }: { toolSlug: string }) {
  const live = useWorkbenchLive();
  const configText = useSpatialConfigText();
  const sessionId = useSpatialSessionId();
  const renderMode = useSpatialRenderMode();
  const module = spatialModuleForSlug(toolSlug);

  const payload = configText || live.lastPrompt || live.streamText || "";

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(payload);
      appendWorkbenchLog("✓ Spatial config copied to clipboard");
    } catch {
      /* ignore */
    }
  }, [payload]);

  const saveProject = useCallback(() => {
    void saveSpatialBlueprint({
      module,
      session_id: sessionId,
      label: `${toolSlug}-${new Date().toISOString().slice(0, 10)}`,
    })
      .then((r) => appendWorkbenchLog(`💾 Blueprint saved · ${r.node_count} nodes`))
      .catch((e) => appendWorkbenchLog(`⚠ Save failed: ${e instanceof Error ? e.message : String(e)}`));
  }, [module, sessionId, toolSlug]);

  const exportRender = useCallback(() => {
    void exportSpatialRender({
      module,
      session_id: sessionId,
      render_mode: renderMode,
      prompt: live.lastPrompt,
    })
      .then((r) => {
        const blob = new Blob([JSON.stringify(r.package ?? r, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = r.download_name ?? `${toolSlug}-render.json`;
        a.click();
        URL.revokeObjectURL(url);
        appendWorkbenchLog(`📤 Render exported · ${r.download_name}`);
      })
      .catch((e) => appendWorkbenchLog(`⚠ Export failed: ${e instanceof Error ? e.message : String(e)}`));
  }, [live.lastPrompt, module, renderMode, sessionId, toolSlug]);

  const btn =
    "omni-state-ring flex items-center gap-1 rounded-md border px-2.5 py-1 text-[9px] font-medium transition hover:brightness-110";

  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={copyCode} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}>
        Copy Output 📋
      </button>
      <button type="button" onClick={saveProject} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}>
        Save Project 💾
      </button>
      <button type="button" onClick={exportRender} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}>
        Export Render 📤
      </button>
    </div>
  );
}
