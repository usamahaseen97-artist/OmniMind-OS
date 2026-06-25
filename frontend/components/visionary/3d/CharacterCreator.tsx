"use client";

import { CHARACTER_ARCHETYPES } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function CharacterCreator() {
  const { characters, createCharacter } = useVisionaryStudio3D();

  return (
    <div className="flex h-full">
      <div className="w-48 shrink-0 overflow-y-auto border-r border-white/[0.06] p-2">
        <p className="mb-2 text-[9px] uppercase text-slate-600">Archetypes</p>
        {CHARACTER_ARCHETYPES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => createCharacter(a.id, a.label)}
            className="mb-1 block w-full rounded border border-white/[0.06] px-2 py-1 text-left text-[8px] text-slate-500 hover:border-cyan-400/40"
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0a1628]">
        <div className="h-48 w-32 rounded-lg bg-gradient-to-b from-slate-500/40 to-slate-800/60" />
        <p className="mt-4 text-[10px] text-slate-400">Character Preview</p>
        <ul className="mt-4 w-full max-w-xs px-4">
          {characters.map((c) => (
            <li key={c.id} className="text-[9px] text-slate-500">{c.name} · {c.archetype}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
