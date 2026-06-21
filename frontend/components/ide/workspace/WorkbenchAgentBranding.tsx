"use client";

import { Sparkles } from "lucide-react";
import { getOmniTool } from "../../../lib/omni-tools";

/** Fixed agent identity strip — stays pinned above chat history */
export function WorkbenchAgentBranding({ routeId }: { routeId: string }) {
  const tool = getOmniTool(routeId);

  return (
    <header className="omni-studio-header flex shrink-0 items-center gap-3 border-b px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border omni-accent-border omni-accent-bg omni-glow-sm">
        <Sparkles className="h-4 w-4 omni-accent-text" />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold tracking-tight text-[#e1dbf5]">{tool.name}</h2>
        <p
          className="truncate text-[9px] font-medium uppercase tracking-[0.28em] omni-accent-text"
          style={{ opacity: 0.85 }}
        >
          {tool.tagline}
        </p>
      </div>
    </header>
  );
}
