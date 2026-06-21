"use client";

import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { DynamicToolLiveSimMatrix } from "../../dynamic-workbench-widgets";
import { ChatPanel, PaneShell } from "../layout-shared";

/** GROUP C — NASA solver (animejs canvas isolated in live sim chunk) */
export function LayoutModuleC({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "nasa-science-solver";
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PaneShell title="Scientific Live Canvas" className="flex-1">
        <DynamicToolLiveSimMatrix tool={tool} />
      </PaneShell>
      <PaneShell title="Science Agent · Prompt" className="w-[40%] max-w-lg">
        <ChatPanel routeId={routeId} />
        <div className="flex gap-2 p-2">
          <button type="button" className="omni-accent-border flex-1 rounded border py-2 text-[10px]">
            Attach files
          </button>
          <button type="button" className="omni-accent-border flex-1 rounded border py-2 text-[10px] omni-accent-text">
            🎤 Voice
          </button>
        </div>
      </PaneShell>
    </div>
  );
}
