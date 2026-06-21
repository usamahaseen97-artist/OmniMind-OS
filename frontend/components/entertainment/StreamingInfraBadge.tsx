"use client";

import { Activity, Database } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchEntertainmentStreamingStatus,
  type StreamingStatus,
} from "../../lib/entertainment-streaming";
import { cn } from "../../lib/utils";

function Dot({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
        on ? "bg-[#00FF87] shadow-[0_0_6px_#10B981]" : "bg-zinc-600",
      )}
      aria-hidden
    />
  );
}

function Pill({
  label,
  on,
  icon: Icon,
  title,
}: {
  label: string;
  on: boolean;
  icon: typeof Database;
  title: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-medium tabular-nums",
        on
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300/90"
          : "border-gray-800/60 bg-black/20 text-zinc-500",
      )}
    >
      <Icon className="h-2.5 w-2.5 shrink-0 opacity-80" />
      <Dot on={on} />
      {label}
    </span>
  );
}

export function StreamingInfraBadge() {
  const [status, setStatus] = useState<StreamingStatus | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const poll = () => {
      void fetchEntertainmentStreamingStatus(ctrl.signal).then((s) => {
        if (s) {
          setStatus(s);
          setVisible(true);
        }
      });
    };
    poll();
    const timer = window.setInterval(poll, 45_000);
    return () => {
      ctrl.abort();
      window.clearInterval(timer);
    };
  }, []);

  if (!visible || !status) return null;

  const kafkaOn = Boolean(status.kafka?.connected);
  const sparkOn = Boolean(status.spark?.connected);
  const kafkaDocker = Boolean(status.kafka_docker?.running);
  const sparkDocker = Boolean(status.spark_docker?.running);
  const live = kafkaOn || sparkOn;

  const hint =
    live
      ? "Play & search events stream to Kafka; Spark aggregates trends."
      : kafkaDocker || sparkDocker
        ? "Containers running — open /api/streaming/kafka/health to connect."
        : "Optional: docker compose up -d kafka spark-master spark-worker";

  return (
    <div
      className="flex h-7 max-h-7 shrink-0 flex-wrap items-center justify-between gap-1 border-b border-gray-800/50 bg-[#0B0C10]/80 px-2 py-0.5 backdrop-blur-sm"
      role="status"
      aria-label="Streaming infrastructure status"
    >
      <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
        Analytics bus
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill
          label="Kafka"
          on={kafkaOn}
          icon={Database}
          title={
            kafkaOn
              ? "Kafka connected · movie-events / music-events / tv-events"
              : hint
          }
        />
        <Pill
          label="Spark"
          on={sparkOn}
          icon={Activity}
          title={
            sparkOn
              ? `Spark online${status.spark?.workers_alive != null ? ` · ${status.spark.workers_alive} workers` : ""}`
              : hint
          }
        />
        {!live ? (
          <span className="hidden text-[9px] text-zinc-600 sm:inline" title={hint}>
            events saved locally
          </span>
        ) : null}
      </div>
    </div>
  );
}
