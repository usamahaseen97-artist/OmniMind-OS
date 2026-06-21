"use client";

import { useCallback, useEffect, useMemo } from "react";
import { SpatialRenderViewport } from "../../workspace/SpatialRenderViewport";
import { useDeckUi } from "../../../../lib/deck-ui-store";
import {
  processSpatialDirective,
  spatialModuleForSlug,
} from "../../../../lib/spatial-engine-api";
import {
  addSpatialCanvasAsset,
  moveSpatialCanvasAsset,
  useSpatialCanvasAssets,
} from "../../../../lib/spatial-canvas-store";
import {
  applySpatialHybridSync,
  setSpatialConfigText,
  setSpatialSessionId,
  useSpatialRenderMode,
  useSpatialSessionId,
} from "../../../../lib/spatial-render-store";
import { useSpatialCanvasSync } from "../../../../lib/use-spatial-canvas-sync";
import { appendWorkbenchLog, useWorkbenchLive } from "../../../../lib/workbench-live-store";
import type { SovereignToolSlug } from "../../../../lib/sovereign-tool-registry";

export function ToolLiveSimDesign({
  mode,
  toolSlug,
  hideAssetTray = false,
}: {
  mode: "exterior" | "interior";
  toolSlug: SovereignToolSlug;
  hideAssetTray?: boolean;
}) {
  const deck = useDeckUi();
  const live = useWorkbenchLive();
  const renderMode = useSpatialRenderMode();
  const sessionId = useSpatialSessionId();
  const spatialModule = spatialModuleForSlug(toolSlug);
  const { publishDrag } = useSpatialCanvasSync(spatialModule, true);
  const assets = useSpatialCanvasAssets();
  const prompt = live.lastPrompt || (mode === "interior"
    ? "Scandinavian minimalist living room with sunset ray-tracing lighting"
    : "Design 500yd luxury villa, 6 bedrooms, central swimming pool");
  const pct = deck.architectureRenderPct || (live.streaming ? 35 : 0);

  useEffect(() => {
    if (!prompt.trim()) return;
    void processSpatialDirective({
      execution_type: "ai_agent",
      module: spatialModule,
      parameters: {
        prompt,
        session_id: sessionId,
        render_settings: { render_mode: renderMode },
      },
    })
      .then((payload) => {
        applySpatialHybridSync(payload);
        setSpatialSessionId(payload.session_id);
        setSpatialConfigText(payload.config_text);
        const nodeCount =
          payload.active_matrix_coordinates.walls.length +
          payload.active_matrix_coordinates.assets.length;
        appendWorkbenchLog(`✓ Hybrid spatial · ${spatialModule} · ${nodeCount} nodes`);
      })
      .catch(() => {
        /* backend optional on first paint */
      });
  }, [prompt, renderMode, spatialModule]);

  const addAsset = useCallback(
    (emoji: string) => {
      const placed = addSpatialCanvasAsset(emoji);
      publishDrag(placed.id, placed.x, placed.z);
      void processSpatialDirective({
        execution_type: "manual",
        module: spatialModule,
        parameters: {
          session_id: sessionId,
          adjustments: {
            type: "spawn_asset",
            asset_id: placed.id,
            label: emoji,
            x: placed.x,
            y: 0.4,
            z: placed.z,
          },
          render_settings: { render_mode: renderMode },
        },
      }).then(applySpatialHybridSync).catch(() => undefined);
    },
    [publishDrag, renderMode, sessionId, spatialModule],
  );

  const handleAssetDrag = useCallback(
    (id: string, x: number, z: number) => {
      moveSpatialCanvasAsset(id, x, z);
      publishDrag(id, x, z);
      void processSpatialDirective({
        execution_type: "manual",
        module: spatialModule,
        parameters: {
          session_id: sessionId,
          adjustments: { type: "drag", asset_id: id, x, y: 0.4, z },
          render_settings: { render_mode: renderMode },
        },
      }).then(applySpatialHybridSync).catch(() => undefined);
    },
    [publishDrag, renderMode, sessionId, spatialModule],
  );

  const specLabel = useMemo(() => {
    const lower = prompt.toLowerCase();
    const rooms = lower.match(/(\d+)\s*(?:bed|room|zone)/)?.[1] ?? "6";
    return mode === "exterior"
      ? `External Architecture · ${rooms} BR · Elevations`
      : `Interior Design · ${rooms} zones · Materials`;
  }, [mode, prompt]);

  const legacyTray = hideAssetTray ? null : (
    <div
      className="pointer-events-auto shrink-0 border-t p-3"
      style={{ borderColor: "#1E293B", background: "color-mix(in srgb, #111827 95%, black)" }}
    >
      <p className="mb-2 text-[9px] font-bold uppercase omni-accent-text">Asset tray · click to place</p>
      <div className="flex flex-wrap gap-2">
        {["🏛️", "🪟", "🏊", "🌳"].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => addAsset(emoji)}
            className="omni-state-ring flex h-10 w-10 items-center justify-center rounded-lg border text-lg"
            style={{ borderColor: "#1E293B" }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );

  const workspaceTitle =
    toolSlug === "interior-landscape" ? "Interior Design" : "Architectural External Design";

  return (
    <SpatialRenderViewport
      toolSlug={toolSlug}
      workspaceTitle={workspaceTitle}
      prompt={prompt}
      assets={assets}
      variant={mode}
      specLabel={specLabel}
      progress={pct}
      assetTray={legacyTray}
      onAssetDrag={handleAssetDrag}
    />
  );
}
