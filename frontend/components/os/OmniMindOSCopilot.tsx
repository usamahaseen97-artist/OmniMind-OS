"use client";

import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { OmniMindMasterCopilot } from "./copilot/OmniMindMasterCopilot";

type OmniMindOSCopilotProps = {
  tool: SovereignToolDef;
  designMode?: boolean;
};

/** Reusable right AI copilot — delegates to Master Agent orchestration panel. */
export function OmniMindOSCopilot({ tool, designMode }: OmniMindOSCopilotProps) {
  return <OmniMindMasterCopilot tool={tool} designMode={designMode} />;
}
