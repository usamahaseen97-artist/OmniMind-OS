"use client";

import { ANIMATION_LIBRARY } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function AnimationStudio({ timelineOnly = false }: { timelineOnly?: boolean }) {
  const { animations, addAnimation, playheadFrame, setPlayheadFrame } = useVisionaryStudio3D();

  if (timelineOnly) {
    return (
      <div className="px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-slate-600">Timeline</span>
          <input type="range" min={0} max={240} value={playheadFrame} onChange={(e) => setPlayheadFrame(Number(e.target.value))} className="flex-1" />
          <span className="font-mono text-[8px] text-cyan-300">f{playheadFrame}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-cyan-400">Animation Studio</p>
      <div className="mb-3 flex flex-wrap gap-1">
        {ANIMATION_LIBRARY.map((a) => (
          <button key={a.id} type="button" onClick={() => addAnimation(a.name, a.category)} className="rounded border border-white/[0.06] px-2 py-0.5 text-[8px] text-slate-500">{a.name}</button>
        ))}
      </div>
      <ul className="mb-4 space-y-1">
        {animations.map((a) => (
          <li key={a.id} className="rounded bg-white/[0.03] px-2 py-1 text-[9px] text-slate-400">
            {a.name} · {a.durationFrames}f · {a.loop ? "loop" : "once"}
          </li>
        ))}
      </ul>
      <input type="range" min={0} max={240} value={playheadFrame} onChange={(e) => setPlayheadFrame(Number(e.target.value))} className="w-full" />
    </div>
  );
}
