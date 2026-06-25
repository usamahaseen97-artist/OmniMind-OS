"use client";

import { useEffect, useState } from "react";
import { useMedicalGovernance } from "@/lib/medical-enterprise/use-medical-governance";
import { SecurityDashboard } from "./dashboard/SecurityDashboard";
import { AuditLogViewer } from "./audit/AuditLogViewer";
import { medicalGovernancePlatform } from "@/core/medical-enterprise/governance";
import type { CompliancePlugin } from "@/core/medical-enterprise/governance/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

/**
 * Standalone Governance Workspace (Phase 7).
 * Does not modify Phase 1 layout — import where needed.
 */
export function GovernanceWorkspace({ role = "admin" }: { role?: ClinicalRole }) {
  const { loading, dashboard, audit, refresh } = useMedicalGovernance(role);
  const [tab, setTab] = useState<"security" | "audit" | "compliance" | "roles">("security");
  const [compliance, setCompliance] = useState<CompliancePlugin[]>([]);
  const matrix = tab === "roles" ? medicalGovernancePlatform.service().getPermissionMatrix(role) : [];

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (tab === "compliance") setCompliance(medicalGovernancePlatform.compliance(role));
  }, [tab, role]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0f18]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div>
          <p className="text-[11px] font-semibold text-slate-200">Security & Governance Platform</p>
          <p className="text-[9px] text-slate-500">IAM · Audit · Consent · Compliance · DR</p>
        </div>
        {loading && <span className="text-[8px] text-slate-500">Syncing…</span>}
      </header>

      <nav className="flex shrink-0 gap-1 border-b border-white/[0.06] px-2 py-1">
        {(["security", "audit", "compliance", "roles"] as const).map((t) => (
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
        {tab === "security" && <SecurityDashboard metrics={dashboard} />}
        {tab === "audit" && <AuditLogViewer events={audit} />}
        {tab === "compliance" && (
          <ul className="space-y-2 p-2">
            {compliance.map((p) => (
              <li key={p.id} className="rounded border border-white/[0.06] p-2">
                <p className="text-[9px] font-medium text-slate-300">{p.name}</p>
                <p className="text-[8px] text-slate-500">{p.framework.toUpperCase()} · v{p.version}</p>
                <p className="mt-1 text-[8px] text-cyan-400/80">
                  {p.controls.filter((c) => c.status === "configured").length}/{p.controls.length} controls configured
                </p>
              </li>
            ))}
          </ul>
        )}
        {tab === "roles" && (
          <ul className="max-h-full space-y-1 overflow-y-auto p-2">
            {matrix.map((r) => (
              <li key={r.role} className="rounded border border-white/[0.06] px-2 py-1 text-[8px] text-slate-400">
                <span className="font-medium text-slate-300">{r.label}</span> → {r.clinicalRole}
                <span className="ml-1 text-slate-600">({r.permissions.length} gov perms)</span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
