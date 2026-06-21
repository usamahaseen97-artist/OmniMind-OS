import type { ReactNode } from "react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { ToolSwitcher } from "./ToolSwitcher";

export function ToolWorkbenchHeader({
  tool,
  trailing,
}: {
  tool: SovereignToolDef;
  trailing?: ReactNode;
}) {
  return (
    <header
      className="flex h-10 shrink-0 items-center gap-3 border-b px-3"
      style={{ borderColor: "#1E293B", background: "#111827" }}
    >
      <ToolSwitcher tool={tool} />
      <span className="hidden text-[10px] sm:inline" style={{ color: "var(--omni-text-muted)" }}>
        {tool.tagline}
      </span>
      <div className="ml-auto flex items-center gap-2">{trailing}</div>
    </header>
  );
}
