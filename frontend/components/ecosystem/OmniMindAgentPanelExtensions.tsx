"use client";

import { Loader2, Undo2 } from "lucide-react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { SWARM_AGENTS } from "../../lib/omnimind-ecosystem-registry";

type Props = {
  onRestorePrompt?: (text: string) => void;
};

/** Agent swarm, tech stack memory, progress, suggestions — injected into agent panel. */
export function OmniMindAgentPanelExtensions({ onRestorePrompt }: Props) {
  const {
    techStack,
    activeAgent,
    setActiveAgent,
    progressTasks,
    promptHistory,
    undoLastPrompt,
    aiSuggestions,
  } = useOmniMindEcosystem();

  const stackLine = [
    ...techStack.frontend,
    ...techStack.backend,
    ...techStack.database,
    ...techStack.styling,
    ...techStack.auth,
  ].join(" · ");

  return (
    <div className="shrink-0 space-y-2 border-b border-white/[0.06] px-2 py-2">
      <div className="rounded-md border border-white/[0.06] bg-black/20 px-2 py-1.5">
        <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Context Memory</p>
        <p className="mt-0.5 text-[8px] leading-relaxed text-cyan-300/80">{stackLine || "React · FastAPI · PostgreSQL"}</p>
      </div>

      <div className="flex flex-wrap gap-0.5">
        {SWARM_AGENTS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setActiveAgent(a.id)}
            className={`rounded-full px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide transition ${
              activeAgent === a.id ? "ring-1 ring-cyan-400/40" : "opacity-60 hover:opacity-100"
            }`}
            style={{ color: a.color, background: `${a.color}15` }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {progressTasks.length ? (
        <div className="space-y-1">
          {progressTasks.map((t) => (
            <div key={t.id}>
              <div className="flex items-center justify-between text-[8px] text-zinc-500">
                <span className="flex items-center gap-1">
                  {t.status === "running" ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : null}
                  {t.label}
                </span>
                <span>{t.progress}%</span>
              </div>
              <div className="h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full bg-cyan-500/60 transition-all" style={{ width: `${t.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {aiSuggestions[0] ? (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-[8px] leading-relaxed text-amber-200/90">
          {aiSuggestions[0].text}
        </div>
      ) : null}

      {promptHistory.length ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const last = undoLastPrompt();
              if (last && onRestorePrompt) onRestorePrompt(last.text);
            }}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] text-zinc-500 hover:text-cyan-300"
          >
            <Undo2 className="h-3 w-3" />
            Restore prompt
          </button>
          <span className="truncate text-[8px] text-zinc-600">{promptHistory[0]?.text.slice(0, 40)}…</span>
        </div>
      ) : null}
    </div>
  );
}
