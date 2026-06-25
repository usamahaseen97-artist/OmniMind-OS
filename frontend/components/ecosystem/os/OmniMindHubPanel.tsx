"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GripVertical, Link2, X } from "lucide-react";
import { omniCore } from "../../../core/omnicore/OmniCore";
import { SOVEREIGN_TOOLS } from "../../../lib/sovereign-tool-registry";
import { cn } from "../../../lib/utils";

type Props = { open: boolean; onClose: () => void };

export function OmniMindHubPanel({ open, onClose }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    SOVEREIGN_TOOLS.slice(0, 16).forEach((t) => {
      omniCore.ecosystem.hub.registerTool({
        id: t.slug,
        toolSlug: t.slug,
        label: t.name,
        href: t.href,
      });
    });
  }, [open]);

  const slots = omniCore.ecosystem.hub.slots;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#0a0d14] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">OmniMind Hub</p>
            <h2 className="text-sm font-semibold text-zinc-100">Connected Tools</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </header>

        <p className="border-b border-white/5 px-4 py-2 text-[10px] text-zinc-500">
          One-click switch · drag to reorder · shared memory, assets, history & AI
        </p>

        <ul className="history-scroll-hover flex-1 overflow-y-auto p-3 space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              draggable
              onDragStart={() => setDragId(slot.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId && dragId !== slot.id) omniCore.ecosystem.hub.reorder(dragId, slot.id);
                setDragId(null);
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2",
                dragId === slot.id && "border-cyan-500/40",
              )}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-zinc-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-200">{slot.label}</p>
                <p className="flex items-center gap-1 text-[9px] text-zinc-500">
                  <Link2 className="h-2.5 w-2.5" />
                  shared AI & memory
                </p>
              </div>
              <Link
                href={slot.href}
                onClick={() => omniCore.ecosystem.hub.switchTool(slot.toolSlug)}
                className="rounded border border-cyan-500/30 px-2 py-1 text-[10px] text-cyan-300 hover:bg-cyan-500/10"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
