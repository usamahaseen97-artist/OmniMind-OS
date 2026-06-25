"use client";

import { Loader2 } from "lucide-react";
import { useUniversalToolFramework } from "../../lib/universal-tool-framework-context";
import { TOOL_FRAMEWORK_TOKENS } from "./tokens";

export function UniversalToolProgressOverlay() {
  const { state } = useUniversalToolFramework();

  if (!state.loading && !state.error) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-40 flex flex-col"
      aria-live="polite"
    >
      {state.loading ? (
        <div className="h-0.5 w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${state.progress}%`,
              background: `linear-gradient(90deg, ${TOOL_FRAMEWORK_TOKENS.text.accent}, #818cf8)`,
            }}
          />
        </div>
      ) : null}
      {state.loading ? (
        <div
          className="mx-auto mt-2 flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] shadow"
          style={{
            borderColor: TOOL_FRAMEWORK_TOKENS.border.accent,
            background: TOOL_FRAMEWORK_TOKENS.bg.panel,
            color: TOOL_FRAMEWORK_TOKENS.text.accent,
          }}
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Executing pipeline · {state.progress}%
        </div>
      ) : null}
      {state.error ? (
        <div
          className="mx-3 mt-2 rounded-md border px-3 py-2 text-[11px]"
          style={{
            borderColor: "rgba(248,113,113,0.45)",
            background: "rgba(127,29,29,0.35)",
            color: "#fecaca",
          }}
        >
          {state.error}
        </div>
      ) : null}
    </div>
  );
}
