"use client";

import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function AnimationGraph() {
  const { animationKeyframes, playheadFrame, setPlayheadFrame } = useVisionaryVFX();

  return (
    <div className="h-24 shrink-0 border-t border-white/[0.06] bg-[#080a0e]">
      <div className="flex items-center justify-between px-2 py-0.5">
        <span className="text-[8px] uppercase text-slate-600">Animation Graph</span>
        <input
          type="range"
          min={0}
          max={240}
          value={playheadFrame}
          onChange={(e) => setPlayheadFrame(Number(e.target.value))}
          className="w-32"
        />
        <span className="font-mono text-[8px] text-fuchsia-300">f{playheadFrame}</span>
      </div>
      <div className="relative h-16 overflow-x-auto px-2">
        {animationKeyframes.map((kf) => (
          <div
            key={kf.id}
            className="absolute top-2 h-6 rounded border border-fuchsia-400/30 bg-fuchsia-500/20"
            style={{ left: `${kf.frame * 2}px`, width: "40px" }}
          >
            <span className="px-1 text-[7px] text-fuchsia-200">{kf.property}</span>
          </div>
        ))}
        <div
          className="absolute top-0 bottom-0 w-px bg-fuchsia-400"
          style={{ left: `${playheadFrame * 2}px` }}
        />
      </div>
    </div>
  );
}
