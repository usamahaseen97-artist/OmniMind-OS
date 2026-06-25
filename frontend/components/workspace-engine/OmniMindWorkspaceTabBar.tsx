"use client";

import { memo, useCallback, useRef, useState } from "react";
import { Copy, Pin, PinOff, X } from "lucide-react";
import { useWorkspaceEngine } from "../../lib/workspace-engine-context";
import { cn } from "../../lib/utils";
import { OS_TOKENS } from "../os/tokens";

export const OmniMindWorkspaceTabBar = memo(function OmniMindWorkspaceTabBar() {
  const { tabs, activeTabId, focusTab, closeTab, pinTab, duplicateTab, reorderTabs } =
    useWorkspaceEngine();
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const onDragStart = useCallback((index: number) => {
    dragIndex.current = index;
  }, []);

  const onDrop = useCallback(
    (index: number) => {
      if (dragIndex.current !== null && dragIndex.current !== index) {
        reorderTabs(dragIndex.current, index);
      }
      dragIndex.current = null;
      setOverIndex(null);
    },
    [reorderTabs],
  );

  if (!tabs.length) return null;

  return (
    <div
      className="flex h-8 shrink-0 items-stretch gap-0.5 overflow-x-auto border-b px-1"
      style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.header }}
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const active = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={active}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(index);
            }}
            onDragLeave={() => setOverIndex(null)}
            onDrop={() => onDrop(index)}
            className={cn(
              "group flex max-w-[200px] shrink-0 items-center gap-1 rounded-t-md border px-2 text-[10px] transition",
              active
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
                : "border-transparent text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300",
              overIndex === index && "ring-1 ring-cyan-500/40",
            )}
          >
            <button
              type="button"
              className="min-w-0 flex-1 truncate text-left"
              onClick={() => focusTab(tab.id)}
            >
              {tab.pinned ? <Pin className="mr-0.5 inline h-2.5 w-2.5 text-cyan-400" /> : null}
              {tab.title}
            </button>
            <button
              type="button"
              className="hidden rounded p-0.5 hover:bg-white/10 group-hover:inline-flex"
              title="Duplicate tab"
              onClick={(e) => {
                e.stopPropagation();
                duplicateTab(tab.id);
              }}
            >
              <Copy className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              className="hidden rounded p-0.5 hover:bg-white/10 group-hover:inline-flex"
              title={tab.pinned ? "Unpin" : "Pin tab"}
              onClick={(e) => {
                e.stopPropagation();
                pinTab(tab.id, !tab.pinned);
              }}
            >
              {tab.pinned ? <PinOff className="h-2.5 w-2.5" /> : <Pin className="h-2.5 w-2.5" />}
            </button>
            {!tab.pinned ? (
              <button
                type="button"
                className="rounded p-0.5 hover:bg-white/10"
                title="Close tab"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});
