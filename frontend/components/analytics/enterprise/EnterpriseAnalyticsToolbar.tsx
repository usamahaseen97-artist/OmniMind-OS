"use client";

import type { AnalyticsModule } from "../../../lib/enterprise-analytics";
import { useEnterpriseAnalytics } from "../../../lib/enterprise-analytics-context";
import { cn } from "../../../lib/utils";

const MODULES: { id: AnalyticsModule; label: string }[] = [
  { id: "sources", label: "Data" },
  { id: "ingestion", label: "Ingest" },
  { id: "cleaning", label: "Clean" },
  { id: "insights", label: "Insights" },
  { id: "viz", label: "Viz" },
  { id: "dashboards", label: "Dashboards" },
  { id: "forecast", label: "Forecast" },
  { id: "reports", label: "Reports" },
  { id: "python", label: "Python" },
  { id: "advisor", label: "Advisor" },
  { id: "export", label: "Export" },
];

export function EnterpriseAnalyticsToolbar() {
  const { activeModule, setActiveModule, dataset, runInsights } = useEnterpriseAnalytics();

  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-emerald-500/20 bg-[#0a0f18]/95 px-2 py-1">
      <span className="mr-2 shrink-0 text-[8px] font-bold uppercase tracking-widest text-emerald-400/90">
        Enterprise BI
      </span>
      {MODULES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => {
            setActiveModule(m.id);
            if (m.id === "insights" && dataset) runInsights();
          }}
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide transition",
            activeModule === m.id
              ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30"
              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
