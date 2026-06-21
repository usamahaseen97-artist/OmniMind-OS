"use client";

import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const SNIPPETS = [
  "import { AgentRuntime } from '@omnimind/core'",
  "const deploy = await runtime.compile({ target: 'edge' })",
  "export async function POST(req: Request) {",
  "  const stream = await sovereign.stream(req.body)",
  "  return new Response(stream, { headers: SSE_HEADERS })",
  "}",
  "// MongoDB sync: conversations.append(turn)",
  "await vectorMemory.embed(assistantChunk)",
  "logger.info('sandbox build ✓', { ms: deploy.latency })",
];

export function DeckIdeMock() {
  const [lines, setLines] = useState<string[]>(SNIPPETS.slice(0, 5));
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLines((prev) => {
        const next = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
        return [...prev.slice(-6), next];
      });
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setCursor((c) => !c), 530);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3">
      <div className="mb-2 flex items-center gap-2 border-b border-emerald-500/15 pb-2">
        <span className="rounded bg-[#10B981]/20 px-2 py-0.5 text-[9px] font-bold uppercase text-[#00FF87]">
          Terminal
        </span>
        <span className="text-[10px] text-zinc-600">omnimind — build sandbox</span>
      </div>
      <pre
        className={cn(
          "history-scroll-hover min-h-0 flex-1 overflow-y-auto rounded-lg border border-emerald-500/20",
          "bg-[#0a0f0c] p-3 font-mono text-[10px] leading-relaxed text-emerald-300/90",
          "shadow-[inset_0_0_24px_rgba(16,185,129,0.06)]",
        )}
      >
        {lines.map((line, i) => (
          <div key={`${i}-${line.slice(0, 12)}`} className="animate-fade-in">
            <span className="text-zinc-600 select-none">{String(i + 1).padStart(2, "0")} </span>
            {line}
          </div>
        ))}
        <span className={cn("text-[#00FF87]", cursor ? "opacity-100" : "opacity-0")}>▌</span>
      </pre>
    </div>
  );
}
