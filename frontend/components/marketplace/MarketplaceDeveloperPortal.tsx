"use client";

import { Code2, Key, Package, Upload } from "lucide-react";
import { PLUGIN_SDK_TEMPLATE } from "../../core/marketplace";
import { useOmniMindMarketplace } from "../../lib/omnimind-marketplace-context";

export function MarketplaceDeveloperPortal() {
  const mp = useOmniMindMarketplace();

  return (
    <div className="h-full overflow-y-auto p-4">
      <header className="mb-4">
        <h2 className="text-sm font-bold text-zinc-100">Developer Center</h2>
        <p className="text-[10px] text-zinc-500">Publish plugins, manage versions, and access the OmniMind Plugin SDK</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <DevCard icon={Package} title="Your Listings" value={`${mp.developer.listings.length} published`} />
        <DevCard icon={Upload} title="Downloads" value={mp.analytics.downloads.toLocaleString()} />
        <DevCard icon={Key} title="API Keys" value={`${mp.developer.apiKeys.length} active`} />
        <DevCard icon={Code2} title="SDK Version" value="12.0.0" />
      </div>

      <section className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">API Keys</h3>
        <ul className="mt-2 space-y-1">
          {mp.developer.apiKeys.map((k) => (
            <li key={k.id} className="flex items-center justify-between rounded border border-white/[0.04] px-2 py-1.5 text-[10px]">
              <span className="text-zinc-300">{k.label}</span>
              <code className="text-zinc-500">{k.prefix}…</code>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => mp.generateApiKey("New Key")}
          className="mt-2 rounded bg-cyan-500/15 px-3 py-1.5 text-[10px] text-cyan-300 hover:bg-cyan-500/25"
        >
          Generate API Key
        </button>
      </section>

      <section className="mt-4 rounded-xl border border-white/[0.06] bg-black/30 p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Plugin SDK Manifest Template</h3>
        <pre className="mt-2 max-h-64 overflow-auto text-[9px] leading-relaxed text-emerald-200/80">
          {JSON.stringify(PLUGIN_SDK_TEMPLATE, null, 2)}
        </pre>
      </section>

      <section className="mt-4 grid gap-2 text-[10px] text-zinc-500 md:grid-cols-3">
        <ActionTile label="Create Plugin" hint="Scaffold from SDK template" />
        <ActionTile label="Publish Update" hint="Semantic versioning + changelog" />
        <ActionTile label="Manage Licensing" hint="Free, paid, enterprise models" />
        <ActionTile label="View Analytics" hint="Downloads & active users" />
        <ActionTile label="Respond to Reviews" hint="Developer feedback loop" />
        <ActionTile label="SDK Documentation" hint="See MARKETPLACE_ARCHITECTURE.md" />
      </section>
    </div>
  );
}

function DevCard({ icon: Icon, title, value }: { icon: typeof Package; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 text-cyan-300">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[9px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <p className="mt-2 text-[11px] text-zinc-300">{value}</p>
    </div>
  );
}

function ActionTile({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <p className="font-medium text-zinc-300">{label}</p>
      <p className="text-[9px] text-zinc-600">{hint}</p>
    </div>
  );
}
