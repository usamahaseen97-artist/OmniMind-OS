"use client";

import { useState } from "react";
import { ListTodo, Pause, Play, RotateCcw, X } from "lucide-react";
import { useOmniMindBrainOptional } from "../../lib/omnimind-brain-context";
import { cn } from "../../lib/utils";

/** Global action queue — visible across all tools. */
export function BrainActionCenter() {
  const brain = useOmniMindBrainOptional();
  const [open, setOpen] = useState(false);

  if (!brain) return null;

  const { actions, pauseAction, cancelAction, retryAction, thinking } = brain;
  const active = actions.filter((a) => a.status === "running" || a.status === "queued").length;

  return (
    <div className="fixed bottom-8 right-3 z-[180] flex flex-col items-end gap-2">
      {open ? (
        <div className="w-72 rounded-xl border border-white/10 bg-[#12141c]/98 shadow-2xl backdrop-blur-md">
          <header className="flex items-center justify-between border-b border-white/8 px-3 py-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">Action Center</span>
            <button type="button" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300">
              <X className="h-3.5 w-3.5" />
            </button>
          </header>
          <div className="max-h-64 overflow-y-auto p-2">
            {!actions.length ? (
              <p className="p-2 text-[10px] text-zinc-500">No background tasks.</p>
            ) : (
              <ul className="space-y-1">
                {actions.map((a) => (
                  <li key={a.id} className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[10px] text-zinc-200">{a.label}</span>
                      <span className={cn("text-[7px] uppercase", statusColor(a.status))}>{a.status}</span>
                    </div>
                    <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full bg-cyan-500/60" style={{ width: `${a.progress}%` }} />
                    </div>
                    <div className="mt-1 flex gap-1">
                      {a.status === "running" ? (
                        <IconBtn icon={Pause} label="Pause" onClick={() => pauseAction(a.id)} />
                      ) : null}
                      {a.status === "failed" ? (
                        <IconBtn icon={RotateCcw} label="Retry" onClick={() => retryAction(a.id)} />
                      ) : null}
                      {a.status !== "completed" ? (
                        <IconBtn icon={X} label="Cancel" onClick={() => cancelAction(a.id)} />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wide shadow-lg transition",
          thinking || active
            ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-200"
            : "border-white/10 bg-[#12141c]/95 text-zinc-400 hover:text-zinc-200",
        )}
      >
        <ListTodo className="h-3.5 w-3.5" />
        Actions{active ? ` (${active})` : ""}
        {thinking ? <Play className="h-3 w-3 animate-pulse" /> : null}
      </button>
    </div>
  );
}

function IconBtn({ icon: Icon, label, onClick }: { icon: typeof Pause; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[7px] text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
    >
      <Icon className="h-2.5 w-2.5" /> {label}
    </button>
  );
}

function statusColor(status: string) {
  if (status === "running") return "text-cyan-400";
  if (status === "completed") return "text-emerald-400";
  if (status === "failed") return "text-red-400";
  if (status === "paused") return "text-amber-400";
  return "text-zinc-500";
}
