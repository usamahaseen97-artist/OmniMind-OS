"use client";

import { compositorEngine } from "../../../lib/visionary/vfx";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function Compositor() {
  const { activeComposition, playheadFrame } = useVisionaryVFX();
  const stats = activeComposition
    ? compositorEngine.evaluateStack(activeComposition.layers)
    : { visibleCount: 0, passes: [] };

  return (
    <div className="flex h-full min-h-0 flex-col bg-black">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-2 py-1">
        <span className="text-[9px] text-slate-500">Compositor · {stats.visibleCount} layers</span>
        <span className="font-mono text-[9px] text-fuchsia-300">f{playheadFrame}</span>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a0a2e] to-[#0f172a]">
        {activeComposition?.layers
          .filter((l) => l.visible)
          .map((layer, i) => (
            <div
              key={layer.id}
              className="absolute rounded border border-white/10 bg-white/5 backdrop-blur-sm"
              style={{
                width: `${60 - i * 8}%`,
                height: `${50 - i * 6}%`,
                opacity: layer.opacity / 100,
                zIndex: i,
                transform: `rotate(${i * 2}deg)`,
              }}
            >
              <p className="p-2 text-[10px] text-slate-400">{layer.name}</p>
              <p className="px-2 text-[8px] text-slate-600">{layer.blendMode}</p>
            </div>
          ))}
        <div className="pointer-events-none absolute inset-[8%] border border-dashed border-fuchsia-400/20" />
      </div>
      {stats.passes.length > 0 ? (
        <div className="shrink-0 border-t border-white/[0.04] px-2 py-1 text-[8px] text-slate-600">
          Render passes: {stats.passes.join(", ")}
        </div>
      ) : null}
    </div>
  );
}
