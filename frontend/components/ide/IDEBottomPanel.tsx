"use client";

import { IDE_BOTTOM_TABS } from "../../lib/omnimind-ide-config";
import { useIDE } from "./IDEProvider";
import { cn } from "../../lib/utils";

export function IDEBottomPanel() {
  const { bottomTab, setBottomTab, terminalLines, workspaceState } = useIDE();

  return (
    <section
      className="flex h-44 shrink-0 flex-col border-t"
      style={{ borderColor: "var(--omni-border)", background: "var(--omni-bg)" }}
    >
      <div className="flex shrink-0 items-center gap-0 border-b px-1" style={{ borderColor: "var(--omni-border)" }}>
        {IDE_BOTTOM_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setBottomTab(tab.id)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-medium transition",
              bottomTab === tab.id ? "border-b-2 omni-accent-text" : "",
            )}
            style={{
              borderBottomColor: bottomTab === tab.id ? "var(--omni-accent)" : "transparent",
              color: bottomTab === tab.id ? undefined : "var(--omni-text-muted)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-2 font-mono text-[10px] leading-relaxed">
        {bottomTab === "terminal" ? (
          terminalLines.map((line, i) => (
            <p
              key={i}
              className={line.startsWith("✓") ? "omni-accent-text" : ""}
              style={line.startsWith("✓") ? undefined : { color: "var(--omni-text-muted)" }}
            >
              {line}
            </p>
          ))
        ) : bottomTab === "output" ? (
          <p style={{ color: "var(--omni-text-muted)" }}>
            {workspaceState.status ?? "Build output will appear here after codegen."}
          </p>
        ) : bottomTab === "problems" ? (
          <p style={{ color: "var(--omni-text-muted)" }}>No problems detected.</p>
        ) : bottomTab === "debug" ? (
          <p style={{ color: "var(--omni-text-muted)" }}>Debug console ready.</p>
        ) : (
          <p style={{ color: "var(--omni-text-muted)" }}>
            <span className="omni-accent-text">3000</span> frontend ·{" "}
            <span className="omni-accent-text">8001</span> api
          </p>
        )}
      </div>
    </section>
  );
}
