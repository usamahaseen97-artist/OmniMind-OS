"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { getPermissionRegistry } from "../../core/plugins";
import type { PermissionRequestRecord } from "../../core/plugins/types";

/** Plugin permission approval UI — filesystem, camera, deployment, etc. */
export function PluginPermissionPrompt() {
  const [pending, setPending] = useState<PermissionRequestRecord | null>(null);

  useEffect(() => {
    const registry = getPermissionRegistry();
    const unsub = registry.subscribe((req) => setPending(req));
    return () => {
      unsub();
    };
  }, []);

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-cyan-500/25 bg-[#12141c] p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Plugin permission required</h3>
            <p className="mt-1 text-[11px] text-zinc-400">{pending.reason}</p>
            <p className="mt-2 font-mono text-[9px] text-zinc-500">
              {pending.pluginId} · {pending.scope}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              getPermissionRegistry().respond(pending.id, false);
              setPending(null);
            }}
            className="flex items-center gap-1 rounded-lg px-4 py-2 text-[10px] text-zinc-400 hover:bg-white/5"
          >
            <X className="h-3 w-3" /> Deny
          </button>
          <button
            type="button"
            onClick={() => {
              getPermissionRegistry().respond(pending.id, true);
              setPending(null);
            }}
            className="flex items-center gap-1 rounded-lg bg-cyan-600/90 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-cyan-500"
          >
            <Check className="h-3 w-3" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}
