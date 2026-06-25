"use client";

import { useEffect, useState } from "react";
import type { LabReport } from "@/core/medical-enterprise/laboratory/types";
import { medicalLaboratoryPlatform } from "@/core/medical-enterprise/laboratory";
import { getPanelRegistry } from "@/core/medical-enterprise/laboratory/panels/registry";
import { LabImportZone, ManualLabEntry } from "./import/LabImportZone";
import { MonitoringDashboard } from "./dashboard/MonitoringDashboard";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

/**
 * Standalone Laboratory & Monitoring Workspace (Phase 4).
 * Does not modify Phase 1 layout — import where needed.
 */
export function LaboratoryWorkspace({
  patientId,
  role = "physician",
}: {
  patientId: string;
  role?: ClinicalRole;
}) {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState(() => medicalLaboratoryPlatform.dashboard(patientId, role));

  const refresh = () => {
    setReports(medicalLaboratoryPlatform.search({ patientId }, role));
    setDashboard(medicalLaboratoryPlatform.dashboard(patientId, role));
  };

  useEffect(() => {
    refresh();
  }, [patientId, role]);

  const activeReport = reports.find((r) => r.id === activeReportId) ?? reports[0];
  const panels = getPanelRegistry().list();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0f18]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div>
          <p className="text-[11px] font-semibold text-slate-200">Laboratory & Monitoring Platform</p>
          <p className="text-[9px] text-slate-500">Labs · Vitals · Wearables · Alerts · AI-assisted</p>
        </div>
        <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[8px] text-slate-500">{panels.length} panel types</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] gap-0">
        <aside className="overflow-y-auto border-r border-white/[0.06] p-2">
          <LabImportZone patientId={patientId} role={role} onImported={() => refresh()} />
          <ManualLabEntry patientId={patientId} role={role} onSaved={() => refresh()} />
          <p className="mt-3 text-[8px] font-medium uppercase tracking-wide text-slate-600">Reports</p>
          <ul className="mt-1 space-y-1">
            {reports.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setActiveReportId(r.id)}
                  className={`w-full rounded px-2 py-1.5 text-left text-[9px] ${
                    activeReport?.id === r.id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-500 hover:bg-white/[0.04]"
                  }`}
                >
                  {r.panelKind.toUpperCase()} — {r.collectedAt.slice(0, 10)}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="grid min-h-0 grid-rows-[1fr_auto] overflow-hidden">
          <MonitoringDashboard state={dashboard} />
          {activeReport && (
            <footer className="shrink-0 border-t border-white/[0.06] p-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-slate-400">
                  {activeReport.panelKind} · {activeReport.values.length} values · {activeReport.status}
                </p>
                <button
                  type="button"
                  onClick={() => void medicalLaboratoryPlatform.analyze(activeReport.id, role).then(() => refresh())}
                  className="rounded bg-violet-500/15 px-2 py-1 text-[9px] text-violet-200 hover:bg-violet-500/25"
                >
                  Run AI analysis
                </button>
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
