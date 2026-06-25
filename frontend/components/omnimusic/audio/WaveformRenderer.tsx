"use client";

import { useEffect, useRef } from "react";
import type { WaveformData } from "../../../lib/omnimusic-studio/audio-types";

type Props = {
  waveform: WaveformData | null;
  zoom?: number;
  selection?: { startSample: number; endSample: number } | null;
  height?: number;
  onSelect?: (start: number, end: number) => void;
};

export function WaveformRenderer({ waveform, zoom = 1, selection, height = 64, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ startX: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveform) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0e16";
    ctx.fillRect(0, 0, w, h);

    const peaks = waveform.peaks;
    const mid = h / 2;
    const step = Math.max(1, Math.floor(peaks.length / (w * zoom)));

    ctx.strokeStyle = "#f472b6";
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const idx = Math.min(peaks.length - 1, Math.floor((x / w) * peaks.length));
      const peak = peaks[idx] ?? 0;
      const y = peak * mid * 0.9;
      ctx.moveTo(x, mid - y);
      ctx.lineTo(x, mid + y);
    }
    ctx.stroke();

    if (selection && waveform) {
      const startX = (selection.startSample / (waveform.durationSec * waveform.sampleRate)) * w;
      const endX = (selection.endSample / (waveform.durationSec * waveform.sampleRate)) * w;
      ctx.fillStyle = "rgba(244,114,182,0.15)";
      ctx.fillRect(startX, 0, endX - startX, h);
    }
  }, [waveform, zoom, selection]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={height}
      className="w-full cursor-crosshair rounded border border-white/[0.06] bg-black/40"
      onMouseDown={(e) => {
        dragRef.current = { startX: e.nativeEvent.offsetX };
      }}
      onMouseUp={(e) => {
        if (!dragRef.current || !onSelect || !waveform) return;
        const w = canvasRef.current?.width ?? 400;
        const total = waveform.durationSec * waveform.sampleRate;
        const x0 = Math.min(dragRef.current.startX, e.nativeEvent.offsetX);
        const x1 = Math.max(dragRef.current.startX, e.nativeEvent.offsetX);
        onSelect(Math.floor((x0 / w) * total), Math.floor((x1 / w) * total));
        dragRef.current = null;
      }}
    />
  );
}
