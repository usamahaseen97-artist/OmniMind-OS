/**
 * Fire-and-forget Kafka bridge via backend streaming API (non-blocking UI).
 */

import { resolveBackendUrl } from "./backend-url";

export async function publishStreamingEvent(
  userId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const base = await resolveBackendUrl();
    await fetch(`${base}/api/v1/gateway/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        event_type: eventType,
        payload,
      }),
    });
  } catch {
    /* silent — simulated broker on backend */
  }
}
