"use client";

import { Bug, FileText, Rocket, Sparkles, Wand2, MessageSquare } from "lucide-react";
import { COPILOT_ACTIONS, type CopilotActionId } from "../../../../../lib/omniforge-ide-modules";

const ICONS: Record<CopilotActionId, typeof Sparkles> = {
  autocomplete: Sparkles,
  chat: MessageSquare,
  optimize: Wand2,
  bugfix: Bug,
  document: FileText,
  review: FileText,
  deploy: Rocket,
};

/** Co-pilot action strip — hooks into agent chat without altering panel layout. */
export function OmniForgeCopilotStrip({
  onAction,
  disabled,
}: {
  onAction: (action: CopilotActionId, prompt: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-white/[0.04] bg-[#0c0d12] px-2 py-1">
      {COPILOT_ACTIONS.filter((a) => a.id !== "chat").map((action) => {
        const Icon = ICONS[action.id];
        return (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action.id, action.prompt)}
            className="flex shrink-0 items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[8px] font-medium text-zinc-400 transition hover:border-cyan-500/30 hover:text-cyan-300 disabled:opacity-40"
          >
            <Icon className="h-3 w-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
