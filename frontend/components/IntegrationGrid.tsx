"use client";

import { CheckCircle2, CircleDashed } from "lucide-react";
import { INTEGRATION_CATALOG } from "../lib/navigation";
import type { IntegrationStatus } from "../lib/types";

interface IntegrationGridProps {
  hubId: string;
  statuses: IntegrationStatus[];
}

export function IntegrationGrid({ hubId, statuses }: IntegrationGridProps) {
  const items = INTEGRATION_CATALOG[hubId] ?? [];
  const statusMap = Object.fromEntries(statuses.map((s) => [s.key, s.configured]));

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const configured =
          item.envKey === "N/A" ? true : (statusMap[item.envKey] ?? false);
        return (
          <article
            key={item.name}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-amber-500/20"
          >
            <header className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{item.name}</h3>
                <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
                <p className="mt-2 font-mono text-[10px] text-zinc-600">{item.envKey}</p>
              </div>
              {configured ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <CircleDashed className="h-4 w-4 shrink-0 text-zinc-600" />
              )}
            </header>
            <span
              className={`mt-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                configured
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {configured ? "Ready" : "Add to backend .env"}
            </span>
          </article>
        );
      })}
    </section>
  );
}
