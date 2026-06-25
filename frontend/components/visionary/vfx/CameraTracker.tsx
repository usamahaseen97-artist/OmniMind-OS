"use client";

import type { TrackingMode } from "../../../lib/visionary/vfx/types";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

const CAMERA_MODES: TrackingMode[] = ["3d-camera"];

export function CameraTracker() {
  const { trackingSessions, startTracking } = useVisionaryVFX();
  const cameraTracks = trackingSessions.filter((t) => CAMERA_MODES.includes(t.mode));

  return (
    <div className="border-t border-white/[0.04] p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">3D Camera Track</p>
        <button
          type="button"
          onClick={() => startTracking("3d-camera", `Camera ${cameraTracks.length + 1}`)}
          className="text-[9px] text-fuchsia-400"
        >
          + Track
        </button>
      </div>
      <ul className="space-y-1">
        {cameraTracks.map((t) => (
          <li key={t.id} className="rounded border border-white/[0.04] px-2 py-1 text-[9px] text-slate-400">
            {t.label} · {t.points.length} pts · {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
