"use client";

import { Check, Database } from "lucide-react";
import { useOmniForgeShell } from "../../../../../lib/omniforge-shell-context";

/** Database recommendation + schema stub — shown when database module active. */
export function OmniForgeDatabasePanel({ onClose }: { onClose?: () => void }) {
  const { architectAnalysis, approvedDatabase, setApprovedDatabase } = useOmniForgeShell();
  const db = architectAnalysis?.database;

  if (!db) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <Database className="h-8 w-8 text-zinc-600" />
        <p className="text-[10px] text-zinc-500">Scaffold a project to see database recommendations.</p>
        {onClose ? (
          <button type="button" onClick={onClose} className="text-[9px] text-cyan-400">
            Back to explorer
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-white/[0.06] px-3 py-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Database Explorer</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <p className="text-[10px] font-semibold text-cyan-300">
            Recommended: {db.recommended.toUpperCase()} ({db.score}%)
          </p>
          <p className="mt-1 text-[9px] leading-relaxed text-zinc-400">{db.reason}</p>
          {!approvedDatabase ? (
            <button
              type="button"
              onClick={() => setApprovedDatabase(db.recommended)}
              className="mt-2 flex items-center gap-1 rounded bg-emerald-600/20 px-2 py-1 text-[9px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30"
            >
              <Check className="h-3 w-3" />
              Approve &amp; Initialize
            </button>
          ) : (
            <p className="mt-2 flex items-center gap-1 text-[9px] text-emerald-400">
              <Check className="h-3 w-3" />
              Approved: {approvedDatabase}
            </p>
          )}
        </div>
        {db.alternatives.length ? (
          <div className="mt-3">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-zinc-500">Alternatives</p>
            {db.alternatives.map((alt) => (
              <button
                key={alt.id}
                type="button"
                onClick={() => setApprovedDatabase(alt.id)}
                className="mb-1 block w-full rounded border border-white/[0.06] px-2 py-1.5 text-left text-[9px] text-zinc-400 hover:border-white/10 hover:text-zinc-200"
              >
                <span className="font-semibold text-zinc-300">{alt.id}</span> — {alt.reason}
              </button>
            ))}
          </div>
        ) : null}
        {architectAnalysis?.env_bindings?.length ? (
          <div className="mt-3">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-zinc-500">Env bindings</p>
            {architectAnalysis.env_bindings.map((e) => (
              <div key={e.key} className="font-mono text-[8px] text-zinc-500">
                {e.key} <span className="text-zinc-600">({e.scope})</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
