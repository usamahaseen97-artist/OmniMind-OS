"use client";

import { useEffect, useState } from "react";
import { omniCore } from "../../core/omnicore/OmniCore";
import type { AutomationMetrics, WorkflowExecution } from "../../core/automation/types";

export function OmniAutomationDashboard() {
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);

  useEffect(() => {
    const load = async () => {
      await omniCore.automation.boot();
      setMetrics(await omniCore.automation.monitor.refresh());
      const res = await omniCore.automation.executor.history();
      setExecutions(res);
    };
    void load();
    const id = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Executions" value={String(metrics?.totalExecutions ?? 0)} />
      <MetricCard label="Success rate" value={`${Math.round((metrics?.successRate ?? 0) * 100)}%`} />
      <MetricCard label="Failure rate" value={`${Math.round((metrics?.failureRate ?? 0) * 100)}%`} />
      <MetricCard label="Avg time" value={`${metrics?.avgExecutionMs ?? 0}ms`} />
      <MetricCard label="Queue depth" value={String(metrics?.resourceUsage.queueDepth ?? 0)} />
      <MetricCard label="AI decisions" value={String(metrics?.aiDecisions ?? 0)} />

      <section className="md:col-span-2 xl:col-span-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Recent executions</h3>
        <ul className="space-y-1 text-xs">
          {executions.slice(0, 8).map((ex) => (
            <li key={ex.id} className="flex justify-between text-zinc-400">
              <span className="truncate">{ex.workflowId}</span>
              <span className={ex.status === "completed" ? "text-emerald-400" : ex.status === "failed" ? "text-rose-400" : "text-cyan-400"}>
                {ex.status}
              </span>
            </li>
          ))}
          {executions.length === 0 ? <li className="text-zinc-600">No executions yet</li> : null}
        </ul>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c1018]/90 p-3">
      <p className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
