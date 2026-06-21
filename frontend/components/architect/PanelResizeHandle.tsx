"use client";

import { GripVertical } from "lucide-react";
import { cn } from "../../lib/utils";

interface PanelResizeHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  active?: boolean;
}

export function PanelResizeHandle({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  active,
}: PanelResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize code panel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        "group relative z-20 flex w-[5px] shrink-0 cursor-col-resize items-center justify-center transition-colors",
        active ? "bg-[#00ffcc]/15" : "bg-[#0a0b0e] hover:bg-[#00ffcc]/10",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.08] transition group-hover:bg-[#00ffcc]/40",
          active && "bg-[#00ffcc]/50",
        )}
      />
      <div
        className={cn(
          "pointer-events-none flex flex-col items-center gap-0.5 rounded bg-[#15171e]/90 px-0.5 py-1.5 opacity-0 shadow-lg transition group-hover:opacity-100",
          active && "opacity-100",
        )}
      >
        <GripVertical className="h-3.5 w-3.5 text-[#00ffcc]/70" />
        <span className="text-[6px] font-bold tracking-tighter text-[#00ffcc]/60">↔</span>
      </div>
    </div>
  );
}
