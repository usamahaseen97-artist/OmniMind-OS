"use client";

import type { VitalReading } from "@/core/medical-enterprise/laboratory/types";

const VITAL_LABELS: Record<VitalReading["type"], string> = {
  "heart-rate": "HR",
  "blood-pressure": "BP",
  temperature: "Temp",
  "respiratory-rate": "RR",
  spo2: "SpO₂",
  ecg: "ECG",
  eeg: "EEG",
  "blood-glucose": "Glucose",
  weight: "Weight",
  bmi: "BMI",
  "pain-score": "Pain",
  sleep: "Sleep",
  activity: "Activity",
  "fluid-balance": "Fluids",
};

export function VitalsTimeline({ readings }: { readings: VitalReading[] }) {
  if (!readings.length) {
    return <p className="p-3 text-[9px] text-slate-500">No vitals recorded</p>;
  }

  const recent = [...readings].reverse().slice(0, 20);

  return (
    <ul className="max-h-48 space-y-1 overflow-y-auto p-2">
      {recent.map((r) => (
        <li key={r.id} className="flex items-center justify-between rounded px-2 py-1 text-[9px] hover:bg-white/[0.03]">
          <span className="text-slate-400">{VITAL_LABELS[r.type] ?? r.type}</span>
          <span className="font-mono text-slate-200">
            {r.value}
            {r.unit ? ` ${r.unit}` : ""}
            {r.secondaryValue !== undefined ? `/${r.secondaryValue}` : ""}
          </span>
          <span className="text-[8px] text-slate-600">{r.recordedAt.slice(11, 16)}</span>
        </li>
      ))}
    </ul>
  );
}
