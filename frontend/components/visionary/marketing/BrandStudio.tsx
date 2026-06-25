"use client";

import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function BrandStudio() {
  const {
    brandIdentity,
    updateBrandIdentity,
    brandColors,
    addBrandColor,
    brandLogos,
    addBrandLogo,
    brandFonts,
    addBrandFont,
  } = useVisionaryMarketing();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Brand Studio</p>

      <section className="mb-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="mb-2 text-[9px] uppercase text-slate-600">Brand Identity</p>
        <input
          value={brandIdentity.companyName}
          onChange={(e) => updateBrandIdentity({ companyName: e.target.value })}
          className="mb-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-slate-200"
          placeholder="Company name"
        />
        <input
          value={brandIdentity.tagline}
          onChange={(e) => updateBrandIdentity({ tagline: e.target.value })}
          className="mb-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-slate-200"
          placeholder="Tagline"
        />
        <textarea
          value={brandIdentity.targetAudience}
          onChange={(e) => updateBrandIdentity({ targetAudience: e.target.value })}
          className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-slate-400"
          rows={2}
          placeholder="Target audience"
        />
      </section>

      <section className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/[0.06] p-3">
          <div className="mb-2 flex justify-between">
            <p className="text-[9px] uppercase text-slate-600">Color Palette</p>
            <button type="button" onClick={() => addBrandColor("#ffffff", "accent")} className="text-[8px] text-violet-400">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandColors.map((c) => (
              <div key={c.id} className="text-center">
                <div className="h-8 w-8 rounded border border-white/20" style={{ backgroundColor: c.hex }} />
                <p className="mt-0.5 text-[7px] text-slate-600">{c.role}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/[0.06] p-3">
          <div className="mb-2 flex justify-between">
            <p className="text-[9px] uppercase text-slate-600">Typography</p>
            <button type="button" onClick={() => addBrandFont("Geist", "display")} className="text-[8px] text-violet-400">+</button>
          </div>
          {brandFonts.map((f) => (
            <p key={f.id} className="text-[10px] text-slate-400">{f.family} {f.weight} · {f.role}</p>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-white/[0.06] p-3">
        <div className="mb-2 flex justify-between">
          <p className="text-[9px] uppercase text-slate-600">Logo Manager</p>
          <button type="button" onClick={() => addBrandLogo("New Logo", "secondary")} className="text-[8px] text-violet-400">+ Logo</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {brandLogos.map((l) => (
            <div key={l.id} className="flex h-16 items-center justify-center rounded border border-dashed border-white/10 bg-black/20">
              <span className="text-[8px] text-slate-500">{l.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
        <p className="text-[9px] font-medium text-violet-300">AI Brand Assistant</p>
        <p className="mt-1 text-[9px] text-slate-500">Generate brand voice, palette, and guidelines from your business info.</p>
        <button type="button" className="mt-2 rounded bg-violet-600/80 px-3 py-1 text-[9px] text-white">Run Brand Analysis</button>
      </section>
    </div>
  );
}
