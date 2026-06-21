"use client";

import { useEffect } from "react";
import { Settings2 } from "lucide-react";
import { resetSpatialCanvasAssets } from "../../../lib/spatial-canvas-store";
import type { SovereignToolSlug, SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { AgentChatConsole } from "../workspace/AgentChatConsole";
import { SpatialManualTweakPanel } from "../workspace/SpatialManualTweakPanel";
import { SpatialMaterialTray } from "../workspace/SpatialMaterialTray";
import { SpatialSceneTimeline } from "../workspace/SpatialSceneTimeline";
import { SpatialStudioCenter } from "../workspace/SpatialStudioCenter";
import { SplitPanelBody, SplitPanelHeader } from "./SplitWorkspace";
import { SpatialStudioResizableGrid } from "./SpatialStudioResizableGrid";
import {
  toggleSpatialManualPanel,
  useSpatialManualPanelOpen,
} from "../../../lib/spatial-render-store";
import { cn } from "../../../lib/utils";

/**
 * Hybrid Spatial Studio — 20% materials | 48% preview+timeline | 32% AI + manual.
 */
export function SpatialStudioShell({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? tool.slug;
  const manualOpen = useSpatialManualPanelOpen();

  useEffect(() => {
    resetSpatialCanvasAssets();
  }, [tool.slug]);
  const workspaceTitle =
    tool.slug === "interior-landscape" ? "Interior Design Studio" : "Architectural External Studio";

  return (
    <div className="omni-spatial-studio flex h-full min-h-0 w-full max-w-[100vw] flex-1 flex-row overflow-hidden">
      <SpatialStudioResizableGrid
        left={
          <>
            <SplitPanelHeader
              title="Asset Matrix"
              subtitle="PBR · structural library"
              badge={
                <span className="rounded-full border px-2 py-0.5 text-[8px]" style={{ borderColor: "#1E293B" }}>
                  20%
                </span>
              }
            />
            <SplitPanelBody style={{ background: "#0B0F19" }}>
              <SpatialMaterialTray toolSlug={tool.slug as SovereignToolSlug} />
            </SplitPanelBody>
          </>
        }
        center={
          <>
            <SplitPanelHeader
              title={workspaceTitle}
              subtitle="📐 Matrix · ✨ Cinematic real-time"
              badge={
                <span className="omni-live-badge rounded-full px-2 py-0.5 text-[8px]">Live</span>
              }
            />
            <SplitPanelBody className="p-0" style={{ background: "#0B0F19" }}>
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <div className="min-h-0 flex-[1_1_72%] overflow-hidden">
                  <SpatialStudioCenter tool={tool} />
                </div>
                <div className="min-h-0 flex-[0_0_28%] overflow-hidden">
                  <SpatialSceneTimeline toolSlug={tool.slug as SovereignToolSlug} />
                </div>
              </div>
            </SplitPanelBody>
          </>
        }
        right={
          <>
            <SplitPanelHeader
              title="AI & Manual Master"
              subtitle="Unified directive terminal"
              actions={
                <button
                  type="button"
                  onClick={toggleSpatialManualPanel}
                  className={cn(
                    "omni-state-ring flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] transition",
                    manualOpen && "omni-accent-border omni-accent-text",
                  )}
                  style={{ borderColor: "#1E293B" }}
                  aria-pressed={manualOpen}
                >
                  <Settings2 className="h-3 w-3" />
                  Manual
                </button>
              }
            />
            <SplitPanelBody className="p-0" style={{ background: "#0B0F19" }}>
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                {manualOpen ? (
                  <SpatialManualTweakPanel toolSlug={tool.slug as SovereignToolSlug} />
                ) : null}
                <div className="min-h-0 flex-1 overflow-hidden">
                  <AgentChatConsole
                    routeId={routeId}
                    toolSlug={tool.slug}
                    designMode
                  />
                </div>
              </div>
            </SplitPanelBody>
          </>
        }
      />
    </div>
  );
}
