"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { useOmniMindBrainOptional } from "../../lib/omnimind-brain-context";

export function BrainPermissionPrompt() {
  const brain = useOmniMindBrainOptional();
  const req = brain?.permission;
  if (!req) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-amber-500/30 bg-[#12141c] p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-zinc-100">{req.title}</h3>
            <p className="mt-1 text-[11px] text-zinc-400">{req.description}</p>
            {req.toolId ? <p className="mt-2 font-mono text-[9px] text-zinc-600">Tool: {req.toolId}</p> : null}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => brain.respondPermission(false)}
            className="flex items-center gap-1 rounded-lg px-4 py-2 text-[10px] text-zinc-400 hover:bg-white/5"
          >
            <X className="h-3 w-3" /> Deny
          </button>
          <button
            type="button"
            onClick={() => brain.respondPermission(true)}
            className="flex items-center gap-1 rounded-lg bg-amber-600/90 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-amber-500"
          >
            <Check className="h-3 w-3" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}
