"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import { PlaybackEnginePanel } from "./PlaybackEngine";

const DISPLAY_MODES = ["bars", "beats", "samples", "frames"] as const;

export function TransportEnginePanel() {
  const {
    transport,
    setTransport,
    formatTime,
    setDisplayMode,
    setCycleRegion,
    clearCycleRegion,
    setLocator,
    markers,
  } = useOmniMusicStudio();

  return (
    <div className="space-y-1">
      <PlaybackEnginePanel />
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-pink-200">{formatTime()}</span>
        {DISPLAY_MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setDisplayMode(m)}
            className={`text-[8px] uppercase ${transport.displayMode === m ? "text-pink-300" : "text-slate-600"}`}
          >
            {m}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-1 text-[8px] text-slate-500">
        <input
          type="checkbox"
          checked={transport.loopEnabled}
          onChange={(e) => setTransport((t) => ({ ...t, loopEnabled: e.target.checked }))}
        />
        Loop {transport.loopStart}–{transport.loopEnd}
      </label>
      <div className="flex gap-1 text-[8px]">
        <button type="button" onClick={() => setCycleRegion(transport.playheadBeat, transport.playheadBeat + 4)} className="text-pink-400">Set cycle</button>
        <button type="button" onClick={clearCycleRegion} className="text-slate-600">Clear cycle</button>
        <button type="button" onClick={() => setLocator(transport.playheadBeat, transport.locatorRight)} className="text-slate-500">Set locator L</button>
        <button type="button" onClick={() => setLocator(transport.locatorLeft, transport.playheadBeat)} className="text-slate-500">Set locator R</button>
      </div>
      {markers.length > 0 ? (
        <p className="text-[8px] text-amber-400/80">Markers: {markers.map((m) => m.label).join(" · ")}</p>
      ) : null}
    </div>
  );
}
