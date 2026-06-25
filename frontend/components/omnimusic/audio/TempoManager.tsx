"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function TempoManager() {
  const { transport, setTempo, setTimeSignature } = useOmniMusicStudio();

  return (
    <div className="flex items-center gap-2 text-[8px]">
      <label className="flex items-center gap-1 text-slate-500">
        BPM
        <input
          type="number"
          min={20}
          max={999}
          className="w-12 rounded bg-black/40 px-1 py-0.5 font-mono text-pink-200"
          value={transport.tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
        />
      </label>
      <label className="flex items-center gap-1 text-slate-500">
        Sig
        <input
          type="number"
          min={1}
          max={32}
          className="w-8 rounded bg-black/40 px-1"
          value={transport.timeSignature[0]}
          onChange={(e) => setTimeSignature([Number(e.target.value), transport.timeSignature[1]])}
        />
        /
        <select
          className="rounded bg-black/40 px-1"
          value={transport.timeSignature[1]}
          onChange={(e) => setTimeSignature([transport.timeSignature[0], Number(e.target.value)])}
        >
          {[1, 2, 4, 8, 16].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
