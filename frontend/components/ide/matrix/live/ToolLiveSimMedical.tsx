"use client";

import { Activity } from "lucide-react";

export function ToolLiveSimMedical() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6" style={{ background: "var(--omni-bg)" }}>
      <div
        className="relative flex h-48 w-48 items-center justify-center rounded-full border-2"
        style={{ borderColor: "var(--omni-border)", boxShadow: "0 0 40px var(--omni-accent-glow)" }}
      >
        <div className="absolute inset-4 rounded-full border border-dashed" style={{ borderColor: "var(--omni-border)" }} />
        <Activity className="h-10 w-10 omni-accent-text animate-pulse" />
      </div>
      <p className="text-[11px]" style={{ color: "var(--omni-text-muted)" }}>
        Facial scan mock frame · camera capture ready
      </p>
    </div>
  );
}
