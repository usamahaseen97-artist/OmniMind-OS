"use client";

import {
  AlignCenter,
  Eye,
  EyeOff,
  Grid3X3,
  Lock,
  Magnet,
  Minus,
  MousePointer2,
  Move,
  Plus,
  Ruler,
  Unlock,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { cn } from "../../lib/utils";
import { CANVAS_TOOLS } from "../../lib/visionary/constants";
import { useVisionaryStudio } from "../../lib/visionary";
import type { CanvasTool } from "../../lib/visionary/types";

const TOOL_ICONS: Record<CanvasTool, typeof MousePointer2> = {
  select: MousePointer2,
  transform: Move,
  crop: Minus,
  rotate: Move,
  scale: Plus,
  align: AlignCenter,
};

export function VisionaryCanvas() {
  const {
    activeModule,
    canvasTool,
    setCanvasTool,
    canvasZoom,
    setCanvasZoom,
    canvasPan,
    setCanvasPan,
    snapGrid,
    setSnapGrid,
    showGuides,
    setShowGuides,
    layers,
    selectedLayerIds,
    setSelectedLayerIds,
    toggleLayerVisibility,
    project,
    playheadFrame,
  } = useVisionaryStudio();

  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (canvasTool !== "select" && canvasTool !== "transform") return;
      dragRef.current = { x: e.clientX, y: e.clientY, panX: canvasPan.x, panY: canvasPan.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [canvasPan.x, canvasPan.y, canvasTool],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      setCanvasPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
    },
    [setCanvasPan],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        setCanvasZoom((z) => Math.min(400, Math.max(10, z + delta)));
      }
    },
    [setCanvasZoom],
  );

  return (
    <div className="visionary-canvas flex h-full min-h-0 flex-col overflow-hidden bg-[#0B0F19]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] bg-[#0d121c] px-2 py-1">
        <div className="flex items-center gap-0.5">
          {CANVAS_TOOLS.map((t) => {
            const Icon = TOOL_ICONS[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCanvasTool(t.id)}
                title={`${t.label} (${t.shortcut})`}
                className={cn(
                  "rounded px-2 py-1 text-[9px] transition-colors",
                  canvasTool === t.id
                    ? "bg-cyan-500/15 text-cyan-200"
                    : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-300",
                )}
              >
                <Icon size={12} className="inline mr-1" />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSnapGrid(!snapGrid)}
            className={cn(
              "rounded p-1",
              snapGrid ? "text-cyan-300 bg-cyan-500/10" : "text-slate-500 hover:text-slate-300",
            )}
            title="Snap grid"
          >
            <Grid3X3 size={12} />
          </button>
          <button
            type="button"
            onClick={() => setShowGuides(!showGuides)}
            className={cn(
              "rounded p-1",
              showGuides ? "text-cyan-300 bg-cyan-500/10" : "text-slate-500 hover:text-slate-300",
            )}
            title="Guides"
          >
            <Ruler size={12} />
          </button>
          <button type="button" className="rounded p-1 text-slate-500 hover:text-slate-300" title="Snap">
            <Magnet size={12} />
          </button>
          <div className="ml-2 flex items-center gap-1 rounded border border-white/[0.08] bg-black/30 px-1">
            <button type="button" onClick={() => setCanvasZoom((z) => Math.max(10, z - 10))} className="px-1 text-slate-400 hover:text-white">−</button>
            <span className="min-w-[3rem] text-center text-[9px] text-slate-300">{canvasZoom}%</span>
            <button type="button" onClick={() => setCanvasZoom((z) => Math.min(400, z + 10))} className="px-1 text-slate-400 hover:text-white">+</button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          ref={viewportRef}
          className="relative min-h-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        >
          {snapGrid ? (
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)",
                backgroundSize: `${24 * (canvasZoom / 100)}px ${24 * (canvasZoom / 100)}px`,
                transform: `translate(${canvasPan.x}px, ${canvasPan.y}px)`,
              }}
            />
          ) : null}

          <div
            className="absolute left-1/2 top-1/2 origin-center"
            style={{
              transform: `translate(calc(-50% + ${canvasPan.x}px), calc(-50% + ${canvasPan.y}px)) scale(${canvasZoom / 100})`,
            }}
          >
            <div
              className="relative overflow-hidden rounded-sm border border-white/10 shadow-2xl shadow-black/60"
              style={{
                width: Math.min(720, project.resolution.width / 4),
                height: Math.min(405, project.resolution.height / 4),
                aspectRatio: `${project.resolution.width}/${project.resolution.height}`,
                background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a1033 100%)",
              }}
            >
              {showGuides ? (
                <>
                  <div className="pointer-events-none absolute left-1/3 top-0 h-full w-px bg-cyan-400/30" />
                  <div className="pointer-events-none absolute left-2/3 top-0 h-full w-px bg-cyan-400/30" />
                  <div className="pointer-events-none absolute left-0 top-1/3 h-px w-full bg-cyan-400/30" />
                  <div className="pointer-events-none absolute left-0 top-2/3 h-px w-full bg-cyan-400/30" />
                </>
              ) : null}

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400/70">
                  {activeModule.replace(/-/g, " ")}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-200">Composition Canvas</p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Frame {playheadFrame} · Infinite pan · {canvasTool} tool active
                </p>
              </div>

              {selectedLayerIds.includes("l-hero") ? (
                <div className="pointer-events-none absolute inset-[12%] rounded border-2 border-dashed border-cyan-400/60" />
              ) : null}
            </div>
          </div>
        </div>

        <div className="w-44 shrink-0 border-l border-white/[0.06] bg-[#0a0e16]">
          <div className="border-b border-white/[0.06] px-2 py-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Layers</p>
          </div>
          <ul className="overflow-y-auto py-1">
            {layers.map((layer) => (
              <li key={layer.id}>
                <button
                  type="button"
                  onClick={() => setSelectedLayerIds([layer.id])}
                  className={cn(
                    "flex w-full items-center gap-1 px-2 py-1 text-left text-[10px]",
                    selectedLayerIds.includes(layer.id)
                      ? "bg-cyan-500/10 text-cyan-100"
                      : "text-slate-400 hover:bg-white/[0.03]",
                  )}
                  style={{ paddingLeft: layer.parentId ? 20 : 8 }}
                >
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && toggleLayerVisibility(layer.id)}
                    className="shrink-0 text-slate-500 hover:text-slate-300"
                  >
                    {layer.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{layer.name}</span>
                  {layer.locked ? <Lock size={9} /> : <Unlock size={9} className="opacity-30" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
