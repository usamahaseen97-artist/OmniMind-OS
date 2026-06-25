"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function PlaybackEnginePanel() {
  const { transport, play, pause, stop, rewind, fastForward, frameStep, setPlaybackSpeed } = useOmniMusicStudio();

  return (
    <div className="flex flex-wrap items-center gap-1 text-[8px]">
      <button type="button" onClick={() => rewind(1)} className="rounded px-1.5 py-0.5 text-slate-500 hover:text-pink-300">⏪</button>
      <button type="button" onClick={() => frameStep(-1)} className="rounded px-1.5 py-0.5 text-slate-500">−1f</button>
      <button type="button" onClick={transport.playing ? pause : play} className="rounded bg-white/5 px-2 py-0.5 text-pink-200">
        {transport.paused ? "Resume" : transport.playing ? "Pause" : "Play"}
      </button>
      <button type="button" onClick={stop} className="rounded px-1.5 py-0.5 text-slate-500">Stop</button>
      <button type="button" onClick={() => frameStep(1)} className="rounded px-1.5 py-0.5 text-slate-500">+1f</button>
      <button type="button" onClick={() => fastForward(1)} className="rounded px-1.5 py-0.5 text-slate-500 hover:text-pink-300">⏩</button>
      <select
        className="rounded bg-black/40 px-1 text-[8px] text-slate-500"
        value={transport.playbackSpeed}
        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
      >
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
          <option key={s} value={s}>{s}x</option>
        ))}
      </select>
    </div>
  );
}
