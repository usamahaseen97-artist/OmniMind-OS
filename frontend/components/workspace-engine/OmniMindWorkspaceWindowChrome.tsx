"use client";

import {
  Columns2,
  Grid2X2,
  Maximize2,
  Minimize2,
  Minus,
  PanelBottom,
  PanelLeft,
  Rows2,
  Square,
} from "lucide-react";
import { useWorkspaceEngine } from "../../lib/workspace-engine-context";
import { OS_TOKENS } from "../os/tokens";

export function OmniMindWorkspaceWindowChrome() {
  const { setSplitMode, setWorkspaceSnap, toggleMinimize, toggleDockPanel, splitMode } =
    useWorkspaceEngine();

  const btn =
    "rounded p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200";

  return (
    <div
      className="flex h-7 shrink-0 items-center justify-between gap-2 border-b px-2"
      style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.header }}
    >
      <div className="flex items-center gap-0.5">
        <button type="button" className={btn} title="Toggle explorer" onClick={() => toggleDockPanel("explorer")}>
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} title="Toggle terminal" onClick={() => toggleDockPanel("terminal")}>
          <PanelBottom className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-3 w-px bg-white/10" />
        <button
          type="button"
          className={btn}
          title="Single pane"
          onClick={() => setSplitMode("single")}
          data-active={splitMode === "single"}
        >
          <Square className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} title="Split vertical" onClick={() => setSplitMode("horizontal")}>
          <Columns2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} title="Split horizontal" onClick={() => setSplitMode("vertical")}>
          <Rows2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} title="Quad split" onClick={() => setSplitMode("quad")}>
          <Grid2X2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        <button type="button" className={btn} title="Snap left" onClick={() => setWorkspaceSnap("left")}>
          ◧
        </button>
        <button type="button" className={btn} title="Snap right" onClick={() => setWorkspaceSnap("right")}>
          ◨
        </button>
        <button type="button" className={btn} title="Minimize" onClick={() => toggleMinimize()}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} title="Maximize" onClick={() => setWorkspaceSnap("fullscreen")}>
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} title="Restore" onClick={() => setWorkspaceSnap("none")}>
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
