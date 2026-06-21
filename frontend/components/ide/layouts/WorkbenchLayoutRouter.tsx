"use client";

import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { DynamicAnimatedToolViewport } from "../client/dynamic-engines";
import { SovereignActivityBar } from "../SovereignActivityBar";
import { ZoneContentRouter } from "./ZoneContentRouter";

/** Routes every sovereign tool through the 4-zone ultralight shell */
export function WorkbenchLayoutRouter({ tool }: { tool: SovereignToolDef }) {
  return (
    <div className="omni-workbench-viewport flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      {tool.slug !== "omniforge-engine" ? <SovereignActivityBar /> : null}
      <DynamicAnimatedToolViewport
        toolKey={tool.slug}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        <ZoneContentRouter tool={tool} />
      </DynamicAnimatedToolViewport>
    </div>
  );
}
