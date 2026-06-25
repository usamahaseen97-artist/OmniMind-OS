"use client";

import { Activity, Cloud, DollarSign, Star, TrendingUp, Zap } from "lucide-react";
import { useOmniMindMarketplace } from "../../lib/omnimind-marketplace-context";

export function MarketplaceAnalyticsDashboard() {
  const mp = useOmniMindMarketplace();
  const a = mp.analytics;

  return (
    <div className="h-full overflow-y-auto p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-100">Marketplace Analytics</h2>
          <p className="text-[10px] text-zinc-500">Downloads, revenue, ratings, and platform health</p>
        </div>
        <button
          type="button"
          onClick={() => void mp.syncCloud()}
          className="flex items-center gap-1.5 rounded bg-cyan-500/15 px-3 py-1.5 text-[10px] text-cyan-300 hover:bg-cyan-500/25"
        >
          <Cloud className="h-3.5 w-3.5" />
          Sync Cloud
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Metric icon={TrendingUp} label="Downloads" value={a.downloads.toLocaleString()} />
        <Metric icon={Activity} label="Active Users" value={a.activeUsers.toLocaleString()} />
        <Metric icon={DollarSign} label="Revenue" value={`$${a.revenueUsd.toFixed(2)}`} />
        <Metric icon={Star} label="Avg Rating" value={a.avgRating.toFixed(1)} />
        <Metric icon={Zap} label="Performance" value={`${a.performanceAvg}%`} />
        <Metric icon={Activity} label="Crash Reports" value={String(a.crashReports)} />
      </div>

      <section className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Usage Trend (30d)</h3>
        <div className="mt-3 flex items-end gap-1 h-24">
          {(a.usageTrend.length ? a.usageTrend : [{ date: "—", downloads: 0 }]).slice(0, 14).map((t) => (
            <div key={t.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-cyan-500/40"
                style={{ height: `${Math.max(8, Math.min(100, t.downloads * 20))}%` }}
              />
              <span className="text-[7px] text-zinc-600">{t.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-2 text-[10px] md:grid-cols-2">
        <StatRow label="Installed Plugins" value={mp.syncState.installedPlugins.length} />
        <StatRow label="Bookmarks" value={mp.syncState.bookmarks.length} />
        <StatRow label="Licenses" value={mp.syncState.licenses.length} />
        <StatRow label="Compatibility Issues" value={a.compatibilityIssues} />
        <StatRow label="Last Synced" value={mp.syncState.lastSyncedAt ?? "Never"} />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 text-cyan-300">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded border border-white/[0.04] px-3 py-2">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-300">{value}</span>
    </div>
  );
}
