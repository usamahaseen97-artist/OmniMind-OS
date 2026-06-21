"use client";

import { useEffect, useRef } from "react";
import { useMedicalDiagnosticStore } from "../../lib/medical-diagnostic-store";

export function MedicalScanCanvas2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { assets, activeAssetId, anomalies, filterBrightness, settings } = useMedicalDiagnosticStore();
  const active = assets.find((a) => a.id === activeAssetId) ?? assets[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w <= 0 || h <= 0) return;
      canvas.width = w;
      canvas.height = h;

      ctx.fillStyle = "#0a0416";
      ctx.fillRect(0, 0, w, h);

      const contrast = settings.contrast;
      const vascular = settings.vascularIsolation;
      ctx.filter = `brightness(${filterBrightness}) contrast(${contrast}) saturate(${1 - vascular * 0.3})`;

      if (active?.thumbnailUrl || (active?.objectUrl && active.fileType === "image")) {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(w / img.width, h / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          const dx = (w - dw) / 2;
          const dy = (h - dh) / 2;
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.filter = "none";
          anomalies.forEach((a) => {
            const [x, y, bw, bh] = a.coordinates;
            const sx = dx + (x / 320) * dw;
            const sy = dy + (y / 240) * dh;
            const sw = (bw / 320) * dw;
            const sh = (bh / 240) * dh;
            ctx.strokeStyle = "#fb7185";
            ctx.lineWidth = 2;
            ctx.strokeRect(sx, sy, sw, sh);
            ctx.fillStyle = "rgba(251,113,133,0.85)";
            ctx.font = "10px monospace";
            ctx.fillText(`${a.label} ${Math.round(a.confidence * 100)}%`, sx, sy - 4);
          });
        };
        img.src = active.thumbnailUrl ?? active.objectUrl;
      } else {
        ctx.filter = "none";
        ctx.fillStyle = "#334155";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Load scan or enable live feed", w / 2, h / 2);
      }
    };

    draw();
    const onResize = () => draw();
    window.addEventListener("omnimind:medical-canvas-resize", onResize);
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => {
      window.removeEventListener("omnimind:medical-canvas-resize", onResize);
      ro.disconnect();
    };
  }, [active, anomalies, filterBrightness, settings]);

  return <canvas ref={canvasRef} className="h-full w-full touch-none" />;
}
