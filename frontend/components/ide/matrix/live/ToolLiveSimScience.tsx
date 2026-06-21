"use client";

import { useEffect, useRef } from "react";
import { ClientMountGate } from "../../client/ClientMountGate";
import { useClientAnime } from "../../../../lib/client-anime";
import { useWorkbenchLive } from "../../../../lib/workbench-live-store";

function ScienceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useWorkbenchLive();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#07040d";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--omni-accent").trim() || "#a855f7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x += 4) {
        const y = h * 0.55 + Math.sin(x * 0.012 + t * 2) * 40 + Math.cos(x * 0.006 + t) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = "color-mix(in srgb, var(--omni-accent) 80%, white)";
      ctx.beginPath();
      ctx.arc(w * 0.72, h * 0.35, 8 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useClientAnime(
    ".nasa-eq-line",
    { opacity: [0.3, 1, 0.3], duration: 2400, ease: "inOutSine", loop: true },
    [live.streaming],
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: "var(--omni-bg)" }}>
      <div className="relative min-h-0 flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Trajectory canvas" />
      </div>
      <div className="shrink-0 border-t p-4 font-mono text-[10px]" style={{ borderColor: "var(--omni-border)", color: "var(--omni-text-muted)" }}>
        <pre className="nasa-eq-line whitespace-pre-wrap omni-accent-text">
          {`Δv = √(μ/r₁) · (√(2r₂/(r₁+r₂)) - 1)
∂L/∂q = 0  →  optimal trajectory
[${live.streaming ? "████████░░" : "██████░░░░"}] Iteration ${live.streaming ? "847" : "0"}/1000`}
        </pre>
        <p className="mt-2">Aerospace symbolic engine · calculus proof matrix · client-only animejs overlay</p>
      </div>
    </div>
  );
}

export function ToolLiveSimScience() {
  return (
    <ClientMountGate label="science canvas">
      <ScienceCanvas />
    </ClientMountGate>
  );
}
