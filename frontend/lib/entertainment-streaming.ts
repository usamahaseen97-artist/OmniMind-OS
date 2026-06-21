import { getBackendUrl } from "./backend-url";

export type StreamingStatus = {
  kafka?: { connected?: boolean };
  spark?: { connected?: boolean; workers_alive?: number; ui_url?: string };
  kafka_docker?: { running?: boolean };
  spark_docker?: { running?: boolean };
  hint?: string;
};

export async function fetchEntertainmentStreamingStatus(
  signal?: AbortSignal,
): Promise<StreamingStatus | null> {
  try {
    const base = getBackendUrl();
    const res = await fetch(`${base}/api/v1/entertainment/streaming/status`, {
      signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as StreamingStatus;
  } catch {
    return null;
  }
}

/** Fire-and-forget play/search telemetry → Kafka topic omnimind.entertainment */
export function reportEntertainmentTelemetry(
  module: string,
  action: string,
  payload: Record<string, unknown> = {},
  userId = "anonymous",
): void {
  void (async () => {
    try {
      const base = getBackendUrl();
      await fetch(`${base}/api/v1/entertainment/telemetry/fire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, action, user_id: userId, payload }),
        keepalive: true,
      });
    } catch {
      /* optional infra */
    }
  })();
}
