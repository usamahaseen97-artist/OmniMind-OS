"use client";

import type { TrackingMode } from "../../../lib/visionary/vfx/types";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";
import { CameraTracker } from "./CameraTracker";

const TRACKING_MODES: { id: TrackingMode; label: string }[] = [
  { id: "2d", label: "2D" },
  { id: "3d-camera", label: "3D Camera" },
  { id: "face", label: "Face" },
  { id: "object", label: "Object" },
  { id: "screen", label: "Screen" },
  { id: "corner-pin", label: "Corner Pin" },
];

export function MotionTracker() {
  const { trackingSessions, startTracking } = useVisionaryVFX();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="p-2">
        <p className="mb-2 text-[9px] uppercase text-slate-600">Motion Tracking</p>
        <div className="mb-2 flex flex-wrap gap-1">
          {TRACKING_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => startTracking(mode.id, `${mode.label} Track`)}
              className="rounded border border-white/[0.06] px-1.5 py-0.5 text-[8px] text-slate-500 hover:border-fuchsia-400/50 hover:text-fuchsia-200"
            >
              + {mode.label}
            </button>
          ))}
        </div>
        <ul className="space-y-1">
          {trackingSessions.map((t) => (
            <li key={t.id} className="rounded bg-white/[0.03] px-2 py-1 text-[9px] text-slate-400">
              {t.label} · {t.mode} · {t.points.length} pts · {t.status}
            </li>
          ))}
        </ul>
      </div>
      <CameraTracker />
    </div>
  );
}
