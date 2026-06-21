/** Minimal SSE frame parser for authenticated fetch streams. */

export type SseHandler = (data: Record<string, unknown>) => void;

export async function consumeSseStream(
  res: Response,
  onEvent: SseHandler,
  signal?: AbortSignal,
): Promise<void> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `SSE request failed (${res.status})`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("Response body is not readable");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    if (signal?.aborted) {
      await reader.cancel();
      return;
    }
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part
        .split("\n")
        .find((l) => l.startsWith("data:"));
      if (!line) continue;
      const raw = line.slice(5).trim();
      if (!raw) continue;
      try {
        onEvent(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        onEvent({ type: "raw", token: raw });
      }
    }
  }
}
