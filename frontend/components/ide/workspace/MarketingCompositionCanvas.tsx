"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useWorkbenchLive } from "../../../lib/workbench-live-store";
import { GlassScrollViewport } from "../workspace/GlassScrollViewport";

const Rnd = dynamic(() => import("react-rnd").then((m) => m.Rnd), { ssr: false });

type PlacedProduct = {
  id: string;
  label: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const PRODUCT_CATALOG = [
  { id: "mutton", label: "Dehli Mutton Pack", src: "🥩" },
  { id: "beef", label: "Beef Raw Pack", src: "🍖" },
  { id: "logo", label: "Brand Logo", src: "🏷️" },
];

/** RunwayML-style manual composition canvas — drag products onto billboard */
export function MarketingCompositionCanvas() {
  const live = useWorkbenchLive();
  const [placed, setPlaced] = useState<PlacedProduct[]>([]);
  const progress = live.videoProgress || (live.streaming ? 42 : 0);

  const addProduct = useCallback((id: string, label: string, src: string) => {
    setPlaced((prev) => [
      ...prev,
      {
        id: `${id}-${Date.now()}`,
        label,
        src,
        x: 40 + prev.length * 24,
        y: 80 + prev.length * 16,
        width: 120,
        height: 100,
      },
    ]);
  }, []);

  const updatePlaced = useCallback((id: string, patch: Partial<PlacedProduct>) => {
    setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: "#0B0F19" }}>
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2" style={{ borderColor: "#1E293B" }}>
        <div>
          <p className="text-[10px] font-bold uppercase omni-accent-text">Cinematic Canvas</p>
          <p className="text-[9px]" style={{ color: "var(--omni-text-muted)" }}>
            Runway / Sora premium layout · drag products onto billboard
          </p>
        </div>
        {live.streaming ? (
          <div className="text-right">
            <p className="text-[9px] omni-accent-text animate-pulse">Rendering… {Math.round(progress || 42)}%</p>
            <div className="mt-1 h-1 w-24 overflow-hidden rounded-full" style={{ background: "#1E293B" }}>
              <div className="h-full omni-accent-bg" style={{ width: `${progress || 42}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      <GlassScrollViewport className="min-h-0 flex-1">
        <div className="grid min-h-[420px] grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_220px]">
          <div
            className="relative min-h-[360px] overflow-hidden rounded-2xl border omni-state-ring"
            style={{ borderColor: "#1E293B", background: "linear-gradient(145deg, #111827, #0B0F19)" }}
          >
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 24px, #1E293B 24px, #1E293B 25px)" }} />
            <p className="absolute left-4 top-4 text-[11px] font-bold uppercase tracking-widest omni-accent-text">
              Promo Billboard
            </p>
            {live.streaming ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-48 animate-pulse rounded-xl border border-dashed omni-accent-border" />
              </div>
            ) : null}
            {placed.map((p) => (
              <Rnd
                key={p.id}
                size={{ width: p.width, height: p.height }}
                position={{ x: p.x, y: p.y }}
                bounds="parent"
                enableResizing
                onDragStop={(_e, d) => updatePlaced(p.id, { x: d.x, y: d.y })}
                onResizeStop={(_e, _dir, ref, _delta, pos) =>
                  updatePlaced(p.id, {
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    x: pos.x,
                    y: pos.y,
                  })
                }
              >
                <div
                  className="flex h-full w-full flex-col items-center justify-center rounded-xl border backdrop-blur-md omni-state-ring"
                  style={{ borderColor: "#1E293B", background: "color-mix(in srgb, var(--omni-panel) 85%, transparent)" }}
                >
                  <span className="text-3xl">{p.src}</span>
                  <span className="mt-1 text-[8px] font-semibold omni-accent-text">{p.label}</span>
                </div>
              </Rnd>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-bold uppercase omni-accent-text">Product Assets</p>
            {PRODUCT_CATALOG.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addProduct(p.id, p.label, p.src)}
                className="omni-state-ring flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[10px] transition hover:brightness-110"
                style={{ borderColor: "#1E293B", background: "var(--omni-panel)" }}
              >
                <span className="text-xl">{p.src}</span>
                <span style={{ color: "var(--omni-text-muted)" }}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </GlassScrollViewport>
    </div>
  );
}
