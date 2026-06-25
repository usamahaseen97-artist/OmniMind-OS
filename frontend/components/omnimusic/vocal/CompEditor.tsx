"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function CompEditor() {
  const { vocalTakes } = useOmniMusicStudio();
  const comped = vocalTakes.filter((t) => t.comped || t.starred);

  return (
    <div className="mb-3 text-[8px] text-slate-500">
      <p className="text-[9px] uppercase text-slate-600">Comp Editor</p>
      {comped.length ? comped.map((t) => <p key={t.id}>{t.name} {t.comped ? "(comp)" : "(starred)"}</p>) : <p>Select takes to build comp</p>}
    </div>
  );
}
