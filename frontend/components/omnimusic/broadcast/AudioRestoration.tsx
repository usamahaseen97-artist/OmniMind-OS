"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

const TOOLS = ["Noise Removal", "Hum Removal", "Click Removal", "Pop Removal", "Wind Reduction", "Echo Reduction", "Room Correction"] as const;

export function AudioRestoration() {
  const { restorationProfiles, activeRestorationProfile, selectRestorationProfile } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Audio Restoration · Repair Assistant</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {restorationProfiles.map((p) => (
          <button key={p.id} type="button" onClick={() => selectRestorationProfile(p.id)} className={`rounded px-2 py-0.5 text-[8px] ${activeRestorationProfile.id === p.id ? "bg-emerald-500/15 text-emerald-200" : "text-slate-600"}`}>{p.name}</button>
        ))}
      </div>
      {TOOLS.map((tool) => {
        const key = tool.toLowerCase().replace(/ /g, "").replace("removal", "Removal").replace("reduction", "Reduction").replace("correction", "Correction") as keyof typeof activeRestorationProfile;
        const val = activeRestorationProfile[tool === "Noise Removal" ? "noiseReduction" : tool === "Hum Removal" ? "humRemoval" : tool === "Click Removal" ? "clickRemoval" : tool === "Pop Removal" ? "popRemoval" : tool === "Wind Reduction" ? "windReduction" : tool === "Echo Reduction" ? "echoReduction" : "roomCorrection"];
        return (
          <label key={tool} className="mb-1 flex items-center gap-2 text-[8px] text-slate-500">
            <span className="w-28">{tool}</span>
            <input type="range" min={0} max={100} value={val} readOnly className="flex-1" />
            <span className="w-6 text-slate-700">{val}</span>
          </label>
        );
      })}
    </div>
  );
}
