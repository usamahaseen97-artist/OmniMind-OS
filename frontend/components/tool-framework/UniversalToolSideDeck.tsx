"use client";

import { useState } from "react";
import { Brain, Clock, ListTodo } from "lucide-react";
import { useUniversalToolFramework } from "../../lib/universal-tool-framework-context";
import { TOOL_FRAMEWORK_TOKENS } from "./tokens";

type DeckTab = "history" | "tasks" | "memory";

export function UniversalToolSideDeck() {
  const { state } = useUniversalToolFramework();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<DeckTab>("tasks");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2 top-12 z-30 rounded-md border px-2 py-1 text-[10px]"
        style={{
          borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle,
          background: TOOL_FRAMEWORK_TOKENS.bg.panel,
          color: TOOL_FRAMEWORK_TOKENS.text.muted,
        }}
      >
        Framework
      </button>
      {open ? (
        <aside
          className="absolute right-0 top-0 z-30 flex h-full w-56 flex-col border-l shadow-xl"
          style={{
            borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle,
            background: TOOL_FRAMEWORK_TOKENS.bg.panel,
          }}
        >
          <div className="flex border-b" style={{ borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle }}>
            {(
              [
                ["tasks", ListTodo, "Tasks"],
                ["history", Clock, "History"],
                ["memory", Brain, "Memory"],
              ] as const
            ).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="flex flex-1 items-center justify-center gap-1 py-2 text-[10px]"
                style={{
                  color: tab === id ? TOOL_FRAMEWORK_TOKENS.text.accent : TOOL_FRAMEWORK_TOKENS.text.muted,
                  borderBottom: tab === id ? `2px solid ${TOOL_FRAMEWORK_TOKENS.text.accent}` : "2px solid transparent",
                }}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2 text-[10px]" style={{ color: TOOL_FRAMEWORK_TOKENS.text.muted }}>
            {tab === "tasks"
              ? state.tasks.slice(0, 12).map((t) => (
                  <div key={t.id} className="mb-2 rounded border p-2" style={{ borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle }}>
                    <div style={{ color: TOOL_FRAMEWORK_TOKENS.text.primary }}>{t.label}</div>
                    <div>{t.status} · {t.progress}%</div>
                  </div>
                ))
              : null}
            {tab === "history"
              ? state.undoStack.slice(0, 12).map((v) => (
                  <div key={v.id} className="mb-2 rounded border p-2" style={{ borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle }}>
                    <div style={{ color: TOOL_FRAMEWORK_TOKENS.text.primary }}>{v.label}</div>
                    <div>{new Date(v.at).toLocaleString()}</div>
                  </div>
                ))
              : null}
            {tab === "memory"
              ? state.memoryContext.map((m, i) => (
                  <div key={i} className="mb-2 rounded border p-2" style={{ borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle }}>
                    {m}
                  </div>
                ))
              : null}
          </div>
        </aside>
      ) : null}
    </>
  );
}
