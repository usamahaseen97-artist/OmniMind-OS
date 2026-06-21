"use client";

import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";

export function ToolLiveSimTrading() {
  return (
    <div className="flex h-full flex-col p-4" style={{ background: "var(--omni-bg)" }}>
      <div className="mb-2 flex items-center gap-2 text-[10px] omni-accent-text">
        <TrendingUp className="h-3.5 w-3.5" /> Live market feed · API connected
      </div>
      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
      >
        <div className="absolute inset-x-4 bottom-4 flex h-32 items-end justify-around">
          {[40, 65, 45, 80, 55, 70, 50, 90, 60, 75].map((h, i) => (
            <motion.div
              key={i}
              className="w-2 rounded-t"
              style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--omni-accent) 60%, black), var(--omni-accent))" }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
