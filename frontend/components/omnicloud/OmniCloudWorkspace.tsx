"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Cloud,
  Cpu,
  Database,
  HardDrive,
  Lock,
  RefreshCw,
  Server,
  Shield,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { omniCore } from "../../core/omnicore/OmniCore";
import { SYNC_DOMAINS } from "../../core/omnicloud/constants";
import type { CloudAccount, CloudAdminDashboard, RemoteJob, StorageBucket, SyncResult } from "../../core/omnicloud/types";
import { cn } from "../../lib/utils";

type Tab = "overview" | "account" | "sync" | "projects" | "memory" | "remote" | "storage" | "security" | "offline" | "admin";

export function OmniCloudWorkspace() {
  const [tab, setTab] = useState<Tab>("overview");
  const [account, setAccount] = useState<CloudAccount | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [admin, setAdmin] = useState<CloudAdminDashboard | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    await omniCore.cloud.boot();
    setAccount(omniCore.cloud.account.account);
    setSyncResults(omniCore.cloud.sync.results);
    setJobs(await omniCore.cloud.remote.list());
    setBuckets(await omniCore.cloud.storage.load());
    setAdmin(await omniCore.cloud.admin.load());
  };

  useEffect(() => {
    void omniCore.boot();

    let intervalId: number | undefined;

    const loadIfVisible = () => {
      if (document.hidden) return;
      void load();
    };

    const startPolling = () => {
      if (intervalId != null) return;
      intervalId = window.setInterval(loadIfVisible, 15000);
    };

    const stopPolling = () => {
      if (intervalId == null) return;
      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
        return;
      }
      loadIfVisible();
      startPolling();
    };

    loadIfVisible();
    startPolling();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const runSync = async () => {
    setSyncing(true);
    await omniCore.cloud.syncAll();
    setSyncResults(omniCore.cloud.sync.results);
    setSyncing(false);
  };

  const tabs: { id: Tab; label: string; icon: typeof Cloud }[] = [
    { id: "overview", label: "Overview", icon: Cloud },
    { id: "account", label: "Account", icon: Smartphone },
    { id: "sync", label: "Sync", icon: RefreshCw },
    { id: "projects", label: "Project Cloud", icon: Database },
    { id: "memory", label: "AI Memory", icon: Brain },
    { id: "remote", label: "Remote Jobs", icon: Server },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "security", label: "Security", icon: Shield },
    { id: "offline", label: "Offline", icon: WifiOff },
    { id: "admin", label: "Admin", icon: Cpu },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#05070c] text-zinc-100">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Cloud className="h-5 w-5 text-sky-400" />
        <div>
          <h1 className="text-sm font-semibold">OmniCloud</h1>
          <p className="text-[10px] text-zinc-500">OmniMind V2.0 — Cloud-Native AI Platform</p>
        </div>
        <button
          type="button"
          onClick={() => void runSync()}
          disabled={syncing}
          className="ml-auto rounded-lg bg-sky-500/20 px-3 py-1.5 text-[10px] text-sky-200 hover:bg-sky-500/30 disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync All"}
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="w-44 shrink-0 border-r border-white/10 p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px]",
                tab === t.id ? "bg-sky-500/15 text-sky-200" : "text-zinc-500 hover:bg-white/5",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </nav>

        <main className="history-scroll-hover min-h-0 flex-1 overflow-y-auto p-4">
          {tab === "overview" ? (
            <OverviewPanel account={account} syncResults={syncResults} jobs={jobs} admin={admin} />
          ) : null}
          {tab === "account" ? <AccountPanel account={account} /> : null}
          {tab === "sync" ? <SyncPanel results={syncResults} onSync={runSync} syncing={syncing} /> : null}
          {tab === "projects" ? <ProjectsPanel /> : null}
          {tab === "memory" ? <MemoryPanel /> : null}
          {tab === "remote" ? <RemotePanel jobs={jobs} onRefresh={load} /> : null}
          {tab === "storage" ? <StoragePanel buckets={buckets} /> : null}
          {tab === "security" ? <SecurityPanel /> : null}
          {tab === "offline" ? <OfflinePanel /> : null}
          {tab === "admin" ? <AdminPanel admin={admin} /> : null}
        </main>
      </div>
    </div>
  );
}

