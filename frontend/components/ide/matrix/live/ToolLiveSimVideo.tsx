"use client";

import { Film } from "lucide-react";

/** Legacy scene grid purged — creative-visionary uses CreativeVisionaryStudio */
export function ToolLiveSimVideo() {
  return (
    <div className="flex h-full items-center justify-center p-6" style={{ background: "#0B0F19" }}>
      <div className="text-center">
        <Film className="mx-auto mb-2 h-8 w-8 omni-accent-text opacity-60" />
        <p className="text-[10px]" style={{ color: "var(--omni-text-muted)" }}>
          Video preview routed through Generative Media Studio
        </p>
      </div>
    </div>
  );
}
