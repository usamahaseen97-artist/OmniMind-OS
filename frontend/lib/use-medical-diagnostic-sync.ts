"use client";

import { useEffect, useRef } from "react";
import {
  applyMedicalAnalysis,
  setMedicalSessionId,
  useMedicalDiagnosticStore,
} from "./medical-diagnostic-store";
import { medicalDiagnosticWsUrl } from "./medical-diagnostic-api";

/** WebSocket sync for manual slider tweaks → live canvas filter updates */
export function useMedicalDiagnosticSync(enabled = true) {
  const { sessionId, settings } = useMedicalDiagnosticStore();
  const wsRef = useRef<WebSocket | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (!enabled) return;
    const ws = new WebSocket(medicalDiagnosticWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          session_id: sessionId || undefined,
        }),
      );
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as {
          type: string;
          session_id?: string;
          payload?: Record<string, unknown>;
          anomalies_detected?: unknown[];
          filter_state?: { brightness?: number };
        };
        if (msg.type === "joined" && msg.session_id) {
          setMedicalSessionId(msg.session_id);
          return;
        }
        if (msg.type === "settings_sync") {
          applyMedicalAnalysis({
            session_id: msg.session_id,
            anomalies_detected: msg.anomalies_detected as never,
            filter_state: msg.filter_state,
          });
          window.dispatchEvent(new CustomEvent("omnimind:medical-canvas-resize"));
          return;
        }
        if (msg.type === "analysis" && msg.payload) {
          const p = msg.payload;
          applyMedicalAnalysis({
            session_id: String(p.session_id ?? ""),
            anomalies_detected: p.anomalies_detected as never,
            volumetric_3d_mesh_url: String(p.volumetric_3d_mesh_url ?? ""),
            clinical_summary_draft: String(p.clinical_summary_draft ?? ""),
            frame_index: Number(p.frame_index ?? 0),
            filter_state: p.filter_state as { brightness?: number },
          });
          window.dispatchEvent(new CustomEvent("omnimind:medical-canvas-resize"));
        }
      } catch {
        /* ignore malformed */
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, sessionId]);

  const pushSettings = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        type: "settings",
        manual_settings: {
          sensitivity: settingsRef.current.sensitivity,
          contrast: settingsRef.current.contrast,
          vascular_isolation: settingsRef.current.vascularIsolation,
        },
      }),
    );
  };

  return { pushSettings };
}
