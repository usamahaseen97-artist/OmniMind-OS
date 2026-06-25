"use client";

import { cn } from "../../lib/utils";
import { BROWSER_TABS } from "../../lib/omnimusic-studio/constants";
import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";
import { SampleBrowser } from "./SampleBrowser";
import { LoopBrowser } from "./LoopBrowser";
import { InstrumentBrowser } from "./InstrumentBrowser";
import { MusicTemplates } from "./ai/MusicTemplates";
import { MusicAssetLibrary } from "./ai/MusicAssetLibrary";

export function MusicSidebar() {
  const { browserTab, setBrowserTab } = useOmniMusicStudio();

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap gap-0.5 border-b border-white/[0.06] p-1">
        {BROWSER_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setBrowserTab(t.id)}
            className={cn(
              "rounded px-1.5 py-0.5 text-[8px]",
              browserTab === t.id ? "bg-pink-500/15 text-pink-200" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {browserTab === "samples" || browserTab === "recent" || browserTab === "favorites" ? <SampleBrowser /> : null}
        {browserTab === "loops" ? <LoopBrowser /> : null}
        {browserTab === "instruments" || browserTab === "presets" ? <InstrumentBrowser /> : null}
        {browserTab === "templates" ? <MusicTemplates /> : null}
        {browserTab === "projects" ? <MusicAssetLibrary /> : null}
        {browserTab === "favorites" ? <MusicAssetLibrary /> : null}
      </div>
    </div>
  );
}
