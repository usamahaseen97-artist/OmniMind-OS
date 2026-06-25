"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function LatencyManager() {
  const { recording, audioSettings } = useOmniMusicStudio();
  const estimated = Math.round((audioSettings.bufferSize / audioSettings.sampleRate) * 2000);

  return (
    <div className="text-[8px] text-slate-600">
      Round-trip latency: <span className="text-pink-300">{recording.latencyMs}ms</span>
      {" · "}Buffer estimate: {estimated}ms ({audioSettings.bufferSize} @ {audioSettings.sampleRate / 1000}k)
    </div>
  );
}
