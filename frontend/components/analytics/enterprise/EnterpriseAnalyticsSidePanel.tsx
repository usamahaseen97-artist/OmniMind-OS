"use client";

import { useRef, useState } from "react";
import { DATA_SOURCE_OPTIONS, STREAMING_ARCHITECTURE_STUB } from "../../../lib/enterprise-analytics";
import type { DataSourceKind } from "../../../lib/enterprise-analytics";
import { useEnterpriseAnalytics } from "../../../lib/enterprise-analytics-context";

export function EnterpriseAnalyticsSidePanel() {
  const ea = useEnterpriseAnalytics();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedConnect, setSelectedConnect] = useState<DataSourceKind | null>(null);
  const [connStr, setConnStr] = useState("");

  const { activeModule, dataset, insights, recommendations, forecast, dashboard, cleaningPreview, charts } = ea;

  if (activeModule === "sources") {
    return (
      <div className="space-y-2 p-2 text-[10px]">
        <p className="font-semibold text-zinc-400">Data Sources</p>
        <input ref={fileRef} type="file" accept=".csv,.json,.xlsx,.xls" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void ea.uploadFile(f, f.name.endsWith(".json") ? "json" : "csv");
        }} />
        <button type="button" onClick={() => fileRef.current?.click()} className="w-full rounded border border-emerald-500/30 py-2 text-emerald-300">
          Upload CSV / JSON / Excel
        </button>
        <button type="button" onClick={ea.loadSample} className="w-full rounded border border-white/10 py-1.5 text-zinc-400">
          Load sample dataset
        </button>
        <div className="grid grid-cols-2 gap-1">
          {DATA_SOURCE_OPTIONS.filter((s) => s.connect).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedConnect(s.id)}
              className={`rounded border px-2 py-1 text-left text-[8px] ${
                selectedConnect === s.id ? "border-cyan-500/40 text-cyan-300" : "border-white/8 text-zinc-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {selectedConnect ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ea.connectSource(selectedConnect, connStr || "localhost");
            }}
          >
            <input
              value={connStr}
              onChange={(e) => setConnStr(e.target.value)}
              placeholder="Connection string / API URL"
              className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-[9px]"
            />
            <button type="submit" className="mt-1 w-full rounded bg-cyan-600/70 py-1 text-[9px] text-white">
              Connect
            </button>
          </form>
        ) : null}
        <p className="text-[8px] text-zinc-600">{STREAMING_ARCHITECTURE_STUB.note}</p>
      </div>
    );
  }

  if (activeModule === "ingestion" && dataset) {
    return (
      <div className="space-y-2 overflow-y-auto p-2 text-[9px]">
        <p className="font-bold text-emerald-400">Ingestion Report</p>
        <p className="text-zinc-500">{dataset.report.rowCount} rows · {dataset.report.columnCount} columns</p>
        {dataset.report.issues.map((i, idx) => (
          <div key={idx} className="rounded border border-white/6 bg-white/[0.02] px-2 py-1 text-zinc-400">
            [{i.severity}] {i.message}
          </div>
        ))}
        <button type="button" onClick={ea.runInsights} className="w-full rounded bg-emerald-600/80 py-1.5 font-semibold text-white">
          Run AI Insights
        </button>
      </div>
    );
  }

  if (activeModule === "cleaning") {
    const ops = ["remove_duplicates", "fix_missing", "normalize_formats", "standardize_dates", "convert_currency", "remove_noise"] as const;
    return (
      <div className="space-y-1 p-2 text-[9px]">
        <p className="font-semibold text-zinc-400">AI Data Cleaning</p>
        {ops.map((op) => (
          <button key={op} type="button" onClick={() => ea.previewClean(op)} className="block w-full rounded border border-white/8 px-2 py-1 text-left capitalize text-zinc-400 hover:bg-white/5">
            {op.replace(/_/g, " ")}
          </button>
        ))}
        {cleaningPreview ? (
          <div className="mt-2 rounded border border-cyan-500/20 bg-cyan-500/5 p-2">
            <p>Preview: {cleaningPreview.beforeRows} → {cleaningPreview.afterRows} rows</p>
            <button type="button" onClick={() => ea.applyClean(cleaningPreview.operation)} className="mt-1 w-full rounded bg-cyan-600/80 py-1 text-white">
              Apply
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (activeModule === "insights") {
    return (
      <div className="space-y-1 overflow-y-auto p-2 text-[9px]">
        {insights.map((ins) => (
          <div key={ins.id} className="rounded border border-white/6 bg-black/20 p-2">
            <p className="font-semibold text-zinc-200">{ins.title}</p>
            <p className="mt-0.5 text-zinc-500">{ins.explanation}</p>
            <p className="mt-1 text-[8px] text-emerald-400">{Math.round(ins.confidence * 100)}% confidence</p>
          </div>
        ))}
      </div>
    );
  }

  if (activeModule === "viz") {
    return (
      <div className="space-y-1 p-2 text-[9px]">
        {charts.length ? charts.map((c) => (
          <button key={c.id} type="button" onClick={() => ea.setActiveChart(c)} className="block w-full rounded border border-white/8 px-2 py-1 text-left text-zinc-300">
            {c.type} · {c.title}
          </button>
        )) : <p className="text-zinc-500">Ask a question or run insights to generate charts.</p>}
      </div>
    );
  }

  if (activeModule === "dashboards") {
    const templates = ["ceo", "finance", "marketing", "sales", "operations", "custom"] as const;
    return (
      <div className="space-y-1 p-2 text-[9px]">
        {templates.map((t) => (
          <button key={t} type="button" onClick={() => ea.buildDashboard(t)} className="block w-full rounded border border-white/8 px-2 py-1 text-left capitalize text-zinc-400">
            {t} dashboard
          </button>
        ))}
        {dashboard ? <p className="mt-2 text-emerald-400">{dashboard.name} · {dashboard.widgets.length} widgets</p> : null}
      </div>
    );
  }

  if (activeModule === "forecast") {
    return (
      <div className="p-2 text-[9px]">
        <button type="button" onClick={ea.runForecast} className="mb-2 w-full rounded bg-indigo-600/80 py-1.5 text-white">
          Run forecast
        </button>
        {forecast ? (
          <ul className="space-y-1">
            {forecast.points.map((p) => (
              <li key={p.period} className="flex justify-between text-zinc-400">
                <span>{p.period}</span>
                <span>{p.value.toLocaleString()} ({p.lower}–{p.upper})</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (activeModule === "reports") {
    const kinds = ["executive", "technical", "business", "investor"] as const;
    return (
      <div className="space-y-1 p-2 text-[9px]">
        {kinds.map((k) => (
          <button key={k} type="button" onClick={() => ea.exportReport("markdown")} className="block w-full rounded border border-white/8 px-2 py-1 text-left capitalize text-zinc-400">
            {k} report
          </button>
        ))}
      </div>
    );
  }

  if (activeModule === "python") {
    const stacks = ["pandas", "numpy", "sklearn", "statsmodels", "pyspark", "duckdb"];
    return (
      <div className="space-y-1 p-2 font-mono text-[8px] text-zinc-500">
        {stacks.map((s) => (
          <pre key={s} className="rounded border border-white/6 bg-black/40 p-2 whitespace-pre-wrap">
            {`# ${s}\nimport ${s === "sklearn" ? "sklearn" : s}\ndf = load_dataset()`}
          </pre>
        ))}
      </div>
    );
  }

  if (activeModule === "advisor") {
    return (
      <div className="space-y-1 overflow-y-auto p-2 text-[9px]">
        {recommendations.map((r) => (
          <div key={r.id} className="rounded border border-amber-500/20 bg-amber-500/5 p-2">
            <p className="font-semibold text-amber-100">{r.title}</p>
            <p className="mt-0.5 text-zinc-500"><span className="text-amber-400/80">Why: </span>{r.why}</p>
          </div>
        ))}
      </div>
    );
  }

  if (activeModule === "export") {
    return (
      <div className="grid grid-cols-2 gap-1 p-2 text-[9px]">
        {(["csv", "json", "markdown"] as const).map((f) => (
          <button key={f} type="button" onClick={() => ea.exportReport(f)} className="rounded border border-white/10 py-2 uppercase text-zinc-400 hover:border-emerald-500/30">
            {f}
          </button>
        ))}
      </div>
    );
  }

  return null;
}
