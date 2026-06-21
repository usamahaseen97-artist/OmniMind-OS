"use client";

import { useEffect, useRef } from "react";
import type { SpatialModule } from "./spatial-engine-api";
import { spatialWsUrl } from "./spatial-engine-api";
import {
  setSpatialConfigText,
  setSpatialSessionId,
  useSpatialSessionId,
} from "./spatial-render-store";

type SyncPayload = {
  config_text: string;
  structure_tree: unknown[];
  asset_id?: string;
  position?: { x: number; y: number; z: number };
};

/** Persistent WebSocket — drag events recalculate structure tree + monospace config. */
export function useSpatialCanvasSync(module: SpatialModule, enabled: boolean) {
  const sessionId = useSpatialSessionId();
  const sessionRef = useRef(sessionId);
  sessionRef.current = sessionId;
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const url = spatialWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          module,
          session_id: sessionRef.current || undefined,
        }),
      );
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(String(ev.data)) as {
          type: string;
          session_id?: string;
          payload?: SyncPayload;
        };
        if (msg.type === "joined" && msg.session_id) {
          setSpatialSessionId(msg.session_id);
        }
        if (msg.type === "sync" && msg.payload?.config_text) {
          setSpatialConfigText(msg.payload.config_text);
          window.dispatchEvent(
            new CustomEvent("omnimind:spatial-config", { detail: msg.payload }),
          );
        }
        if (msg.type === "directive" || msg.type === "render_mode") {
          const payload = (msg as { payload?: { config_text?: string; session_id?: string } }).payload;
          if (payload?.session_id) setSpatialSessionId(payload.session_id);
          if (payload?.config_text) setSpatialConfigText(payload.config_text);
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, module]);

  const publishDrag = (assetId: string, x: number, z: number, y = 0.4) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        type: "drag",
        asset_id: assetId,
        x,
        y,
        z,
      }),
    );
  };

  return { publishDrag };
}
