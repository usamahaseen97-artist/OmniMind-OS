"use client";

import { cn } from "../../../lib/utils";
import { VIEWPORT_TOOLS } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function Viewport3D() {
  const {
    objects,
    selectedObjectId,
    viewportTool,
    setViewportTool,
    projection,
    setProjection,
    transformMode,
    setTransformMode,
    snapEnabled,
    setSnapEnabled,
    gridVisible,
    setGridVisible,
  } = useVisionaryStudio3D();

  const selected = objects.find((o) => o.id === selectedObjectId);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#050608]">
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-white/[0.06] px-2 py-1">
        {VIEWPORT_TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setViewportTool(t.id)}
            className={cn(
              "rounded px-2 py-0.5 text-[8px]",
              viewportTool === t.id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-500",
            )}
          >
            {t.label}
          </button>
        ))}
        <span className="mx-1 text-slate-700">|</span>
        {(["translate", "rotate", "scale"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setTransformMode(m)}
            className={cn("rounded px-1.5 py-0.5 text-[8px] capitalize", transformMode === m ? "text-cyan-300" : "text-slate-600")}
          >
            {m}
          </button>
        ))}
        <button type="button" onClick={() => setProjection(projection === "perspective" ? "orthographic" : "perspective")} className="ml-auto text-[8px] text-slate-500">
          {projection}
        </button>
        <label className="flex items-center gap-1 text-[8px] text-slate-600">
          <input type="checkbox" checked={snapEnabled} onChange={(e) => setSnapEnabled(e.target.checked)} /> Snap
        </label>
        <label className="flex items-center gap-1 text-[8px] text-slate-600">
          <input type="checkbox" checked={gridVisible} onChange={(e) => setGridVisible(e.target.checked)} /> Grid
        </label>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden" style={{ perspective: projection === "perspective" ? "900px" : undefined }}>
        {gridVisible ? (
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
        ) : null}
        {objects.filter((o) => o.visible && o.type !== "light").map((obj, i) => (
          <div
            key={obj.id}
            className={cn(
              "absolute rounded border bg-gradient-to-br from-slate-600/80 to-slate-900/80",
              selectedObjectId === obj.id ? "border-cyan-400 shadow-lg shadow-cyan-500/30" : "border-white/20",
            )}
            style={{
              width: obj.type === "camera" ? 20 : 56 + i * 6,
              height: obj.type === "camera" ? 20 : 56 + i * 6,
              transform: `translate3d(${obj.position[0] * 24}px, ${obj.position[1] * -24}px, ${obj.position[2] * 12}px) rotateY(${obj.rotation[1]}deg)`,
            }}
          >
            <span className="absolute -top-3 left-0 text-[7px] text-slate-500">{obj.name}</span>
          </div>
        ))}
        {selected ? (
          <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 font-mono text-[8px] text-slate-400">
            {selected.name} · L{selected.layer} · {selected.tags.join(", ") || "no tags"}
          </div>
        ) : null}
        <div className="absolute right-2 top-2 flex gap-1">
          {["Top", "Front", "Right", "Persp"].map((v) => (
            <span key={v} className="rounded bg-black/50 px-1 text-[7px] text-slate-600">{v}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
