"use client";

import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { IDE_MENU_ITEMS } from "../../../../lib/omnimind-ide-config";
import { useIDE } from "../../IDEProvider";
import { ThemeHub } from "../../../theme/ThemeHub";
import { OF } from "./omniforge-theme";

export function OmniForgeDevMenuBar({ tool }: { tool: SovereignToolDef }) {
  const { setBottomTab } = useIDE();

  return (
    <header
      className="flex h-8 shrink-0 items-center gap-2 border-b px-2"
      style={{ borderColor: OF.border, background: OF.panelAlt }}
    >
      <span className="shrink-0 text-[11px] font-bold tracking-wide" style={{ color: OF.cyan }}>
        Development Tool
      </span>
      <span className="hidden text-[9px] sm:inline" style={{ color: OF.textMuted }}>
        · {tool.name}
      </span>
      <div className="flex items-center gap-0.5">
        {IDE_MENU_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => item === "Terminal" && setBottomTab("terminal")}
            className="rounded px-2 py-0.5 text-[10px] transition hover:bg-white/[0.05]"
            style={{ color: OF.textMuted }}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-[9px] md:inline" style={{ color: OF.textLabel }}>
          Development Tool · OmniForge v11
        </span>
        <ThemeHub />
      </div>
    </header>
  );
}
