/**
 * OmniTV event-streaming layer.
 *
 * IMPORTANT: This does NOT carry video. Video stays on YouTube embeds / public
 * HLS. This bus only moves lightweight JSON *events* (telemetry): which channel
 * is playing, channel health from the live resolver, embed failures, etc.
 *
 * Backends:
 *   - "memory" (default): in-process EventEmitter. Zero infra. Per-instance only.
 *   - "kafka": real Apache Kafka via `kafkajs`. Enabled when OMNITV_KAFKA_BROKERS
 *     is set AND the `kafkajs` package is installed. A single shared consumer
 *     re-broadcasts Kafka messages to local subscribers (e.g. SSE connections).
 */
import { EventEmitter } from "node:events";

export type OmniTVEvent =
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
      resolver: "yt-channel-info" | "scrape" | "fallback";
      videoId: string | null;
      at: number;
    }
  | { type: "embed.failed"; channelId: string; reason: string; at: number };

export type OmniTVEventListener = (event: OmniTVEvent) => void;

export type OmniTVBusBackend = "memory" | "kafka";

const TOPIC = process.env.OMNITV_KAFKA_TOPIC || "omnitv.events";
const CLIENT_ID = process.env.OMNITV_KAFKA_CLIENT_ID || "omnitv-app";
const GROUP_ID = process.env.OMNITV_KAFKA_GROUP_ID || `omnitv-app-${process.pid}`;
const BROKERS = (process.env.OMNITV_KAFKA_BROKERS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

type BusState = {
  emitter: EventEmitter;
  backend: OmniTVBusBackend;
  // running tally of play events per channel (in-process snapshot)
  playCounts: Map<string, number>;
  kafka: {
    ready: Promise<void> | null;
    producer: { send: (args: unknown) => Promise<unknown> } | null;
    healthy: boolean;
    error?: string;
  };
};

// Persist across HMR / route reloads in dev.
const state: BusState = ((
  globalThis as typeof globalThis & { __omnitvEventBus?: BusState }
).__omnitvEventBus ??= {
  emitter: (() => {
    const e = new EventEmitter();
    e.setMaxListeners(0);
    return e;
  })(),
  backend: BROKERS.length > 0 ? "kafka" : "memory",
  playCounts: new Map<string, number>(),
  kafka: { ready: null, producer: null, healthy: false },
});

const EVENT_NAME = "omnitv-event";

function recordMetrics(event: OmniTVEvent): void {
  if (event.type === "channel.play") {
    state.playCounts.set(event.channelId, (state.playCounts.get(event.channelId) ?? 0) + 1);
  }
}

/** Deliver an event to in-process subscribers (SSE, metrics, etc.). */
function deliverLocally(event: OmniTVEvent): void {
  recordMetrics(event);
  state.emitter.emit(EVENT_NAME, event);
}

/**
 * Lazily connect to Kafka. Uses a non-literal import specifier so the build does
 * not hard-depend on `kafkajs` when running in memory mode.
 */
async function ensureKafka(): Promise<void> {
  if (state.kafka.ready) return state.kafka.ready;

  state.kafka.ready = (async () => {
    try {
      const pkg = "kafkajs";
      const mod = (await import(pkg)) as {
        Kafka: new (config: { clientId: string; brokers: string[] }) => {
          producer: () => {
            connect: () => Promise<void>;
            send: (args: unknown) => Promise<unknown>;
          };
          consumer: (config: { groupId: string }) => {
            connect: () => Promise<void>;
            subscribe: (args: { topic: string; fromBeginning: boolean }) => Promise<void>;
            run: (args: {
              eachMessage: (payload: {
                message: { value: Buffer | null };
              }) => Promise<void>;
            }) => Promise<void>;
          };
        };
      };

      const kafka = new mod.Kafka({ clientId: CLIENT_ID, brokers: BROKERS });

      const producer = kafka.producer();
      await producer.connect();
      state.kafka.producer = producer;

      // One shared consumer re-broadcasts Kafka messages to local subscribers.
      const consumer = kafka.consumer({ groupId: GROUP_ID });
      await consumer.connect();
      await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
      await consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;
          try {
            const event = JSON.parse(message.value.toString()) as OmniTVEvent;
            deliverLocally(event);
          } catch {
            /* skip malformed event */
          }
        },
      });

      state.kafka.healthy = true;
    } catch (error) {
      state.kafka.healthy = false;
      state.kafka.error = error instanceof Error ? error.message : "Kafka init failed";
      // Fall back to memory-only delivery so the app keeps working.
      state.backend = "memory";
    }
  })();

  return state.kafka.ready;
}

/** Publish an OmniTV telemetry event. */
export async function publishOmniTVEvent(event: OmniTVEvent): Promise<void> {
  if (state.backend === "kafka") {
    await ensureKafka();
    if (state.kafka.healthy && state.kafka.producer) {
      try {
        await state.kafka.producer.send({
          topic: TOPIC,
          messages: [{ key: "channelId" in event ? event.channelId : undefined, value: JSON.stringify(event) }],
        });
        // The shared consumer will deliver it locally; avoid double-delivery here.
        return;
      } catch {
        // Kafka send failed — degrade to local delivery below.
      }
    }
  }

  deliverLocally(event);
}

/** Subscribe to OmniTV events (used by the SSE route). Returns an unsubscribe fn. */
export function subscribeOmniTVEvents(listener: OmniTVEventListener): () => void {
  // In Kafka mode, make sure the shared consumer is running.
  if (state.backend === "kafka") void ensureKafka();
  state.emitter.on(EVENT_NAME, listener);
  return () => state.emitter.off(EVENT_NAME, listener);
}

export function getOmniTVBusStatus(): {
  backend: OmniTVBusBackend;
  brokers: string[];
  topic: string;
  kafkaHealthy: boolean;
  kafkaError?: string;
  playCounts: Record<string, number>;
} {
  return {
    backend: state.backend,
    brokers: BROKERS,
    topic: TOPIC,
    kafkaHealthy: state.kafka.healthy,
    kafkaError: state.kafka.error,
    playCounts: Object.fromEntries(state.playCounts),
  };
}
