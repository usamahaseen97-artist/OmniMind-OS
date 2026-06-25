"use client";

import { useVisionaryAI } from "../../../lib/visionary/ai-context";

/** Brand kit — logos, fonts, colors, voice, auto-branding. */
export function BrandKitPanel() {
  const { brandKit, updateBrandKit } = useVisionaryAI();

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Brand Kit</p>
        <label className="mt-2 block">
          <span className="text-[9px] text-slate-600">Company</span>
          <input
            value={brandKit.companyName}
            onChange={(e) => updateBrandKit({ companyName: e.target.value })}
            className="mt-0.5 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1.5 text-[11px] text-slate-200"
          />
        </label>
        <label className="mt-2 block">
          <span className="text-[9px] text-slate-600">Tagline</span>
          <input
            value={brandKit.tagline}
            onChange={(e) => updateBrandKit({ tagline: e.target.value })}
            className="mt-0.5 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1.5 text-[11px] text-slate-200"
          />
        </label>
        <label className="mt-2 block">
          <span className="text-[9px] text-slate-600">Brand Voice</span>
          <textarea
            value={brandKit.brandVoice}
            onChange={(e) => updateBrandKit({ brandVoice: e.target.value })}
            rows={3}
            className="mt-0.5 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-2 text-[10px] text-slate-300"
          />
        </label>
        <label className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
          <input
            type="checkbox"
            checked={brandKit.autoBrandingEnabled}
            onChange={(e) => updateBrandKit({ autoBrandingEnabled: e.target.checked })}
            className="accent-cyan-400"
          />
          Auto-apply branding to generations
        </label>
      </div>

      <section>
        <p className="text-[9px] uppercase tracking-wider text-slate-600">Logos</p>
        <ul className="mt-1 space-y-1">
          {brandKit.logos.map((logo) => (
            <li key={logo.id} className="flex items-center justify-between rounded bg-white/[0.03] px-2 py-1.5 text-[10px] text-slate-300">
              {logo.name}
              <span className="text-[8px] text-slate-600">{logo.variant}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-[9px] uppercase tracking-wider text-slate-600">Fonts</p>
        <ul className="mt-1 space-y-1">
          {brandKit.fonts.map((f) => (
            <li key={f.id} className="rounded bg-white/[0.03] px-2 py-1.5 text-[10px] text-slate-300" style={{ fontFamily: f.family }}>
              {f.family} · {f.weight}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-[9px] uppercase tracking-wider text-slate-600">Colors</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {brandKit.colors.map((c) => (
            <div key={c.id} className="text-center">
              <div className="h-10 w-10 rounded-lg border border-white/10" style={{ background: c.hex }} />
              <p className="mt-0.5 text-[8px] text-slate-500">{c.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
