"use client";

import { Car, MapPin, Mic } from "lucide-react";
import { DeckShell } from "../DeckShell";

const MOCK_PLACES = [
  { name: "Burger Lab Saddar", rank: 1, dist: "0.8 km" },
  { name: "Nazimabad Sports Hub", rank: 2, dist: "2.1 km" },
  { name: "Clifton Grill", rank: 3, dist: "4.2 km" },
];

export function DeckMapsPanel() {
  return (
    <DeckShell title="Geo Explorer · Drive Mode" subtitle="Ranked cards from semantic voice queries">
      <div className="flex items-center gap-2 rounded-lg border border-[#10B981]/40 bg-[#10B981]/10 px-2 py-2 text-[10px] text-[#00FF87]">
        <Car className="h-4 w-4" />
        Drive Mode layout active
      </div>
      <p className="flex items-center gap-1 text-[9px] text-zinc-600">
        <Mic className="h-3 w-3" />
        e.g. Saddar burger · Nazimabad sports shop
      </p>
      <ul className="space-y-1.5">
        {MOCK_PLACES.map((p) => (
          <li
            key={p.name}
            className="flex items-center gap-2 rounded-lg border border-gray-800/80 bg-[#0B0C10] px-2 py-2"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10B981]/20 text-[10px] font-bold text-[#00FF87]">
              {p.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-zinc-200">{p.name}</p>
              <p className="text-[9px] text-zinc-600">{p.dist}</p>
            </div>
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#10B981]/60" />
          </li>
        ))}
      </ul>
    </DeckShell>
  );
}
