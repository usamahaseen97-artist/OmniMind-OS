"use client";

export function SaturationStudio() {
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Saturation · Tape · Tube · Exciter · Clipper</p>
      <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500"><span className="w-16">Drive</span><input type="range" min={0} max={100} defaultValue={20} className="flex-1" /></label>
      <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500"><span className="w-16">Tone</span><input type="range" min={0} max={100} defaultValue={50} className="flex-1" /></label>
    </div>
  );
}
