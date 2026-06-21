"use client";

import { memo } from "react";
import { getQuickSuggestions } from "../../lib/chat-suggestions";
import type { OmniRouteId } from "../../lib/omni-tools";

interface ChatSuggestionStripProps {
  routeId: OmniRouteId | string;
  onFill: (text: string) => void;
}

function ChatSuggestionStripInner({ routeId, onFill }: ChatSuggestionStripProps) {
  const suggestions = getQuickSuggestions(routeId);

  return (
    <div className="shrink-0 border-t border-white/[0.04] bg-[#050605]/80 px-3 py-2 backdrop-blur-sm">
      <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wider text-zinc-600">
        Quick prompts
      </p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onFill(s)}
            className="max-w-full rounded-lg border border-neon-green/15 bg-white/[0.03] px-2 py-1 text-left text-[10px] leading-snug text-zinc-500 transition hover:border-neon-green/40 hover:text-neon-green sm:max-w-[calc(50%-0.2rem)] lg:max-w-[calc(25%-0.2rem)]"
            title={s}
          >
            <span className="line-clamp-2">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const ChatSuggestionStrip = memo(ChatSuggestionStripInner);
