"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DevTrioSlug } from "./dev-trio";
import {
  parseTerminalWsMessage,
  terminalWsUrl,
  type TerminalWsStatus,
} from "./dev-terminal-ws";
type Handlers = {
  appendTerminal: (line: string) => void;
  clearTerminal: () => void;
};

/** Live WebSocket bridge — dev trio bottom terminal ↔ /api/terminal/ws */
export function useDevTerminalWs(
  toolSlug: DevTrioSlug | null,
  handlers: Handlers,
  enabled: boolean,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<TerminalWsStatus>("disconnected");

  useEffect(() => {
    if (!enabled || !toolSlug) return;

    let cancelled = false;
    let retryTimer: number | undefined;
    let attempts = 0;

    const connect = () => {
      if (cancelled) return;
      setStatus("connecting");
      const ws = new WebSocket(terminalWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) {
          ws.close();
          return;
        }
        attempts = 0;
        setConnected(true);
        setStatus("idle");
      };

      ws.onmessage = (ev) => {
        const msg = parseTerminalWsMessage(String(ev.data));
        if (!msg) return;

        if (msg.type === "log") {
          handlersRef.current.appendTerminal(msg.line);
          return;
        }
        if (msg.type === "clear") {
          handlersRef.current.clearTerminal();
          return;
        }
        if (msg.type === "status") {
          setStatus(msg.status);
        }
      };

      const scheduleRetry = () => {
        if (cancelled) return;
        setConnected(false);
        setStatus("disconnected");
        wsRef.current = null;
        attempts += 1;
        if (attempts <= 5) {
          retryTimer = window.setTimeout(connect, Math.min(8000, 600 * attempts));
        }
      };

      ws.onclose = scheduleRetry;
      ws.onerror = scheduleRetry;
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, toolSlug]);

  const sendCommand = useCallback(
    (command: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !toolSlug) return false;
      ws.send(JSON.stringify({ command, context: toolSlug }));
      return true;
    },
    [toolSlug],
  );

  return { sendCommand, connected, status };
}
