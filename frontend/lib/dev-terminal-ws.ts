import { OMNIFORGE_TERMINAL_WS } from "./omniforge-api";

export type TerminalWsStatus = "idle" | "running" | "connecting" | "disconnected";

export type TerminalWsMessage =
  | { type: "log"; line: string }
  | { type: "clear" }
  | { type: "status"; status: "idle" | "running" };

export function terminalWsUrl(): string {
  return OMNIFORGE_TERMINAL_WS;
}

/** Route a shell directive from chat or IDE into the live terminal WS bridge */
export function dispatchTerminalCommand(command: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("omnimind:terminal-command", { detail: { command } }),
  );
}

export function parseTerminalWsMessage(raw: string): TerminalWsMessage | null {
  try {
    const msg = JSON.parse(raw) as Record<string, unknown>;
    const type = String(msg.type ?? "");
    if (type === "terminal-log" && msg.text) {
      return { type: "log", line: String(msg.text) };
    }
    if (type === "log" && msg.line) return { type: "log", line: String(msg.line) };
    if (type === "clear") return { type: "clear" };
    if (type === "status" && (msg.status === "idle" || msg.status === "running")) {
      return { type: "status", status: msg.status };
    }
    return null;
  } catch {
    return null;
  }
}
