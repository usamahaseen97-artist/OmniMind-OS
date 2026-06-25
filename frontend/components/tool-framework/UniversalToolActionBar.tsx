"use client";

import { Download, History, Import, Redo2, Undo2 } from "lucide-react";
import { useUniversalToolFramework } from "../../lib/universal-tool-framework-context";
import { TOOL_FRAMEWORK_TOKENS } from "./tokens";

export function UniversalToolActionBar() {
  const { state, undo, redo, exportWorkspace, importWorkspace } = useUniversalToolFramework();

  return (
    <div
      className="flex h-8 shrink-0 items-center justify-between gap-2 border-t px-3"
      style={{
        borderColor: TOOL_FRAMEWORK_TOKENS.border.subtle,
        background: TOOL_FRAMEWORK_TOKENS.bg.status,
      }}
    >
      <div className="flex items-center gap-1">
        <ActionBtn icon={Undo2} label="Undo" onClick={undo} disabled={!state.undoStack.length} />
        <ActionBtn icon={Redo2} label="Redo" onClick={redo} disabled={!state.redoStack.length} />
        <ActionBtn icon={Import} label="Import" onClick={importWorkspace} />
        <ActionBtn icon={Download} label="Export" onClick={exportWorkspace} />
      </div>
      <div className="flex items-center gap-2 text-[10px]" style={{ color: TOOL_FRAMEWORK_TOKENS.text.muted }}>
        <History className="h-3 w-3" />
        <span>
          v{state.undoStack.length} · tasks {state.tasks.filter((t) => t.status === "running").length} running
        </span>
        {state.autosaveAt ? <span>· saved {new Date(state.autosaveAt).toLocaleTimeString()}</span> : null}
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Undo2;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition hover:bg-white/5 disabled:opacity-40"
      style={{ color: TOOL_FRAMEWORK_TOKENS.text.muted }}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
