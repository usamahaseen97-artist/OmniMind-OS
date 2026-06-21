"use client";

import { Terminal } from "lucide-react";
import type { GeneratedFileAsset } from "../../lib/execution-preview";
import { cn } from "../../lib/utils";

interface ArchitectCodeBotTerminalProps {
  files: GeneratedFileAsset[];
  status: string | null;
  loading?: boolean;
  logs?: string[];
}

export function ArchitectCodeBotTerminal({
  files,
  status,
  loading,
  logs = [],
}: ArchitectCodeBotTerminalProps) {
  const defaultLogs = [
    "$ omnimind architect --watch",
    "› Listening for stack changes…",
    status ? `› ${status}` : "› Awaiting codegen…",
  ];

  const lines = [...defaultLogs, ...logs];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#08090c] font-mono text-[10px]">
      <header className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#0c0d10] px-2.5 py-1.5">
        <Terminal className="h-3.5 w-3.5 text-emerald-500/80" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Code Bot</span>
        {loading ? (
          <span className="ml-auto text-[8px] text-cyan-400/80 animate-pulse">executing…</span>
        ) : null}
      </header>

      <div className="history-scroll-hover min-h-0 flex-1 overflow-y-auto p-2.5 leading-relaxed text-zinc-500">
        {lines.map((line, i) => (
          <p key={i} className={cn(line.startsWith("›") ? "text-emerald-400/70" : "text-zinc-600")}>
            {line}
          </p>
        ))}
        {files.length > 0 ? (
          <div className="mt-3 border-t border-white/[0.04] pt-2">
            <p className="mb-1 text-[9px] text-cyan-400/80">// generated ({files.length} files)</p>
            {files.slice(0, 12).map((f) => (
              <p key={f.path} className="truncate text-zinc-600">
                <span className="text-emerald-600/60">write</span> {f.path}
              </p>
            ))}
            {files[0]?.content ? (
              <pre className="mt-2 max-h-32 overflow-auto rounded border border-white/[0.04] bg-black/40 p-2 text-[9px] text-zinc-500">
                {files[0].content.slice(0, 480)}
                {files[0].content.length > 480 ? "\n…" : ""}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
