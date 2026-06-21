"use client";

import type { ReactNode } from "react";
import type { SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { useWorkbenchLive, type WorkbenchMarketingSlot } from "../../../lib/workbench-live-store";
import { AgentChatConsole } from "../workspace/AgentChatConsole";
import { cn } from "../../../lib/utils";

export const GUEST = "guest-founder";

export function MarketingLiveSlots() {
  const live = useWorkbenchLive();
  const defaults: WorkbenchMarketingSlot[] = [
    { title: "Image Ad Layout" },
    { title: "Promo Video Clip" },
    { title: "Social Captions" },
  ];
  const slots = live.marketingSlots.length >= 3 ? live.marketingSlots : defaults;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-4 md:grid-cols-3">
      {slots.map((slot, i) => (
        <div
          key={slot.title}
          className="flex min-h-[140px] flex-col rounded-xl border p-3 omni-glow-sm"
          style={{ borderColor: "var(--omni-border)", background: "var(--omni-bg)" }}
        >
          <p className="mb-2 text-[10px] font-semibold omni-accent-text">{slot.title}</p>
          <div
            className="min-h-0 flex-1 overflow-hidden rounded-lg border border-dashed"
            style={{ borderColor: "var(--omni-border)" }}
          >
            {slot.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slot.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : slot.videoUrl ? (
              <video src={slot.videoUrl} className="h-full w-full object-cover" controls muted />
            ) : slot.content ? (
              <p className="p-2 text-[9px] leading-relaxed" style={{ color: "var(--omni-text-muted)" }}>
                {slot.content}
              </p>
            ) : live.streaming ? (
              <div className="flex h-full items-center justify-center text-[9px] omni-accent-text animate-pulse">
                Generating asset {i + 1}/3…
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatPanel({ routeId, toolSlug }: { routeId: string; toolSlug?: SovereignToolSlug }) {
  const slug = (toolSlug ?? routeId) as SovereignToolSlug;
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2">
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--omni-border)", background: "var(--omni-bg)" }}
      >
        <AgentChatConsole routeId={routeId} toolSlug={slug} />
      </div>
    </div>
  );
}

export function PaneShell({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex h-full min-h-0 min-w-0 flex-col border-r", className)}
      style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel-alt)" }}
    >
      <header
        className="shrink-0 border-b px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider omni-accent-text"
        style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
      >
        {title}
      </header>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
