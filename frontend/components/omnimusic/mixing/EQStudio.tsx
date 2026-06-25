"use client";

function FxStudioPanel({ title, params }: { title: string; params: { label: string; value: number; min: number; max: number }[] }) {
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">{title}</p>
      {params.map((p) => (
        <label key={p.label} className="mb-1 flex items-center gap-2 text-[8px] text-slate-500">
          <span className="w-16">{p.label}</span>
          <input type="range" min={p.min} max={p.max} step={0.1} defaultValue={p.value} className="flex-1" />
        </label>
      ))}
      <p className="mt-1 text-[7px] text-slate-700">Architecture stub — no DSP processing</p>
    </div>
  );
}

export function EQStudio() {
  return <FxStudioPanel title="Parametric EQ" params={[{ label: "Low", value: 0, min: -12, max: 12 }, { label: "Mid", value: 0, min: -12, max: 12 }, { label: "High", value: 0, min: -12, max: 12 }, { label: "Q", value: 1, min: 0.1, max: 10 }]} />;
}
