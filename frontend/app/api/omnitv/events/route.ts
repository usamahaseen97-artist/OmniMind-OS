import {
  getOmniTVBusStatus,
  subscribeOmniTVEvents,
  type OmniTVEvent,
} from "../../../../lib/server/omnitv-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream of OmniTV telemetry events.
 * Works the same whether the bus runs in-memory or on Apache Kafka.
 */
export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: unknown, event?: string) => {
        const prefix = event ? `event: ${event}\n` : "";
        controller.enqueue(encoder.encode(`${prefix}data: ${JSON.stringify(payload)}\n\n`));
      };

      // Initial snapshot: backend mode + current play tallies.
      send(getOmniTVBusStatus(), "status");

      const listener = (omnitvEvent: OmniTVEvent) => send(omnitvEvent, omnitvEvent.type);
      const unsubscribe = subscribeOmniTVEvents(listener);

      // Heartbeat so proxies don't drop the idle connection.
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 20_000);

      const close = () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
