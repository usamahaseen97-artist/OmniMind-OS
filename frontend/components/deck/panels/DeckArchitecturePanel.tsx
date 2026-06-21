"use client";

import { useEffect, useMemo } from "react";
import { deckChip, deckChipActive, deckRow } from "../../../lib/deck-interactive";
import {
  setArchitectureRenderPct,
  setArchitectureRoom,
  useDeckUi,
  type ArchitectureRoomId,
} from "../../../lib/deck-ui-store";
import { cn } from "../../../lib/utils";
import { DeckMicroLoader } from "../DeckMicroLoader";
import { DeckShell } from "../DeckShell";

const ROOMS: {
  id: ArchitectureRoomId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  widthM: number;
  depthM: number;
}[] = [
  { id: "living", label: "Living", x: 12, y: 20, w: 45, h: 35, widthM: 6.2, depthM: 4.8 },
  { id: "kitchen", label: "Kitchen", x: 58, y: 20, w: 30, h: 28, widthM: 3.4, depthM: 2.9 },
  { id: "bed", label: "Bed 1", x: 12, y: 58, w: 28, h: 32, widthM: 4.1, depthM: 3.6 },
  { id: "bath", label: "Bath", x: 42, y: 58, w: 18, h: 32, widthM: 2.2, depthM: 2.4 },
];

export function DeckArchitecturePanel() {
  const { architectureRoom, architectureRenderPct } = useDeckUi();
  const active = ROOMS.find((r) => r.id === architectureRoom) ?? ROOMS[0];
  const area = useMemo(
    () => Math.round(active.widthM * active.depthM * 10) / 10,
    [active],
  );

  useEffect(() => {
    let pct = 8;
    setArchitectureRenderPct(pct);
    const id = window.setInterval(() => {
      pct = Math.min(100, pct + 14);
      setArchitectureRenderPct(pct);
      if (pct >= 100) clearInterval(id);
    }, 120);
    return () => clearInterval(id);
  }, [architectureRoom]);

  const rendering = architectureRenderPct > 0 && architectureRenderPct < 100;

  return (
    <DeckShell
      title="SVG Wireframe Canvas"
      subtitle="Select rooms · live dimension bar from coordinates"
    >
      <div className="flex flex-wrap gap-1">
        {ROOMS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setArchitectureRoom(r.id)}
            className={cn(
              deckChip,
              "px-2 py-1 text-[9px] font-medium",
              architectureRoom === r.id && deckChipActive,
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {rendering ? (
        <DeckMicroLoader label={`Rendering ${active.label} · ${architectureRenderPct}%`} />
      ) : null}

      <div className="space-y-1">
        <div className="flex justify-between text-[9px] text-zinc-600">
          <span>Layout compile progress</span>
          <span className="font-mono text-[#00FF87]">{Math.min(100, architectureRenderPct)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-emerald-500/25 bg-[#0B0C10]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#00FF87] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, architectureRenderPct)}%` }}
          />
        </div>
      </div>

      <svg
        viewBox="0 0 100 100"
        className={cn(
          deckChip,
          "aspect-[4/3] w-full p-0 shadow-[inset_0_0_24px_rgba(16,185,129,0.08)]",
          rendering && "animate-pulse border-emerald-500/50",
        )}
        role="img"
        aria-label="Architectural wireframe"
      >
        <rect width="100" height="100" fill="#0B0C10" stroke="#10B98133" strokeWidth="0.5" />
        {ROOMS.map((r) => {
          const selected = r.id === architectureRoom;
          return (
            <g
              key={r.id}
              onClick={() => setArchitectureRoom(r.id)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setArchitectureRoom(r.id);
              }}
            >
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={selected ? "rgba(16,185,129,0.12)" : "none"}
                stroke={selected ? "#00FF87" : "#10B981"}
                strokeWidth={selected ? 1.2 : 0.8}
                strokeDasharray={selected ? "0" : "2 1"}
                className="transition-all duration-300"
              />
              <text
                x={r.x + 2}
                y={r.y + 6}
                fill={selected ? "#00FF87" : "#10B98199"}
                fontSize="4"
                fontFamily="monospace"
              >
                {r.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="space-y-1">
        <button type="button" className={cn(deckRow)}>
          <span className="text-zinc-500">Width</span>
          <span className="font-mono text-[#00FF87] transition-all duration-300">
            {active.widthM} m
          </span>
        </button>
        <button type="button" className={cn(deckRow)}>
          <span className="text-zinc-500">Depth</span>
          <span className="font-mono text-cyan-300 transition-all duration-300">
            {active.depthM} m
          </span>
        </button>
        <button type="button" className={cn(deckRow)}>
          <span className="text-zinc-500">Floor area</span>
          <span className="font-mono text-zinc-200 transition-all duration-300">{area} m²</span>
        </button>
      </div>
    </DeckShell>
  );
}
