"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function RegionEditor() {
  const { waveformView, selectedClipId, addRegion } = useOmniMusicStudio();
  const sel = waveformView.selection;

  return (
    <div className="space-y-1">
      <p className="text-[9px] uppercase text-slate-600">Regions</p>
      {sel && selectedClipId ? (
        <button
          type="button"
          onClick={() =>
            addRegion({
              clipId: selectedClipId,
              startSample: sel.startSample,
              endSample: sel.endSample,
              label: `Region ${waveformView.regions.length + 1}`,
              color: "#f472b6",
            })
          }
          className="text-[8px] text-pink-400"
        >
          Create region from selection
        </button>
      ) : (
        <p className="text-[8px] text-slate-600">Drag on waveform to select</p>
      )}
      <ul className="text-[8px] text-slate-500">
        {waveformView.regions.map((r) => (
          <li key={r.id}>{r.label} · {r.startSample}–{r.endSample}</li>
        ))}
      </ul>
    </div>
  );
}
