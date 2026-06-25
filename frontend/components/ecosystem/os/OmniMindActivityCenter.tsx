"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bell, Download, Sparkles, Upload, X } from "lucide-react";
import { omniCore } from "../../../core/omnicore/OmniCore";
import type { EcosystemActivity } from "../../../core/ecosystem/types";
import { cn } from "../../../lib/utils";

type Props = { open: boolean; onClose: () => void };

const KIND_ICON: Record<string, typeof Bell> = {
  download: Download,
  upload: Upload,
  "ai-task": Sparkles,
  error: AlertTriangle,
  notification: Bell,
};

export function OmniMindActivityCenter({ open, onClose }: Props) {
  const [items, setItems] = useState<EcosystemActivity[]>([]);

  useEffect(() => {
    if (!open) return;
    void omniCore.ecosystem.activity.boot().then(() => {
      setItems(omniCore.ecosystem.activity.items);
    });
    const onActivity = () => setItems([...omniCore.ecosystem.activity.items]);
    const unsub = omniCore.eventBus.subscribe("activity:new", onActivity);
    return () => {
      unsub();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0b0e16]/98 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-400">Action Center</p>
            <h2 className="text-sm font-semibold text-zinc-100">Activity</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </header>

        <ul className="history-scroll-hover flex-1 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <li className="p-4 text-center text-xs text-zinc-500">No activity yet</li>
          ) : (
            items.map((item) => {
              const Icon = KIND_ICON[item.kind] ?? Bell;
              return (
                <li
                  key={item.id}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                >
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-zinc-200">{item.title}</p>
                      {item.detail ? <p className="text-[10px] text-zinc-500">{item.detail}</p> : null}
                      <p className={cn("mt-1 text-[9px] uppercase", item.status === "failed" ? "text-rose-400" : "text-zinc-600")}>
                        {item.kind} · {item.status}
                      </p>
                    </div>
                  </div>
                  {item.progress != null ? (
                    <div className="mt-2 h-1 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-violet-500/70" style={{ width: `${item.progress}%` }} />
                    </div>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
