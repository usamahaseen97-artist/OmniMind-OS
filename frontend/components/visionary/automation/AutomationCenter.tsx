"use client";

import { AUTOMATION_ACTIONS } from "../../../lib/visionary/automation/constants";
import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function AutomationCenter({ pluginsOnly = false }: { pluginsOnly?: boolean }) {
  const { runAutomation, plugins, installPlugin } = useVisionaryAutomation();

  if (pluginsOnly) {
    return (
      <div className="p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase text-indigo-400">Plugin Platform</p>
        {plugins.map((p) => (
          <PluginRow key={p.id} name={p.name} version={p.version} installed={p.installed} onInstall={() => installPlugin(p.id)} />
        ))}
      </div>
    );
  }

  return (
    <div className="border-b border-white/[0.06] p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Automation Center</p>
      {AUTOMATION_ACTIONS.slice(0, 4).map((a) => (
        <button key={a.id} type="button" onClick={() => runAutomation(a.id)} className="mb-0.5 block w-full rounded px-2 py-0.5 text-left text-[8px] text-slate-500 hover:bg-white/[0.03]">
          {a.label}
        </button>
      ))}
    </div>
  );
}

function PluginRow({ name, version, installed, onInstall }: { name: string; version: string; installed: boolean; onInstall: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between rounded bg-white/[0.03] px-2 py-1.5">
      <span className="text-[10px] text-slate-400">{name} v{version}</span>
      {installed ? <span className="text-[8px] text-emerald-400">Installed</span> : <button type="button" onClick={onInstall} className="text-[8px] text-indigo-400">Install</button>}
    </div>
  );
}
