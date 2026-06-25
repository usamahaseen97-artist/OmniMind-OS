"use client";

import { MASTERING_TARGETS } from "../../../lib/omnimusic-studio/mixing/constants";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function MasteringSuite() {
  const { masteringChain, setMasteringTarget, updateMastering } = useOmniMusicStudio();

  return (
    <div className="space-y-2">
      <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
        <p className="mb-2 text-[9px] font-medium text-amber-200">Mastering Targets</p>
        <div className="flex flex-wrap gap-1">
          {MASTERING_TARGETS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setMasteringTarget(t.id)}
              className={`rounded px-2 py-0.5 text-[8px] ${masteringChain.target === t.id ? "bg-amber-500/15 text-amber-200" : "text-slate-600"}`}
            >
              {t.label} ({t.lufs} LUFS)
            </button>
          ))}
        </div>
      </div>
      <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
        <p className="mb-2 text-[9px] font-medium text-slate-300">Master Chain</p>
        <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500">
          <span className="w-24">Target LUFS</span>
          <input type="range" min={-24} max={-6} step={0.5} value={masteringChain.targetLufs} onChange={(e) => updateMastering({ targetLufs: Number(e.target.value) })} className="flex-1" />
          <span className="w-10 font-mono text-amber-200">{masteringChain.targetLufs}</span>
        </label>
        <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500">
          <span className="w-24">True Peak</span>
          <input type="range" min={-6} max={0} step={0.1} value={masteringChain.truePeak} onChange={(e) => updateMastering({ truePeak: Number(e.target.value) })} className="flex-1" />
        </label>
        <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500">
          <span className="w-24">Dynamic Range</span>
          <input type="range" min={4} max={20} step={0.5} value={masteringChain.dynamicRange} onChange={(e) => updateMastering({ dynamicRange: Number(e.target.value) })} className="flex-1" />
        </label>
        <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500">
          <span className="w-24">Stereo Width</span>
          <input type="range" min={0} max={200} value={masteringChain.stereoWidth} onChange={(e) => updateMastering({ stereoWidth: Number(e.target.value) })} className="flex-1" />
        </label>
        <label className="flex items-center gap-2 text-[8px] text-slate-500">
          <input type="checkbox" checked={masteringChain.referenceMatch} onChange={(e) => updateMastering({ referenceMatch: e.target.checked })} />
          Reference matching
        </label>
      </div>
    </div>
  );
}
