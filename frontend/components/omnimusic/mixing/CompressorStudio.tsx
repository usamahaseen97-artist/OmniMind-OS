"use client";

export function CompressorStudio() {
  const params = [
    { label: "Thresh", value: -18, min: -60, max: 0 },
    { label: "Ratio", value: 4, min: 1, max: 20 },
    { label: "Attack", value: 10, min: 0.1, max: 100 },
    { label: "Release", value: 100, min: 10, max: 1000 },
  ];
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Compressor</p>
      {params.map((p) => (
        <label key={p.label} className="mb-1 flex items-center gap-2 text-[8px] text-slate-500">
          <span className="w-16">{p.label}</span>
          <input type="range" min={p.min} max={p.max} step={0.1} defaultValue={p.value} className="flex-1" />
        </label>
      ))}
    </div>
  );
}
