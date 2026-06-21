"use client";

import { Activity, Radio, Server, Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

type OmniTVStreamEvent =
  | { type: "channel.play"; channelId: string; channelName?: string; at: number }
  | {
      type: "channel.switch";
      fromChannelId?: string;
      channelId: string;
      channelName?: string;
      at: number;
    }
  | {
      type: "channel.health";
      channelId: string;
      channelName?: string;
      status: "live" | "offline" | "fallback" | "error";
      resolver: string;
      videoId: string | null;
      at: number;
    }
  | { type: "embed.failed"; channelId: string; reason: string; at: number };

type BusStatus = {
  backend: "memory" | "kafka";
  topic: string;
  kafkaHealthy: boolean;
  playCounts: Record<string, number>;
};

const EVENT_NAMES = [
  "channel.play",
  "channel.switch",
  "channel.health",
  "embed.failed",
] as const;

/** Fire-and-forget publish of a client OmniTV event (telemetry, not video). */
export function publishOmniTVClientEvent(
  event:
    | { type: "channel.play"; channelId: string; channelName?: string }
    | { type: "channel.switch"; fromChannelId?: string; channelId: string; channelName?: string }
    | { type: "embed.failed"; channelId: string; reason: string },
): void {
  try {
    void fetch("/api/omnitv/events/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    /* telemetry is best-effort */
  }
}

function statusTone(status: OmniTVStreamEvent["type"], health?: string) {
  if (status === "embed.failed") return "text-red-300";
  if (status === "channel.health") {
    if (health === "live") return "text-emerald-300";
    if (health === "fallback") return "text-amber-300";
    if (health === "error") return "text-red-300";
    return "text-zinc-400";
  }
  return "text-sky-300";
}

function describe(event: OmniTVStreamEvent): string {
  const name = "channelName" in event && event.channelName ? event.channelName : event.channelId;
  switch (event.type) {
    case "channel.play":
      return `Playing ${name}`;
    case "channel.switch":
      return `Switched to ${name}`;
    case "channel.health":
      return `${name} · ${event.status} (${event.resolver})`;
    case "embed.failed":
      return `${name} embed failed`;
  }
}

export function OmniTVLiveEvents() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<BusStatus | null>(null);
  const [events, setEvents] = useState<OmniTVStreamEvent[]>([]);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource("/api/omnitv/events");
    sourceRef.current = source;

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.addEventListener("status", (e) => {
      try {
        setStatus(JSON.parse((e as MessageEvent).data) as BusStatus);
        setConnected(true);
      } catch {
        /* ignore */
      }
    });

    const onEvent = (e: Event) => {
      try {
        const parsed = JSON.parse((e as MessageEvent).data) as OmniTVStreamEvent;
        setEvents((prev) => [parsed, ...prev].slice(0, 12));
      } catch {
        /* ignore */
      }
    };
    EVENT_NAMES.forEach((name) => source.addEventListener(name, onEvent));

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, []);

  const backend = status?.backend ?? "memory";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#00FF87]" />
          <h2 className="text-sm font-bold text-zinc-100">Live activity</h2>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            event stream
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em]">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1",
              backend === "kafka"
                ? "border-orange-500/40 bg-orange-500/10 text-orange-300"
                : "border-zinc-700 bg-black/30 text-zinc-400",
            )}
            title={status?.topic ? `topic: ${status.topic}` : undefined}
          >
            <Server className="h-3 w-3" />
            {backend === "kafka" ? "Apache Kafka" : "In-memory bus"}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              connected ? "text-emerald-300" : "text-zinc-500",
            )}
          >
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? "live" : "offline"}
          </span>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {events.length === 0 ? (
          <li className="flex items-center gap-2 py-3 text-xs text-zinc-600">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Waiting for events… play a channel to see telemetry flow.
          </li>
        ) : (
          events.map((event, index) => (
            <li
              key={`${event.type}-${event.at}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-900 bg-black/30 px-3 py-1.5 text-xs"
            >
              <span className={cn("truncate", statusTone(event.type, (event as { status?: string }).status))}>
                {describe(event)}
              </span>
              <span className="shrink-0 text-[10px] text-zinc-600">
                {new Date(event.at).toLocaleTimeString()}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
