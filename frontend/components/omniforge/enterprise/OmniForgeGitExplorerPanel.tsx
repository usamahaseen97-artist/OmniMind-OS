"use client";

import { GitBranch, GitCommit } from "lucide-react";

export function OmniForgeGitExplorerPanel() {
  const commits = [
    { id: "a1b2c3d", msg: "feat: scaffold enterprise workspace", branch: "main" },
    { id: "e4f5g6h", msg: "chore: omniforge init", branch: "main" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3 text-[10px]">
      <div className="mb-2 flex items-center gap-2 text-zinc-300">
        <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
        <span className="font-bold uppercase tracking-wider">Git Explorer</span>
      </div>
      <p className="text-zinc-500">Branch: <span className="text-zinc-300">main</span> · clean</p>
      <div className="mt-3 space-y-2">
        {commits.map((c) => (
          <div key={c.id} className="flex gap-2 rounded border border-white/10 p-2">
            <GitCommit className="mt-0.5 h-3 w-3 shrink-0 text-zinc-500" />
            <div>
              <p className="text-zinc-300">{c.msg}</p>
              <p className="font-mono text-[9px] text-zinc-600">{c.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
