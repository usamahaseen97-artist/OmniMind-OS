"use client";

import type { SecurityDashboardMetrics } from "@/core/medical-enterprise/governance/types";

export function SecurityDashboard({ metrics }: { metrics: SecurityDashboardMetrics | null }) {
  if (!metrics) return <p className="p-3 text-[9px] text-slate-500">Loading security dashboard…</p>;

  const items = [
    { label: "Failed Logins (24h)", value: metrics.failedLogins24h, warn: metrics.failedLogins24h > 0 },
    { label: "Permission Violations", value: metrics.permissionViolations24h, warn: metrics.permissionViolations24h > 0 },
    { label: "Suspicious Activity", value: metrics.suspiciousActivity },
    { label: "API Anomalies", value: metrics.apiAnomalies },
    { label: "Data Access Alerts", value: metrics.dataAccessAlerts },
    { label: "Active Sessions", value: metrics.activeSessions },
    { label: "Device Status", value: metrics.deviceStatus },
    { label: "System Integrity", value: metrics.systemIntegrity, warn: metrics.systemIntegrity !== "verified" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <p className="text-[8px] text-slate-500">{i.label}</p>
          <p className={`text-sm font-semibold ${i.warn ? "text-amber-300" : "text-slate-200"}`}>{i.value}</p>
        </div>
      ))}
    </div>
  );
}
