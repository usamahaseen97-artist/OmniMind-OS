"use client";

import type { ReactNode } from "react";
import { useDragScroll } from "../../lib/use-drag-scroll";
import { cn } from "../../lib/utils";

/** Horizontal chip row — drag to scroll + smooth wheel */
export function OmniChipScrollRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, dragHandlers } = useDragScroll<HTMLDivElement>("x");

  return (
    <div
      ref={ref}
      {...dragHandlers}
      className={cn(
        "omni-chip-scroll omni-pro-scroll-x flex cursor-grab gap-1.5 overflow-x-auto pb-0.5 active:cursor-grabbing",
        className,
      )}
    >
      {children}
    </div>
  );
}
