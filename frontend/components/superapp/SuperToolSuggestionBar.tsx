"use client";

import { Sparkles } from "lucide-react";
import { useCallback } from "react";
import { getQuickSuggestions } from "../../lib/chat-suggestions";
import { emitSuperToolPrompt } from "../../lib/super-tool-prompt-bus";
import { cn } from "../../lib/utils";

interface SuperToolSuggestionBarProps {
  toolId: string;
}

export function SuperToolSuggestionBar({ toolId }: SuperToolSuggestionBarProps) {
  const suggestions = getQuickSuggestions(toolId);

  const onPick = useCallback(
    (text: string) => {
      emitSuperToolPrompt(toolId, text);
    },
    [toolId],
  );

  return (
    <div
      className={cn(
        "shrink-0 border-t border-white/[0.08] bg-gradient-to-t from-black/60 via-[#050608]/95 to-transparent",
        "px-3 py-2 backdrop-blur-md",
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-neon-green/80">
        <Sparkles className="h-3 w-3" />
        Quick prompts
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="max-w-full rounded-lg border border-neon-green/15 bg-white/[0.04] px-2 py-1.5 text-left text-[10px] leading-snug text-zinc-400 shadow-[0_0_20px_rgba(0,255,136,0.04)] transition hover:border-neon-green/40 hover:text-neon-green sm:max-w-[calc(50%-0.25rem)] lg:max-w-[calc(25%-0.25rem)]"
            title={q}
          >
            <span className="line-clamp-2">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
