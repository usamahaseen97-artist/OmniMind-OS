"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, type ReactNode } from "react";
import { useTriplePanelResize } from "../../../hooks/use-triple-panel-resize";
import { cn } from "../../../lib/utils";

/** Premium slit resizer — 4px violet divider + bidirectional micro-arrow glass pill */
function PanelSlitResizer({
  edge,
  active,
  onPointerDown,
  label,
}: {
  edge: "left" | "right";
  active: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);
  const lit = active || hovered;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      data-resize-edge={edge}
      onPointerDown={onPointerDown}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "omni-panel-slit-resizer relative z-50 flex h-full w-[4px] shrink-0 cursor-col-resize touch-none items-center justify-center transition-colors duration-150",
        lit ? "bg-[#00e5ff]/40" : "bg-purple-500/[0.08] hover:bg-purple-500/[0.3]",
        active && "omni-panel-slit-resizer-active",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/2 flex h-8 w-5 -translate-y-1/2 items-center justify-center gap-[1px] rounded-md border shadow-lg shadow-black/50 transition-all duration-150",
          lit
            ? "border-[#00e5ff]/50 bg-[#00e5ff]/40 text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
            : "border-purple-500/[0.25] bg-[#180e2e]",
        )}
      >
        <ChevronLeft
          size={10}
          className={cn("shrink-0", lit ? "text-[#00e5ff]" : "text-purple-300")}
          aria-hidden
        />
        <ChevronRight
          size={10}
          className={cn("shrink-0", lit ? "text-[#00e5ff]" : "text-purple-300")}
          aria-hidden
        />
      </div>
    </div>
  );
}

function PanelColumn({
  children,
  side,
  widthPct,
  centerDragClass,
  isDragging,
}: {
  children: ReactNode;
  side: "left" | "center" | "right";
  widthPct: number;
  centerDragClass?: string;
  isDragging: boolean;
}) {
  return (
    <div
      data-panel={side}
      className={cn(
        "omni-triple-panel-column flex h-full min-h-0 min-w-0 flex-col overflow-hidden",
        side === "center" && centerDragClass,
        !isDragging && "omni-triple-panel-column-idle",
      )}
      style={{
        flex: `0 0 ${widthPct}%`,
        width: `${widthPct}%`,
        maxWidth: `${widthPct}%`,
        transition: isDragging ? "none" : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * High-performance 3-panel horizontal layout with premium slit resizers.
 * Dev trio · Medical hub · spatial studios.
 */
export function TriplePanelResizeShell({
  left,
  center,
  right,
  centerDragClass = "omni-spatial-panel-canvas",
  leftGutterLabel = "Resize left and center panels",
  rightGutterLabel = "Resize center and right panels",
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  centerDragClass?: string;
  leftGutterLabel?: string;
  rightGutterLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    leftPct,
    centerPct,
    rightPct,
    isDragging,
    activeEdge,
    onLeftGutterPointerDown,
    onRightGutterPointerDown,
  } = useTriplePanelResize(containerRef);

  return (
    <div
      ref={containerRef}
      className={cn(
        "omni-triple-panel-shell relative flex h-full w-full min-h-0 min-w-0 flex-row overflow-hidden",
        isDragging && "omni-triple-panel-shell-dragging",
      )}
    >
      {isDragging ? (
        <div className="pointer-events-auto fixed inset-0 z-[45] cursor-col-resize" aria-hidden />
      ) : null}

      <PanelColumn side="left" widthPct={leftPct} isDragging={isDragging}>
        {left}
      </PanelColumn>

      <PanelSlitResizer
        edge="left"
        label={leftGutterLabel}
        active={activeEdge === "left"}
        onPointerDown={onLeftGutterPointerDown}
      />

      <PanelColumn
        side="center"
        widthPct={centerPct}
        centerDragClass={centerDragClass}
        isDragging={isDragging}
      >
        {center}
      </PanelColumn>

      <PanelSlitResizer
        edge="right"
        label={rightGutterLabel}
        active={activeEdge === "right"}
        onPointerDown={onRightGutterPointerDown}
      />

      <PanelColumn side="right" widthPct={rightPct} isDragging={isDragging}>
        {right}
      </PanelColumn>
    </div>
  );
}
