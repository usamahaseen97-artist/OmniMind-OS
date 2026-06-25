"use client";

import { useEffect, useState } from "react";
import { DSReasoningTimeline, DSThinkingIndicator } from "../../design-system/ai";
import { DSGlassCard } from "../../design-system/components/Card";
import { useOmniMindBrainOptional } from "../../lib/omnimind-brain-context";
import type { Brain2LiveState, Brain2PerformanceMetrics } from "../../core/brain/v2";

/** Brain 2.0 live thinking panel — optional for advanced users. */
export function Brain2LiveThinkingPanel() {
  const brain = useOmniMindBrainOptional();
  const [live, setLive] = useState<Brain2LiveState | null>(null);
  const [metrics, setMetrics] = useState<Brain2PerformanceMetrics | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!brain) return;
    setEnabled(brain.brain.brain2.isLiveThinkingEnabled());
    const unsub = brain.brain.brain2.subscribe(setLive);
    setMetrics(brain.brain.brain2.getMetrics());
    const onMetrics = (e: Event) => setMetrics((e as CustomEvent<Brain2PerformanceMetrics>).detail);
    window.addEventListener("omnimind:brain2-metrics", onMetrics);
    return () => {
      unsub();
      window.removeEventListener("omnimind:brain2-metrics", onMetrics);
    };
  }, [brain]);

  if (!brain || !enabled) return null;
  if (!live && !brain.thinking) return null;

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    brain.brain.brain2.setLiveThinkingEnabled(next);
  };

  return (
    <DSGlassCard className="fixed bottom-24 left-3 z-[175] w-80 shadow-2xl">
      <header className="mb-2 flex items-center justify-between border-b border-[color:var(--omni-ds-border-subtle)] pb-2">
        <DSThinkingIndicator label="Brain 2.0 · Live Thinking" />
        <button type="button" onClick={toggle} className="text-[8px] text-[color:var(--omni-ds-text-muted)] hover:text-[color:var(--omni-ds-text-primary)]">
          Hide
        </button>
      </header>
      <div className="max-h-72 space-y-2 overflow-y-auto text-[9px]">
        <Row label="Intent" value={live?.intent ?? "—"} />
        <Row label="Tool" value={live?.toolRoute ? `${live.toolRoute.toolId} (${Math.round(live.toolRoute.confidence * 100)}%)` : "—"} />
        <Row label="Agents" value={live?.selectedAgents.slice(0, 4).join(", ") || "—"} />
        <Row label="Provider" value={`${live?.provider ?? "primary"} · failover ${live?.failoverCount ?? 0}`} />
        <Row label="Tokens" value={String(live?.tokenUsage ?? 0)} />

        <div>
          <p className="mb-1 font-semibold uppercase text-[color:var(--omni-ds-text-muted)]">Reasoning</p>
          <DSReasoningTimeline
            stages={(live?.reasoningStages ?? []).map((s) => ({
              id: s.id,
              label: s.label,
              status: s.status,
            }))}
          />
        </div>

        {live?.collaboration.length ? (
          <div>
            <p className="mb-1 font-semibold uppercase text-zinc-500">Collaboration</p>
            {live.collaboration.slice(0, 3).map((c: { id: string; from: string; to: string }) => (
              <p key={c.id} className="text-zinc-600">
                {c.from} → {c.to}
              </p>
            ))}
          </div>
        ) : null}

        {metrics ? (
          <div className="rounded border border-white/10 p-2 text-zinc-600">
            <p>Accuracy {metrics.accuracy}% · Learning {metrics.learningScore}</p>
            <p>Latency {metrics.latencyMs}ms · Recovery {metrics.recovery}%</p>
          </div>
        ) : null}
      </div>
    </DSGlassCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 shrink-0 text-zinc-500">{label}</span>
      <span className="truncate text-zinc-300">{value}</span>
    </div>
  );
}
