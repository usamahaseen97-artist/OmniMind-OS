"use client";

import { motion } from "framer-motion";
import { Megaphone, Share2, Video } from "lucide-react";
import { useWorkbenchLive } from "../../../../lib/workbench-live-store";

export function ToolLiveSimMarketing() {
  const live = useWorkbenchLive();
  const slots =
    live.marketingSlots.length >= 3
      ? live.marketingSlots
      : [
          { title: "Ad Creative Layout", content: "Hero banner · CTA · brand palette" },
          { title: "Promo Video Script", content: "Hook · 3-beat story · retention CTA" },
          { title: "Social Captions", content: "Instagram · LinkedIn · TikTok copy variants" },
        ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-4" style={{ background: "var(--omni-bg)" }}>
      <header className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 omni-accent-text" />
          <span className="text-[11px] font-bold uppercase tracking-wider omni-accent-text">Marketing Billboard Engine</span>
        </div>
        <Share2 className="h-4 w-4" style={{ color: "var(--omni-text-muted)" }} />
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-3">
        {slots.map((slot, i) => (
          <motion.div
            key={slot.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 320, damping: 28 }}
            className="flex min-h-[120px] flex-col rounded-xl border p-3 omni-glow-sm"
            style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
          >
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold omni-accent-text">
              {i === 1 ? <Video className="h-3 w-3" /> : null}
              {slot.title}
            </p>
            <div
              className="min-h-0 flex-1 overflow-hidden rounded-lg border border-dashed p-2 text-[9px] leading-relaxed"
              style={{ borderColor: "var(--omni-border)", color: "var(--omni-text-muted)" }}
            >
              {slot.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slot.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : slot.content ? (
                slot.content
              ) : live.streaming ? (
                <span className="animate-pulse omni-accent-text">Generating asset {i + 1}/3…</span>
              ) : (
                "Awaiting campaign brief from left panel…"
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
