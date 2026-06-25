"use client";

import type { MonitoringDashboardState } from "@/core/medical-enterprise/laboratory/types";
import { LabTrendChart } from "../charts/LabTrendChart";
import { VitalsTimeline } from "../vitals/VitalsTimeline";

export function MonitoringDashboard({ state }: { state: MonitoringDashboardState }) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] gap-2 overflow-hidden p-2">
      <section className="grid grid-cols-3 gap-2">
        <StatCard label="Active Alerts" value={state.activeAlerts.length} accent={state.activeAlerts.length > 0 ? "amber" : "slate"} />
        <StatCard label="Vitals" value={state.vitalsTimeline.length} />
        <StatCard label="Risk" value={state.riskOverview?.level ?? "—"} accent={state.riskOverview?.level === "elevated" ? "amber" : "slate"} />
      </section>

      <div className="grid min-h-0 grid-cols-2 gap-2">
        <Panel title="Vitals Timeline">
          <VitalsTimeline readings={state.vitalsTimeline} />
        </Panel>
        <Panel title="Lab Trends">
          <LabTrendChart trends={state.labTrends} />
        </Panel>
      </div>

      <section className="grid grid-cols-2 gap-2">
        <Panel title="Alerts">
          <ul className="max-h-24 space-y-1 overflow-y-auto p-2">
            {state.activeAlerts.length === 0 ? (
              <li className="text-[9px] text-slate-500">No active alerts</li>
            ) : (
              state.activeAlerts.map((a) => (
                <li key={a.id} className="rounded border border-white/[0.06] px-2 py-1 text-[8px]">
                  <span className={a.severity === "critical" ? "text-red-400" : "text-amber-300"}>[{a.severity}]</span>{" "}
                  {a.title}
                </li>
              ))
            )}
          </ul>
        </Panel>
        <Panel title="Recent AI Observations">
          <ul className="max-h-24 space-y-1 overflow-y-auto p-2">
            {state.recentObservations.length === 0 ? (
              <li className="text-[9px] text-slate-500">No AI observations yet</li>
            ) : (
              state.recentObservations.map((o) => (
                <li key={o.id} className="text-[8px] text-slate-400">
                  {o.summary.slice(0, 80)}…
                </li>
              ))
            )}
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function StatCard({ label, value, accent = "slate" }: { label: string; value: string | number; accent?: "slate" | "amber" | "cyan" }) {
  const colors = { slate: "text-slate-200", amber: "text-amber-300", cyan: "text-cyan-200" };
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <p className="text-[8px] text-slate-500">{label}</p>
      <p className={`text-sm font-semibold ${colors[accent]}`}>{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded border border-white/[0.06] bg-white/[0.02]">
      <header className="shrink-0 border-b border-white/[0.06] px-2 py-1">
        <p className="text-[9px] font-medium text-slate-300">{title}</p>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
