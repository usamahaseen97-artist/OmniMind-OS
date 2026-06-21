"use client";

import { memo } from "react";
import { getAgentSuggestions } from "../../../lib/agent-suggestions";
import { getQuickSuggestions } from "../../../lib/chat-suggestions";
import { OmniChipScrollRow } from "../../ui/OmniChipScrollRow";

export function appendPromptText(current: string, next: string): string {
  const t = next.trim();
  if (!t) return current;
  const c = current.trim();
  return c ? `${c}\n${t}` : t;
}

/** Slim suggestion stack above chat input — quick macros on top, component pills below */
export function UnifiedChatChips({
  toolSlug,
  routeId,
  onFill,
}: {
  toolSlug: string;
  routeId: string;
  onFill: (text: string, mode?: "append" | "replace") => void;
}) {
  const agentChips = getAgentSuggestions(toolSlug);
  const quick = getQuickSuggestions(routeId);

  return (
    <div className="shrink-0 space-y-2.5 border-t border-purple-500/[0.12] bg-[#120924]/80 px-3 py-2.5 backdrop-blur-xl">
      {quick.length > 0 ? (
        <div className="space-y-1">
          <p className="px-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Quick prompts
          </p>
          <OmniChipScrollRow className="pb-0.5">
            {quick.map((s) => (
              <button
                key={s}
                type="button"
                data-no-drag-scroll
                onClick={() => onFill(s, "replace")}
                className="omni-state-ring max-w-[240px] shrink-0 rounded-lg border px-2.5 py-1.5 text-left text-[9px] leading-snug transition hover:brightness-110"
                style={{
                  borderColor: "#1E293B",
                  color: "var(--omni-text-muted)",
                  background: "color-mix(in srgb, var(--omni-panel) 70%, transparent)",
                }}
                title={s}
              >
                <span className="line-clamp-2">{s}</span>
              </button>
            ))}
          </OmniChipScrollRow>
        </div>
      ) : null}

      <div className="space-y-1">
        <p className="px-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Components
        </p>
        <div className="flex flex-wrap gap-1.5">
          {agentChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              data-no-drag-scroll
              onClick={() => onFill(chip.prompt, "append")}
              className="omni-state-ring shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-medium transition hover:brightness-110"
              style={{
                borderColor: "#1E293B",
                background: "color-mix(in srgb, var(--omni-panel) 90%, transparent)",
                color: "var(--omni-text)",
              }}
            >
              + {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const UnifiedChatChipsMemo = memo(UnifiedChatChips);
