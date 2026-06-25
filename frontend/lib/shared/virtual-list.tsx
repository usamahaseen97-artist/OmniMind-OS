"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, type CSSProperties, type ReactNode } from "react";

export type VirtualListProps<T> = {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  className?: string;
  style?: CSSProperties;
  renderItem: (item: T, index: number) => ReactNode;
  /** Use plain map when count is below threshold (avoids virtualizer overhead). */
  threshold?: number;
};

/** Viewport-virtualized list — use for long conversation/asset/history lists. */
export function VirtualList<T>({
  items,
  estimateSize = 40,
  overscan = 8,
  className,
  style,
  renderItem,
  threshold = 24,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  if (items.length <= threshold) {
    return (
      <div className={className} style={style}>
        {items.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={parentRef} className={className} style={{ overflow: "auto", ...style }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((vItem) => (
          <div
            key={vItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${vItem.size}px`,
              transform: `translateY(${vItem.start}px)`,
            }}
          >
            {renderItem(items[vItem.index]!, vItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
