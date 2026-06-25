"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

export function LoopBrowser() {
  const items = useOmniMusicStudio().browserItems.filter((i) => i.category === "loops");

  return (
    <ul className="p-1">
      {items.map((item) => (
        <li key={item.id} className="rounded px-2 py-1 text-[9px] text-slate-500 hover:bg-white/[0.03]">
          {item.name} {item.bpm ? `· ${item.bpm}bpm` : ""}
        </li>
      ))}
    </ul>
  );
}
