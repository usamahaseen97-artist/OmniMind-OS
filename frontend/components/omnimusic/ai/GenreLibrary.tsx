"use client";

import { GENRES } from "../../../lib/omnimusic-studio/ai/constants";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function GenreLibrary() {
  const { prompt, updatePrompt } = useOmniMusicStudio();

  return (
    <div>
      <p className="mb-1 text-[8px] text-slate-600">Genre</p>
      <div className="flex flex-wrap gap-1">
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => updatePrompt({ genre: g })}
            className={`rounded px-1.5 py-0.5 text-[8px] ${prompt.genre === g ? "bg-violet-500/15 text-violet-200" : "text-slate-600"}`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
