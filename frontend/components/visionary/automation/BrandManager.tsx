"use client";

export function BrandManager() {
  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-indigo-400">Brand Manager</p>
      <p className="mb-4 text-[9px] text-slate-600">Unified brand kit · guidelines · auto-apply across pipelines</p>
      <div className="grid grid-cols-3 gap-2">
        {["Logos", "Colors", "Typography", "Voice", "Templates", "Assets"].map((item) => (
          <div key={item} className="rounded-lg border border-white/[0.06] p-3 text-center text-[9px] text-slate-500">{item}</div>
        ))}
      </div>
    </div>
  );
}
