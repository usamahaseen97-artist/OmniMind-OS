"use client";

import type { ReactNode } from "react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { IDE_MENU_ITEMS } from "../../lib/omnimind-ide-config";
import { useIDE } from "./IDEProvider";
import { ToolSwitcher } from "./ToolSwitcher";
import { cn } from "../../lib/utils";

export function IDETopMenuBar({
  tool,
  trailing,
}: {
  tool: SovereignToolDef;
  trailing?: ReactNode;
}) {
  const { setBottomTab, setRightExplorerOpen, rightExplorerOpen } = useIDE();

  const onMenuClick = (item: (typeof IDE_MENU_ITEMS)[number]) => {
    if (item === "Terminal") setBottomTab("terminal");
    if (item === "View") setRightExplorerOpen(!rightExplorerOpen);
  };

  return (
    <header
      className="flex h-8 shrink-0 items-center gap-3 border-b px-2"
      style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
    >
      <ToolSwitcher tool={tool} />
      <div className="flex items-center gap-0.5">
        {IDE_MENU_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onMenuClick(item)}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] transition hover:bg-white/[0.05]",
              item === "View" && rightExplorerOpen ? "bg-white/[0.04]" : "",
            )}
            style={{ color: item === "View" && rightExplorerOpen ? "var(--omni-text)" : "var(--omni-text-muted)" }}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[10px] font-medium tracking-wide" style={{ color: "var(--omni-text-muted)" }}>
          OmniMind V11 · Sovereign IDE
        </span>
        {trailing}
      </div>
    </header>
  );
}
