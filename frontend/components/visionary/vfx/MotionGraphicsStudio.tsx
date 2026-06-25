"use client";

import { MOTION_GRAPHIC_TEMPLATES } from "../../../lib/visionary/vfx/constants";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";
import type { MotionGraphicTemplate } from "../../../lib/visionary/vfx/types";

export function MotionGraphicsStudio() {
  const { motionGraphicTemplate, applyMotionTemplate } = useVisionaryVFX();
  const active = MOTION_GRAPHIC_TEMPLATES.find((t) => t.id === motionGraphicTemplate);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0a0c10]">
      <div className="flex shrink-0 flex-wrap gap-1 border-b border-white/[0.06] p-2">
        {MOTION_GRAPHIC_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => applyMotionTemplate(t.id as MotionGraphicTemplate)}
            className={`rounded border px-2 py-0.5 text-[8px] ${
              motionGraphicTemplate === t.id
                ? "border-fuchsia-400/50 bg-fuchsia-500/10 text-fuchsia-200"
                : "border-white/[0.08] text-slate-400 hover:border-fuchsia-500/30"
            }`}
          >
            + {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1a0a2e]">
        {active ? (
          <div className="rounded-lg border border-fuchsia-400/30 bg-black/40 px-8 py-6 text-center">
            <p className="text-lg font-bold text-white">{active.label}</p>
            <p className="mt-1 text-[10px] text-fuchsia-300">Motion Graphics Preview</p>
          </div>
        ) : (
          <p className="text-[10px] text-slate-600">Select a motion graphic template</p>
        )}
      </div>
    </div>
  );
}
