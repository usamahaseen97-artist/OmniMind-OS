"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function AudioCachePanel() {
  const { waveforms, clips } = useOmniMusicStudio();
  const count = Object.keys(waveforms).length;

  return (
    <p className="text-[8px] text-slate-600">
      Waveform cache: {count} buffers · {clips.filter((c) => c.waveformId).length} clip links
    </p>
  );
}
