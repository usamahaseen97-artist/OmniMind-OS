"use client";

import { STYLES } from "../../../lib/omnimusic-studio/ai/constants";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function StyleLibrary() {
  const { prompt, updatePrompt } = useOmniMusicStudio();

  return (
    <div>
      <p className="mb-1 text-[8px] text-slate-600">Style · Instruments</p>
      <div className="mb-1 flex flex-wrap gap-1">
        {STYLES.map((s) => (
          <button key={s} type="button" onClick={() => updatePrompt({ advanced: { ...prompt.advanced, style: s } })} className="rounded px-1.5 py-0.5 text-[8px] text-slate-600">{s}</button>
        ))}
      </div>
      <input
        className="w-full rounded bg-black/40 px-1 py-0.5 text-[8px]"
        value={prompt.instruments.join(", ")}
        onChange={(e) => updatePrompt({ instruments: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
        placeholder="Instruments (comma-separated)"
      />
    </div>
  );
}
