"use client";

import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { DynamicToolLiveSimMatrix } from "../dynamic-workbench-widgets";
import { DevicePreviewWrapper } from "./DevicePreviewWrapper";

/** Live device canvas for App · Business Web · Game dev trio */
export function DevTrioPreviewPane({ tool }: { tool: SovereignToolDef }) {
  return (
    <DevicePreviewWrapper className="h-full min-h-0 bg-[#070a12]">
      <DynamicToolLiveSimMatrix tool={tool} />
    </DevicePreviewWrapper>
  );
}
