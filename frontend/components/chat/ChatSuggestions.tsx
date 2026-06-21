"use client";

import { memo, useCallback } from "react";
import { getQuickSuggestions, isSuggestionFillOnlyRoute } from "../../lib/chat-suggestions";
import type { OmniRouteId } from "../../lib/omni-tools";

interface ChatSuggestionsProps {
  routeId: OmniRouteId | string;
  onPick: (text: string) => void;
  onFill?: (text: string) => void;
  fillOnly?: boolean;
}

function ChatSuggestionsInner({
  routeId,
  onPick,
  onFill,
  fillOnly = false,
}: ChatSuggestionsProps) {
  const suggestions = getQuickSuggestions(routeId);
  const useFill = fillOnly || isSuggestionFillOnlyRoute(routeId);

  const onChip = useCallback(
    (q: string) => {
      if (useFill && onFill) {
        onFill(q);
      } else {
        onPick(q);
      }
    },
    [onFill, onPick, useFill],
  );

  return (
    <div className="sovereign-suggestion-row flex shrink-0 flex-col gap-1.5 border-t border-white/[0.04] px-3 py-2 sm:flex-row sm:flex-wrap">
      {suggestions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onChip(q)}
          className="glass-panel max-w-full rounded-lg border border-white/[0.06] px-2 py-1.5 text-left text-[10px] leading-snug text-zinc-500 shadow-[0_0_24px_rgba(0,255,136,0.04)] transition hover:border-neon-green/35 hover:text-neon-green hover:shadow-[0_0_28px_rgba(0,255,136,0.08)] sm:max-w-[calc(50%-0.25rem)] lg:max-w-[calc(25%-0.25rem)]"
          title={q}
        >
          <span className="line-clamp-2">{q}</span>
        </button>
      ))}
    </div>
  );
}

export const ChatSuggestions = memo(ChatSuggestionsInner);
