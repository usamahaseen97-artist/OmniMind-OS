"use client";

import { SlidersHorizontal } from "lucide-react";
import type { SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { processSpatialDirective, spatialModuleForSlug } from "../../../lib/spatial-engine-api";
import {
  applySpatialHybridSync,
  setSpatialRenderDialog,
  useSpatialRenderDialog,
  useSpatialRenderMode,
  useSpatialSessionId,
} from "../../../lib/spatial-render-store";

const RESOLUTIONS = ["720p", "1080p", "1440p", "4K"] as const;

interface SpatialManualTweakPanelProps {
  toolSlug: SovereignToolSlug;
}

export function SpatialManualTweakPanel({ toolSlug }: SpatialManualTweakPanelProps) {
  const module = spatialModuleForSlug(toolSlug);
  const sessionId = useSpatialSessionId();
  const renderMode = useSpatialRenderMode();
  const dialog = useSpatialRenderDialog();

  const syncManual = async (adjustments: Record<string, unknown>, renderPatch?: Record<string, unknown>) => {
    try {
      const payload = await processSpatialDirective({
        execution_type: "manual",
        module,
        parameters: {
          session_id: sessionId,
          adjustments,
          render_settings: { render_mode: renderMode, ...renderPatch },
        },
      });
      applySpatialHybridSync(payload);
    } catch {
      /* backend optional */
    }
  };

  const onDialogPatch = (patch: Partial<typeof dialog>) => {
    setSpatialRenderDialog(patch);
    void syncManual({}, patch);
  };

  return (
    <div className="omni-studio-panel shrink-0 border-b border-l border-purple-500/[0.12]">
      <header className="flex items-center gap-2 px-3 py-2">
        <SlidersHorizontal className="h-3.5 w-3.5 omni-accent-text" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-200">Manual tweak</p>
          <p className="text-[8px] text-zinc-600">Camera · render · scene duration</p>
        </div>
      </header>

      <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
        <label className="text-[8px] text-zinc-500">
          Quality samples
          <input
            type="range"
            min={64}
            max={512}
            step={64}
            value={dialog.quality_samples}
            onChange={(e) => onDialogPatch({ quality_samples: Number(e.target.value) })}
            className="mt-1 w-full accent-[var(--omni-accent)]"
          />
          <span className="text-zinc-400">{dialog.quality_samples}</span>
        </label>

        <label className="text-[8px] text-zinc-500">
          Scene duration (s)
          <input
            type="range"
            min={5}
            max={60}
            value={dialog.duration}
            onChange={(e) => onDialogPatch({ duration: Number(e.target.value) })}
            className="mt-1 w-full accent-[var(--omni-accent)]"
          />
          <span className="text-zinc-400">{dialog.duration}s</span>
        </label>

        <label className="text-[8px] text-zinc-500">
          Transition speed (s)
          <input
            type="range"
            min={1}
            max={10}
            value={dialog.transition}
            onChange={(e) => onDialogPatch({ transition: Number(e.target.value) })}
            className="mt-1 w-full accent-[var(--omni-accent)]"
          />
          <span className="text-zinc-400">{dialog.transition}s</span>
        </label>

        <label className="text-[8px] text-zinc-500">
          Resolution
          <select
            value={dialog.resolution}
            onChange={(e) => onDialogPatch({ resolution: e.target.value })}
            className="mt-1 w-full rounded-md border bg-black/40 px-2 py-1 text-[9px] text-zinc-200"
            style={{ borderColor: "#1E293B" }}
          >
            {RESOLUTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[8px] text-zinc-500 sm:col-span-2">
          Camera start X
          <input
            type="range"
            min={-8}
            max={8}
            step={0.1}
            defaultValue={-4.2}
            onChange={(e) =>
              void syncManual({
                type: "camera",
                start: { x: Number(e.target.value) },
              })
            }
            className="mt-1 w-full accent-[var(--omni-accent)]"
          />
        </label>

        <label className="text-[8px] text-zinc-500 sm:col-span-2">
          Camera end Z
          <input
            type="range"
            min={-8}
            max={8}
            step={0.1}
            defaultValue={-3.2}
            onChange={(e) =>
              void syncManual({
                type: "camera",
                end: { z: Number(e.target.value) },
              })
            }
            className="mt-1 w-full accent-[var(--omni-accent)]"
          />
        </label>
      </div>
    </div>
  );
}
