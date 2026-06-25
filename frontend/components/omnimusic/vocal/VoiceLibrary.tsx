"use client";

import { VOICE_LIBRARY_CATEGORIES } from "../../../lib/omnimusic-studio/vocal/constants";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function VoiceLibrary() {
  const { voiceProfiles, canUseVoiceProfile, authorizeVoiceProfile, vocalPresets, applyVocalPreset } = useOmniMusicStudio();

  return (
    <div className="space-y-3">
      <p className="text-[9px] uppercase text-slate-600">Voice Library</p>
      <p className="text-[8px] text-amber-400/80">Authorized voices only — third-party profiles require explicit consent.</p>
      {VOICE_LIBRARY_CATEGORIES.map((cat) => (
        <div key={cat.id}>
          <p className="text-[8px] text-cyan-300">{cat.label}</p>
          {voiceProfiles.filter((p) => p.category === cat.id).map((p) => {
            const auth = canUseVoiceProfile(p.id);
            return (
              <div key={p.id} className="flex items-center justify-between py-0.5 text-[8px] text-slate-500">
                <span>{p.name} <span className="capitalize text-slate-600">({p.authorizationStatus})</span></span>
                {!auth.allowed && p.isThirdParty ? (
                  <button type="button" onClick={() => authorizeVoiceProfile(p.id, `consent-${Date.now()}`)} className="text-cyan-400">Authorize</button>
                ) : auth.allowed ? <span className="text-emerald-500/80">OK</span> : null}
              </div>
            );
          })}
        </div>
      ))}
      <div>
        <p className="mb-1 text-[8px] text-slate-600">Presets</p>
        {vocalPresets.map((pr) => (
          <button key={pr.id} type="button" onClick={() => applyVocalPreset(pr)} className="mr-1 rounded border border-white/[0.06] px-2 py-0.5 text-[8px] text-slate-500">{pr.name}</button>
        ))}
      </div>
    </div>
  );
}
