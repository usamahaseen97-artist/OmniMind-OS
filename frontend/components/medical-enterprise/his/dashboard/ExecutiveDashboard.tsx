"use client";

import type { HospitalDashboardMetrics } from "@/core/medical-enterprise/his/types";

export function ExecutiveDashboard({ metrics }: { metrics: HospitalDashboardMetrics | null }) {
  if (!metrics) {
    return <p className="p-4 text-[9px] text-slate-500">Loading hospital overview…</p>;
  }

  const cards = [
    { label: "Active Patients", value: metrics.activePatients, accent: "cyan" },
    { label: "Admissions Today", value: metrics.admissionsToday },
    { label: "Discharges Today", value: metrics.dischargesToday },
    { label: "Emergency Cases", value: metrics.emergencyCases, accent: "amber" },
    { label: "ICU Occupancy", value: `${metrics.icuOccupancy.percent}%` },
    { label: "OR Active", value: `${metrics.operationTheaters.active}/${metrics.operationTheaters.total}` },
    { label: "Appointments", value: metrics.appointmentsToday },
    { label: "Staff On Duty", value: metrics.staffOnDuty },
    { label: "Beds Available", value: `${metrics.beds.available}/${metrics.beds.total}` },
    { label: "AI Alerts", value: metrics.aiAlerts, accent: metrics.aiAlerts > 0 ? "amber" : undefined },
    { label: "System Health", value: metrics.systemHealth },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <p className="text-[8px] text-slate-500">{c.label}</p>
          <p className={`text-sm font-semibold ${c.accent === "amber" ? "text-amber-300" : c.accent === "cyan" ? "text-cyan-200" : "text-slate-200"}`}>
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
