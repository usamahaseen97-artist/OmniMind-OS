"use client";

import { Film } from "lucide-react";
import type { SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { processSpatialDirective, spatialModuleForSlug } from "../../../lib/spatial-engine-api";
import {
  applySpatialHybridSync,
  updateSpatialTimelineKeyframe,
  useSpatialRenderDialog,
  useSpatialSessionId,
  useSpatialTimeline,
} from "../../../lib/spatial-render-store";

interface SpatialSceneTimelineProps {
  toolSlug: SovereignToolSlug;
}

export function SpatialSceneTimeline({ toolSlug }: SpatialSceneTimelineProps) {
  const module = spatialModuleForSlug(toolSlug);
  const sessionId = useSpatialSessionId();
  const timeline = useSpatialTimeline();
  const dialog = useSpatialRenderDialog();

  const pushRenderSettings = async (patch: Record<string, number | string>) => {
    try {
      const payload = await processSpatialDirective({
        execution_type: "manual",
        module,
        parameters: {
          session_id: sessionId,
          render_settings: patch,
        },
      });
      applySpatialHybridSync(payload);
    } catch {
      /* backend optional */
    }
  };

  return (
    <div className="omni-glass-panel flex h-full min-h-0 flex-col overflow-hidden border-t border-purple-500/[0.12]">
      <header className="omni-studio-header flex shrink-0 items-center justify-between gap-2 border-b px-3 py-1.5">
        <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider omni-accent-text">
          <Film className="h-3 w-3" />
          Scene transition timeline
        </p>
        <div className="flex gap-2 text-[8px] text-zinc-500">
          <span>Total {dialog.duration}s</span>
          <span>·</span>
          <span>Blend {dialog.transition}s</span>
        </div>
      </header>

      <div className="ide-pane-scroll min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-2">
        <div className="flex min-w-max gap-2">
          {timeline.map((kf, i) => (
            <div
              key={kf.id}
              className="omni-state-ring w-36 shrink-0 rounded-lg border p-2"
              style={{
                borderColor: "#1E293B",
                background: "color-mix(in srgb, var(--omni-panel) 85%, transparent)",
              }}
            >
              <p className="mb-1 truncate text-[8px] font-semibold text-zinc-300">
                {i + 1}. {kf.label}
              </p>
              <label className="mb-1 block text-[7px] text-zinc-600">
                Duration (s)
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={kf.duration}
                  onChange={(e) => {
                    const duration = Number(e.target.value);
                    updateSpatialTimelineKeyframe(kf.id, { duration });
                    void pushRenderSettings({ duration });
                  }}
                  className="mt-0.5 w-full accent-[var(--omni-accent)]"
                />
              </label>
              <label className="block text-[7px] text-zinc-600">
                Transition (s)
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={kf.transition}
                  onChange={(e) => {
                    const transition = Number(e.target.value);
                    updateSpatialTimelineKeyframe(kf.id, { transition });
                    void pushRenderSettings({ transition });
                  }}
                  className="mt-0.5 w-full accent-[var(--omni-accent)]"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
