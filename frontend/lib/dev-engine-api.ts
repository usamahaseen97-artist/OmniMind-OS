import { getBackendUrl } from "./backend-url";

export type DevExecutePayload = {
  tool_type: string;
  user_prompt: string;
  active_file?: string;
};

export type DevFileWritten = {
  path: string;
  content: string;
  tool_type: string;
};

export type DevHotReload = {
  path: string;
  tool_type: string;
  modified: number;
  preview: string;
};

export type DevExecuteHandlers = {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onMeta?: (meta: Record<string, unknown>) => void;
  onFileWritten?: (file: DevFileWritten) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
};

function parseSseLine(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function consumeDevSse(buffer: string, handlers: DevExecuteHandlers): string {
  const parts = buffer.split("\n");
  const remainder = parts.pop() ?? "";
  for (const line of parts) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const raw = trimmed.startsWith("data: ")
      ? trimmed.slice(6).trim()
      : trimmed.slice(5).trim();
    if (!raw) continue;
    const data = parseSseLine(raw);
    if (!data) continue;
    if (typeof data.token === "string") handlers.onToken?.(data.token);
    if (data.meta && typeof data.meta === "object") {
      handlers.onMeta?.(data.meta as Record<string, unknown>);
    }
    if (data.file_written && typeof data.file_written === "object") {
      handlers.onFileWritten?.(data.file_written as DevFileWritten);
    }
    if (data.hot_reload && typeof data.hot_reload === "object") {
      window.dispatchEvent(
        new CustomEvent("omnimind:hot-reload", { detail: data.hot_reload }),
      );
    }
    if (data.error) handlers.onError?.(String(data.error));
    if (data.done) handlers.onDone?.();
  }
  return remainder;
}

export async function initDevWorkspace(toolType: string): Promise<{
  tool_type: string;
  root: string;
  created: string[];
  files: { path: string; size: number; modified: number }[];
}> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/dev/init-workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool_type: toolType }),
  });
  if (!res.ok) throw new Error(`init-workspace failed (${res.status})`);
  return res.json();
}

export async function streamExecuteDevPrompt(
  payload: DevExecutePayload,
  handlers: DevExecuteHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const base = getBackendUrl();
  handlers.onStart?.();
  const res = await fetch(`${base}/api/dev/execute-prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      tool_type: payload.tool_type,
      user_prompt: payload.user_prompt,
      active_file: payload.active_file ?? "",
    }),
    signal,
    cache: "no-store",
  });
  if (!res.ok || !res.body) {
    handlers.onError?.(`execute-prompt failed (${res.status})`);
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = consumeDevSse(buffer, handlers);
  }
  buffer += decoder.decode();
  if (buffer.trim()) consumeDevSse(`${buffer}\n`, handlers);
}

export function connectDevWatchBuild(
  toolType: string,
  onHotReload?: (payload: DevHotReload) => void,
): () => void {
  const base = getBackendUrl();
  const controller = new AbortController();
  let closed = false;

  void (async () => {
    try {
      const res = await fetch(
        `${base}/api/dev/watch-build?tool_type=${encodeURIComponent(toolType)}`,
        {
          headers: { Accept: "text/event-stream" },
          signal: controller.signal,
          cache: "no-store",
        },
      );
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";
        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const raw = trimmed.startsWith("data: ")
            ? trimmed.slice(6).trim()
            : trimmed.slice(5).trim();
          const data = parseSseLine(raw);
          if (!data?.hot_reload) continue;
          const payload = data.hot_reload as DevHotReload;
          onHotReload?.(payload);
          window.dispatchEvent(
            new CustomEvent("omnimind:hot-reload", { detail: payload }),
          );
        }
      }
    } catch {
      /* watch reconnects on remount */
    }
  })();

  return () => {
    closed = true;
    controller.abort();
  };
}

export async function saveDevProject(
  toolType: string,
  label = "",
): Promise<{ ok: boolean; file_count: number; manifest: string }> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/dev/save-project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool_type: toolType, label }),
  });
  if (!res.ok) throw new Error(`save-project failed (${res.status})`);
  return res.json();
}

export async function fetchDevDiagnostics(toolType: string): Promise<{
  terminal_lines: string[];
  syntax_issues: string[];
  ports: Record<string, number>;
  file_count: number;
}> {
  const base = getBackendUrl();
  const res = await fetch(
    `${base}/api/dev/diagnostics?tool_type=${encodeURIComponent(toolType)}`,
  );
  if (!res.ok) throw new Error(`diagnostics failed (${res.status})`);
  return res.json();
}
