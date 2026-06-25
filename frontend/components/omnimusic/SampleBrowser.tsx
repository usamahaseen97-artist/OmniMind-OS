"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

export function SampleBrowser() {
  const { browserItems, browserTab } = useOmniMusicStudio();
  const items = browserItems.filter((i) => i.category === browserTab || browserTab === "favorites" || browserTab === "recent");

  return (
    <ul className="p-1">
      {(browserTab === "favorites" || browserTab === "recent" ? browserItems : items).map((item) => (
        <li key={item.id} className="cursor-grab rounded px-2 py-1 text-[9px] text-slate-500 hover:bg-white/[0.03]">{item.name}</li>
      ))}
    </ul>
  );
}
