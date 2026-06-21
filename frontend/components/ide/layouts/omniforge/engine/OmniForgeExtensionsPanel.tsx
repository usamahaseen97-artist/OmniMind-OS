"use client";

import { Download, Puzzle } from "lucide-react";

const EXTENSIONS = [
  { id: "polyglot", name: "Polyglot Language Pack", installed: true },
  { id: "git", name: "Git Integration", installed: true },
  { id: "copilot", name: "OmniForge Co-Pilot", installed: true },
  { id: "deploy", name: "Cloud Deploy Assist", installed: false },
  { id: "collab", name: "Team Collaboration", installed: false },
];

/** Extensions marketplace stub — modular plugin manager UI. */
export function OmniForgeExtensionsPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <Puzzle className="h-3.5 w-3.5 text-violet-400" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Extensions</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {EXTENSIONS.map((ext) => (
          <div
            key={ext.id}
            className="mb-1 flex items-center justify-between rounded border border-white/[0.06] px-2 py-2"
          >
            <div>
              <p className="text-[10px] font-medium text-zinc-300">{ext.name}</p>
              <p className="text-[8px] text-zinc-600">{ext.installed ? "Installed" : "Available"}</p>
            </div>
            {!ext.installed ? (
              <button
                type="button"
                className="flex items-center gap-1 rounded bg-white/[0.04] px-2 py-0.5 text-[8px] text-cyan-300"
              >
                <Download className="h-3 w-3" />
                Install
              </button>
            ) : (
              <span className="text-[8px] text-emerald-500">Active</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
