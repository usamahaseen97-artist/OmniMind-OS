"use client";

import { useEffect } from "react";

export function useStreamPreviewGateway(roomId: string): void {
  useEffect(() => {
    if (!roomId) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/stream-preview`);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", room_id: roomId }));
      ws.send(JSON.stringify({ type: "preview_state", payload: { room_id: roomId, status: "active" } }));
    };
    const ping = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
    }, 12000);
    return () => {
      window.clearInterval(ping);
      try {
        ws.close();
      } catch {}
    };
  }, [roomId]);
}

