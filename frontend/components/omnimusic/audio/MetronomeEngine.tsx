"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function MetronomeEnginePanel() {
  const { recording, updateRecording } = useOmniMusicStudio();

  return (
    <label className="flex items-center gap-2 text-[8px] text-slate-500">
      <input
        type="checkbox"
        checked={recording.metronome}
        onChange={(e) => updateRecording({ metronome: e.target.checked })}
      />
      Metronome click during record / count-in
    </label>
  );
}
