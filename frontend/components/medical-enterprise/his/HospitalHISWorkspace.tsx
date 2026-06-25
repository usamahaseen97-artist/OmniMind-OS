"use client";

import { useEffect, useState } from "react";
import { useMedicalHIS } from "@/lib/medical-enterprise/use-medical-his";
import { ExecutiveDashboard } from "./dashboard/ExecutiveDashboard";
import { EMRTimelineView } from "./emr/EMRTimelineView";
import { medicalHISPlatform } from "@/core/medical-enterprise/his";
import type { AnalyticsKPI } from "@/core/medical-enterprise/his/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

/**
 * Standalone Hospital HIS Workspace (Phase 6).
 * Does not modify Phase 1 layout — import where needed.
 */
export function HospitalHISWorkspace({
  patientId = "patient-demo-001",
  role = "admin",
}: {
  patientId?: string;
  role?: ClinicalRole;
}) {
  const { loading, dashboard, emr, refreshDashboard, loadEMR } = useMedicalHIS(role);
  const [tab, setTab] = useState<"dashboard" | "emr" | "analytics" | "departments">("dashboard");
  const [kpis, setKpis] = useState<AnalyticsKPI[]>([]);
  const departments = medicalHISPlatform.departments("hospital-default", role);

  useEffect(() => {
    void refreshDashboard();
    void loadEMR(patientId);
  }, [patientId, refreshDashboard, loadEMR]);

  useEffect(() => {
    if (tab === "analytics") {
      setKpis(medicalHISPlatform.analytics("hospital-default", role));
    }
  }, [tab, role]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0f18]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div>
          <p className="text-[11px] font-semibold text-slate-200">Hospital Information System</p>
          <p className="text-[9px] text-slate-500">EMR · Appointments · Pharmacy · Billing · Telemedicine</p>
        </div>
        {loading && <span className="text-[8px] text-slate-500">Syncing…</span>}
      </header>

      <nav className="flex shrink-0 gap-1 border-b border-white/[0.06] px-2 py-1">
        {(["dashboard", "emr", "analytics", "departments"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded px-2 py-0.5 text-[8px] capitalize ${tab === t ? "bg-white/[0.08] text-slate-200" : "text-slate-500"}`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="min-h-0 flex-1 overflow-hidden">
        {tab === "dashboard" && <ExecutiveDashboard metrics={dashboard} />}
        {tab === "emr" && <EMRTimelineView record={emr} />}
        {tab === "analytics" && (
          <div className="grid grid-cols-2 gap-2 p-2">
            {kpis.map((k) => (
              <div key={k.id} className="rounded border border-white/[0.06] px-2 py-1.5">
                <p className="text-[8px] text-slate-500">{k.label}</p>
                <p className="text-sm font-semibold text-slate-200">
                  {k.value}
                  {k.unit ? ` ${k.unit}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
        {tab === "departments" && (
          <ul className="space-y-1 p-2">
            {departments.map((d) => (
              <li key={d.id} className="rounded border border-white/[0.06] px-2 py-1.5 text-[9px] text-slate-400">
                {d.name} <span className="text-[8px] text-slate-600">({d.type})</span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
