"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import type { AppViewId } from "../../lib/app-views";
import { getAppView } from "../../lib/app-views";
import { cn } from "../../lib/utils";

interface EntertainmentShellProps {
  viewId: Exclude<AppViewId, "sovereign-core">;
  placeholder: string;
  searchLabel: string;
  children?: ReactNode;
}

export function EntertainmentShell({
  viewId,
  placeholder,
  searchLabel,
  children,
}: EntertainmentShellProps) {
  const view = getAppView(viewId);
  const [query, setQuery] = useState("");
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) setLastQuery(q);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0B0C10]">
      <header className="glass-panel shrink-0 border-b border-gray-800/60 px-4 py-4">
        <h1 className="text-lg font-bold text-white">{view.label}</h1>
        <p className="mt-1 text-sm text-zinc-500">{view.tagline}</p>
        <p className="mt-2 text-xs text-zinc-600">{placeholder}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <form onSubmit={onSubmit} className="shrink-0">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            {searchLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={cn(
                "min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-2.5 text-sm",
                "text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30",
              )}
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
            >
              Search
            </button>
          </div>
        </form>

        {lastQuery ? (
          <p className="text-xs text-zinc-500">
            Last query: <span className="text-violet-300">{lastQuery}</span> — API wiring coming soon.
          </p>
        ) : null}

        {children ?? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8">
            <p className="max-w-md text-center text-sm text-zinc-600">
              Boilerplate workspace for <span className="text-zinc-400">{view.label}</span>. Backend
              placeholder endpoints are live under <code className="text-violet-400">/api/</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
