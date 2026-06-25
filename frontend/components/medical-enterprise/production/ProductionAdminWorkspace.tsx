"use client";

import { useEffect, useState } from "react";
import { useMedicalProduction } from "@/lib/medical-enterprise/use-medical-production";
import { SystemHealthPanel } from "./admin/SystemHealthPanel";
import { medicalProductionPlatform } from "@/core/medical-enterprise/production";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

/**
 * Standalone Production Admin Workspace (Phase 8).
 * Does not modify Phase 1 layout — import where needed.
 */
export function ProductionAdminWorkspace({ role = "admin" }: { role?: ClinicalRole }) {
  const { loading, admin, health, refresh, qa, aiQuality } = useMedicalProduction(role);
  const [tab, setTab] = useState<"health" | "observability" | "qa" | "ai-quality" | "i18n">("health");
  const [qaSummary, setQaSummary] = useState<{ pass: number; warn: number; fail: number; ready: boolean } | null>(null);
  const [aiMetrics, setAiMetrics] = useState<{ approvalRate: number; approved: number; rejected: number; corrected: number } | null>(null);
  const locales = medicalProductionPlatform.service().listLocales();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (tab === "qa") void qa().then((r) => setQaSummary(r.summary));
    if (tab === "ai-quality") setAiMetrics(aiQuality());
  }, [tab, qa, aiQuality]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0f18]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div>
          <p className="text-[11px] font-semibold text-slate-200">Production Administration</p>
          <p className="text-[9px] text-slate-500">Health · QA · AI Quality · Observability · i18n</p>
        </div>
        {loading && <span className="text-[8px] text-slate-500">Syncing…</span>}
      </header>

      <nav className="flex shrink-0 gap-1 border-b border-white/[0.06] px-2 py-1">
        {(["health", "observability", "qa", "ai-quality", "i18n"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded px-2 py-0.5 text-[8px] capitalize ${tab === t ? "bg-white/[0.08] text-slate-200" : "text-slate-500"}`}
          >
            {t.replace("-", " ")}
          </button>
        ))}
      </nav>

      <main className="min-h-0 flex-1 overflow-y-auto">
        {tab === "health" && <SystemHealthPanel health={health} />}
        {tab === "observability" && admin && (
          <div className="grid grid-cols-2 gap-2 p-2">
            <Stat label="API req/min" value={admin.observability.apiRequestsPerMinute} />
            <Stat label="AI latency p95" value={`${admin.observability.aiPipelineLatencyMs}ms`} />
            <Stat label="DB pool active" value={admin.observability.dbConnectionPool.active} />
            <Stat label="Errors 24h" value={admin.observability.errors24h} />
          </div>
        )}
        {tab === "qa" && qaSummary && (
          <div className="p-3 text-[9px]">
            <p className={qaSummary.ready ? "text-emerald-400" : "text-amber-300"}>
              Production ready: {qaSummary.ready ? "Yes" : "Review required"}
            </p>
            <p className="mt-1 text-slate-500">
              Pass {qaSummary.pass} · Warn {qaSummary.warn} · Fail {qaSummary.fail}
            </p>
          </div>
        )}
        {tab === "ai-quality" && aiMetrics && (
          <div className="grid grid-cols-2 gap-2 p-2">
            <Stat label="Approval rate" value={`${aiMetrics.approvalRate}%`} />
            <Stat label="Approved" value={aiMetrics.approved} />
            <Stat label="Rejected" value={aiMetrics.rejected} />
            <Stat label="Corrected" value={aiMetrics.corrected} />
          </div>
        )}
        {tab === "i18n" && (
          <ul className="space-y-1 p-2">
            {locales.map((l) => (
              <li key={l.code} className="rounded border border-white/[0.06] px-2 py-1 text-[8px] text-slate-400">
                {l.label} ({l.code}) {l.rtl ? "RTL" : "LTR"} {l.loaded ? "✓" : ""}
              </li>
            ))}
          </ul>
        )}
      </main>

      {admin && (
        <footer className="shrink-0 border-t border-white/[0.06] px-3 py-1 text-[7px] text-slate-600">
          Storage {admin.storage.usedGb}/{admin.storage.totalGb} GB · Licenses {admin.licenses.used}/{admin.licenses.seats}
        </footer>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-white/[0.06] px-2 py-1.5">
      <p className="text-[8px] text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}
