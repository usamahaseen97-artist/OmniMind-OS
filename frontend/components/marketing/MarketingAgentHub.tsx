"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { getAgentSuggestions } from "../../lib/agent-suggestions";
import { triggerAgentSuggestion } from "../../lib/trigger-agent-suggestion";
import { MarketingSocialCaptionPanel } from "./MarketingSocialCaptionPanel";
import { OmniChipScrollRow } from "../ui/OmniChipScrollRow";
import { cn } from "../../lib/utils";

const panelSpring = { type: "spring" as const, stiffness: 440, damping: 38, mass: 0.82 };

/** Marketing-only agent — prompt, smart badges, social caption highlight (no duplicate chat stream) */
export function MarketingAgentHub({ routeId }: { routeId: string }) {
  const chips = getAgentSuggestions("digital-marketing-hub");
  const [input, setInput] = useState("");

  const submit = useCallback(
    (text?: string) => {
      const q = (text ?? input).trim();
      if (!q) return;
      setInput(q);
      triggerAgentSuggestion(routeId, q);
    },
    [input, routeId],
  );

  return (
    <motion.div
      layout
      initial={false}
      transition={panelSpring}
      className="omni-lux-chat flex h-full min-h-0 flex-col overflow-hidden"
      style={{ background: "#0B0F19" }}
    >
      <div
        className="shrink-0 space-y-2.5 border-b p-3"
        style={{ borderColor: "#1E293B", background: "#111827" }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          rows={5}
          placeholder="Mutton ad, brand film, hashtags… poora instruction yahan likhein, multi-line wrap ho jayega."
          className="omni-lux-prompt-input w-full resize-none rounded-xl border p-3 font-mono text-[11px] leading-relaxed outline-none"
          style={{
            borderColor: "#1E293B",
            background: "#0B0F19",
            color: "var(--omni-text)",
            minHeight: "128px",
            maxHeight: "200px",
          }}
        />
        <OmniChipScrollRow>
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              data-no-drag-scroll
              onClick={() => submit(chip.prompt)}
              className="omni-state-ring shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-semibold transition hover:brightness-110"
              style={{
                borderColor: "#1E293B",
                background: "color-mix(in srgb, var(--omni-panel) 92%, transparent)",
                color: "var(--omni-text)",
              }}
            >
              + {chip.label}
            </button>
          ))}
        </OmniChipScrollRow>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <MarketingSocialCaptionPanel />
      </div>

      <div className="shrink-0 border-t p-3" style={{ borderColor: "#1E293B", background: "#111827" }}>
        <button
          type="button"
          onClick={() => submit()}
          disabled={!input.trim()}
          className={cn(
            "omni-deploy-btn w-full rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest",
            !input.trim() && "opacity-50",
          )}
        >
          Execute Campaign
        </button>
      </div>
    </motion.div>
  );
}