function OverviewPanel({
  account,
  syncResults,
  jobs,
  admin,
}: {
  account: CloudAccount | null;
  syncResults: SyncResult[];
  jobs: RemoteJob[];
  admin: CloudAdminDashboard | null;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <Card title="Account" value={account?.displayName ?? "—"} sub={account?.plan ?? ""} />
      <Card title="Devices" value={String(account?.devices.length ?? 0)} sub="Trusted devices" />
      <Card title="Sync Domains" value={String(syncResults.length || SYNC_DOMAINS.length)} sub="Active" />
      <Card title="Remote Jobs" value={String(jobs.length)} sub={`${jobs.filter((j) => j.status === "running").length} running`} />
      <Card title="Storage" value={formatBytes(admin?.usage.storageBytes ?? 0)} sub="Used" />
      <Card title="Encryption" value="E2E" sub="AES-256-GCM" />
    </div>
  );
}

function AccountPanel({ account }: { account: CloudAccount | null }) {
  if (!account) return <p className="text-sm text-zinc-500">Loading account…</p>;
  return (
    <div className="space-y-4">
      <section>
        <h2 className="mb-2 text-xs font-semibold text-zinc-300">{account.displayName}</h2>
        <p className="text-[10px] text-zinc-500">{account.email} · {account.plan}</p>
      </section>
      <section>
        <h3 className="mb-2 text-[10px] font-semibold uppercase text-zinc-500">Devices</h3>
        <ul className="space-y-1">
          {account.devices.map((d) => (
            <li key={d.id} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-[10px]">
              <span>{d.name} ({d.kind})</span>
              <span className={d.trusted ? "text-emerald-400" : "text-amber-400"}>{d.trusted ? "Trusted" : "Pending"}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="mb-2 text-[10px] font-semibold uppercase text-zinc-500">Sessions</h3>
        <p className="text-[10px] text-zinc-500">{account.sessions.length} active sessions</p>
      </section>
    </div>
  );
}

function SyncPanel({ results, onSync, syncing }: { results: SyncResult[]; onSync: () => void; syncing: boolean }) {
  return (
    <div>
      <button type="button" onClick={() => void onSync()} disabled={syncing} className="mb-4 rounded-lg bg-sky-500/20 px-3 py-1.5 text-[10px] text-sky-200">
        {syncing ? "Syncing…" : "Run Full Sync"}
      </button>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(results.length ? results : SYNC_DOMAINS.map((d) => ({ domain: d, status: "queued" as const, itemCount: 0, at: "" }))).map((r) => (
          <div key={r.domain} className="rounded-lg border border-white/5 px-3 py-2">
            <p className="text-[10px] font-medium text-zinc-200">{r.domain}</p>
            <p className="text-[10px] text-zinc-500">{r.status} · {r.itemCount} items</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel() {
  const projects = omniCore.projects.list();
  return (
    <ul className="space-y-2">
      {projects.map((p) => (
        <li key={p.id} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-[10px]">
          <span>{p.name}</span>
          <button
            type="button"
            className="text-sky-400 hover:underline"
            onClick={() => void omniCore.cloud.projects.cloudSave(p.id)}
          >
            Cloud Save
          </button>
        </li>
      ))}
    </ul>
  );
}

function MemoryPanel() {
  const mem = omniCore.cloud.memory.snapshot();
  return (
    <div className="space-y-2 text-[10px] text-zinc-400">
      <p>{mem.entryCount} memory entries · {mem.graphEdges} graph edges</p>
      <button type="button" className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-sky-200" onClick={() => void omniCore.cloud.memory.sync()}>
        Sync Memory to Cloud
      </button>
    </div>
  );
}

function RemotePanel({ jobs, onRefresh }: { jobs: RemoteJob[]; onRefresh: () => void }) {
  const enqueue = async (kind: "render-image" | "generate-code") => {
    await omniCore.cloud.background.run(kind, `Demo ${kind}`);
    await onRefresh();
  };
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button type="button" className="rounded-lg bg-sky-500/20 px-2 py-1 text-[10px] text-sky-200" onClick={() => void enqueue("render-image")}>
          Render Image
        </button>
        <button type="button" className="rounded-lg bg-sky-500/20 px-2 py-1 text-[10px] text-sky-200" onClick={() => void enqueue("generate-code")}>
          Generate Code
        </button>
      </div>
      <ul className="space-y-2">
        {jobs.map((j) => (
          <li key={j.id} className="rounded-lg border border-white/5 px-3 py-2 text-[10px]">
            <div className="flex justify-between">
              <span className="font-medium text-zinc-200">{j.label}</span>
              <span className="text-zinc-500">{j.status}</span>
            </div>
            <div className="mt-1 h-1 rounded bg-white/5">
              <div className="h-1 rounded bg-sky-500" style={{ width: `${j.progress}%` }} />
            </div>
            <p className="mt-1 text-zinc-600">ETA: {j.etaSeconds ?? "—"}s · CPU: {j.resourceUsage.cpu ?? "—"}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoragePanel({ buckets }: { buckets: StorageBucket[] }) {
  return (
    <ul className="space-y-2">
      {buckets.map((b) => (
        <li key={b.id} className="rounded-lg border border-white/5 px-3 py-2 text-[10px]">
          <div className="flex justify-between">
            <span className="text-zinc-200">{b.kind}</span>
            <span className="text-zinc-500">{b.cdnEnabled ? "CDN" : "Private"}</span>
          </div>
          <p className="text-zinc-500">{formatBytes(b.usedBytes)} / {formatBytes(b.quotaBytes)}</p>
        </li>
      ))}
    </ul>
  );
}

function SecurityPanel() {
  const policy = omniCore.cloud.security.syncPolicy();
  return (
    <div className="space-y-2 text-[10px]">
      <div className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-emerald-400" /><span>Encrypted Sync: {policy.encryptedSync ? "On" : "Off"}</span></div>
      <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-emerald-400" /><span>Encrypted Memory: {policy.encryptedMemory ? "On" : "Off"}</span></div>
      <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-emerald-400" /><span>Algorithm: {policy.algorithm}</span></div>
    </div>
  );
}

function OfflinePanel() {
  const off = omniCore.cloud.offline.snapshot();
  return (
    <div className="space-y-3 text-[10px]">
      <p>Offline: {off.offline ? "Yes" : "No"} · Queue: {off.queueLength}</p>
      <button type="button" className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-sky-200" onClick={() => omniCore.cloud.offline.setOffline(!off.offline)}>
        Toggle Offline Mode
      </button>
      <button type="button" className="ml-2 rounded-lg bg-white/5 px-3 py-1.5 text-zinc-300" onClick={() => void omniCore.cloud.offline.flush()}>
        Flush Queue
      </button>
    </div>
  );
}

function AdminPanel({ admin }: { admin: CloudAdminDashboard | null }) {
  if (!admin) return <p className="text-sm text-zinc-500">Loading admin dashboard…</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card title="Storage" value={formatBytes(admin.usage.storageBytes)} sub="Total used" />
      <Card title="API Calls" value={String(admin.usage.apiCalls)} sub="This period" />
      <Card title="Devices" value={String(admin.devices)} sub="Registered" />
      <Card title="Organizations" value={String(admin.organizations)} sub="Active" />
    </div>
  );
}

function Card({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-[10px] text-zinc-500">{title}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
      <p className="text-[10px] text-zinc-600">{sub}</p>
    </div>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}
