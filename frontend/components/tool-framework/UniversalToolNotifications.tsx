"use client";

import { X } from "lucide-react";
import { useUniversalToolFramework } from "../../lib/universal-tool-framework-context";
import { TOOL_FRAMEWORK_TOKENS } from "./tokens";

export function UniversalToolNotifications() {
  const { state, dismissNotification } = useUniversalToolFramework();

  if (!state.notifications.length) return null;

  return (
    <div className="pointer-events-none absolute bottom-12 right-3 z-50 flex max-w-sm flex-col gap-2">
      {state.notifications.slice(0, 4).map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] shadow-lg"
          style={{
            borderColor:
              n.level === "error"
                ? "rgba(248,113,113,0.4)"
                : n.level === "warn"
                  ? "rgba(251,191,36,0.35)"
                  : TOOL_FRAMEWORK_TOKENS.border.subtle,
            background: TOOL_FRAMEWORK_TOKENS.bg.panel,
            color: TOOL_FRAMEWORK_TOKENS.text.primary,
          }}
        >
          <span className="flex-1">{n.text}</span>
          <button type="button" onClick={() => dismissNotification(n.id)} aria-label="Dismiss">
            <X className="h-3 w-3 opacity-60" />
          </button>
        </div>
      ))}
    </div>
  );
}
