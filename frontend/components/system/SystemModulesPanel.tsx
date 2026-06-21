"use client";

import { useEffect, useState } from "react";
import { INTEGRATION_CATALOG } from "../../lib/navigation";

import { getBackendUrl } from "../../lib/backend-url";

export function SystemModulesPanel() {
  const [status, setStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`${getBackendUrl()}/integrations`)
      .then((r) => r.json())
      .then((d: { integrations?: { key: string; configured: boolean }[] }) => {
        const map: Record<string, boolean> = {};
        for (const i of d.integrations ?? []) map[i.key] = i.configured;
        setStatus(map);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-6">
      <h2 className="text-xl font-bold text-white">System Modules</h2>
      <p className="mt-1 text-sm text-zinc-500">Integration hubs & API status</p>
      <div className="mt-6 space-y-6">
        {Object.entries(INTEGRATION_CATALOG).map(([hub, items]) => (
          <section key={hub}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400">{hub}</h3>
            <ul className="mt-2 space-y-2">
              {items.map((item) => (
                <li
                  key={item.envKey}
                  className="glass-panel flex items-center justify-between rounded-xl px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-zinc-200">{item.name}</p>
                    <p className="text-[10px] text-zinc-600">{item.description}</p>
                  </div>
                  <span
                    className={
                      status[item.envKey]
                        ? "text-[10px] text-neon-green"
                        : "text-[10px] text-zinc-600"
                    }
                  >
                    {status[item.envKey] ? "● on" : "○ off"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
