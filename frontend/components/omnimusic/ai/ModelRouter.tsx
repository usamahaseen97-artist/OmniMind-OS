"use client";

import type { MusicProviderId } from "../../../lib/omnimusic-studio/ai-types";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function ModelRouter() {
  const { providers, preferredProvider, setPreferredProvider } = useOmniMusicStudio();

  return (
    <div className="border-t border-white/[0.04] pt-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Model Router</p>
      <select
        className="mb-2 w-full rounded bg-black/40 px-1 py-1 text-[8px]"
        value={preferredProvider}
        onChange={(e) => setPreferredProvider(e.target.value as MusicProviderId | "auto")}
      >
        <option value="auto">Auto (provider-independent)</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
      <ul className="space-y-0.5 text-[8px] text-slate-600">
        {providers.map((p) => (
          <li key={p.id}>
            {p.label} · <span className="capitalize">{p.status}</span> · {p.workflows.length} workflows
          </li>
        ))}
      </ul>
    </div>
  );
}
