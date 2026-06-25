"use client";

import type { WaveformEditOp } from "../../../lib/omnimusic-studio/audio-types";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

const OPS: WaveformEditOp[] = ["normalize", "reverse", "fadeIn", "fadeOut", "silence", "duplicate"];

export function ClipProcessor() {
  const { selectedClipId, clips, applyWaveformEdit } = useOmniMusicStudio();
  const clip = clips.find((c) => c.id === selectedClipId);

  if (!clip?.waveformId) {
    return <p className="text-[8px] text-slate-600">Select an audio clip to process</p>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {OPS.map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => applyWaveformEdit(op)}
          className="rounded border border-white/[0.06] px-2 py-0.5 text-[8px] text-slate-500 capitalize"
        >
          {op}
        </button>
      ))}
    </div>
  );
}
