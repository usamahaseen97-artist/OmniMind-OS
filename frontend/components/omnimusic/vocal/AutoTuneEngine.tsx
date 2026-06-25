"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function AutoTuneEngine() {
  const { processingChain, updateProcessingChain, applyAutoTune } = useOmniMusicStudio();
  const at = processingChain.autoTune;

  return (
    <div className="border-b border-white/[0.04] pb-2">
      <div className="mb-1 flex justify-between">
        <p className="text-[9px] uppercase text-slate-600">Auto Tune</p>
        <button type="button" onClick={applyAutoTune} className="text-[8px] text-cyan-400">Apply</button>
      </div>
      <label className="flex items-center gap-2 text-[8px] text-slate-500">
        <input type="checkbox" checked={at.enabled} onChange={(e) => updateProcessingChain({ autoTune: { ...at, enabled: e.target.checked } })} /> Enabled
      </label>
      <label className="block text-[8px] text-slate-500">Strength {at.strength}<input type="range" min={0} max={100} value={at.strength} onChange={(e) => updateProcessingChain({ autoTune: { ...at, strength: Number(e.target.value) } })} className="w-full" /></label>
      <label className="block text-[8px] text-slate-500">Formant {at.formant}<input type="range" min={50} max={150} value={at.formant} onChange={(e) => updateProcessingChain({ autoTune: { ...at, formant: Number(e.target.value) } })} className="w-full" /></label>
      <label className="block text-[8px] text-slate-500">Vibrato {at.vibrato}<input type="range" min={0} max={100} value={at.vibrato} onChange={(e) => updateProcessingChain({ autoTune: { ...at, vibrato: Number(e.target.value) } })} className="w-full" /></label>
    </div>
  );
}
