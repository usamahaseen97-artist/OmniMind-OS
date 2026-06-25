"use client";

import { Sparkles } from "lucide-react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { useUniversalToolFramework } from "../../lib/universal-tool-framework-context";
import { TOOL_FRAMEWORK_TOKENS } from "./tokens";

type UniversalToolToolbarProps = {
  tool: SovereignToolDef;
  compact?: boolean;
};

export function UniversalToolToolbar({ tool, compact }: UniversalToolToolbarProps) {
  const { tool: def, state, execute, runSuggestion } = useUniversalToolFramework();
  const Icon = def?.icon ?? tool.icon;

  return (
    <div
      className="flex h-9 shrink-0 items-center gap-2 border-b px-3"
      style={{
        borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle,
        background: TOOL_FRAMEWORK_TOKENS.bg.panelElevated,
      }}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: TOOL_FRAMEWORK_TOKENS.text.accent }} />
      <span className="text-[11px] font-semibold" style={{ color: TOOL_FRAMEWORK_TOKENS.text.primary }}>
        {def?.title ?? tool.name}
      </span>
      {!compact && def ? (
        <span className="hidden truncate text-[10px] sm:inline" style={{ color: TOOL_FRAMEWORK_TOKENS.text.muted }}>
          {def.category} · {def.capabilities[0]}
        </span>
      ) : null}
      <div className="ml-auto flex items-center gap-1">
        {state.suggestions.slice(0, 2).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => runSuggestion(s)}
            className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] transition hover:bg-white/5"
            style={{ borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle, color: TOOL_FRAMEWORK_TOKENS.text.muted }}
          >
            <Sparkles className="h-3 w-3" />
            {s.slice(0, 28)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void execute({ actionId: "analyze", prompt: def?.aiPrompts[0]?.template })}
          className="rounded-md border px-2 py-0.5 text-[10px] font-medium"
          style={{
            borderColor: TOOL_FRAMEWORK_TOKENS.border.accent,
            color: TOOL_FRAMEWORK_TOKENS.text.accent,
          }}
        >
          Run AI
        </button>
      </div>
    </div>
  );
}
