"use client";

import { getOmniTool } from "../../lib/omni-tools";
import { CentralSuggestionHub } from "../chat/CentralSuggestionHub";
import { emitSuperToolPrompt } from "../../lib/super-tool-prompt-bus";
import { cn } from "../../lib/utils";
import { BusinessArchitectPanel } from "./BusinessArchitectPanel";
import { MarketingKingPanel } from "./MarketingKingPanel";
import { NasaSciencePanel } from "./NasaSciencePanel";
import { OmniMapsPanel } from "./OmniMapsPanel";

interface SuperToolWorkspaceProps {
  toolId: string;
}

export function SuperToolWorkspace({ toolId }: SuperToolWorkspaceProps) {
  const tool = getOmniTool(toolId);
  const isOmniMaps = toolId === "ai-omnimaps";

  if (isOmniMaps) {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#0B0C10]">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at 60% 20%, rgba(16,185,129,0.14), transparent 55%)",
          }}
        />
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <OmniMapsPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at top, ${
            tool.accent === "cyan"
              ? "rgba(34,211,238,0.15)"
              : tool.accent === "fuchsia"
                ? "rgba(232,121,249,0.12)"
                : tool.accent === "emerald"
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(167,139,250,0.12)"
          }, transparent 55%)`,
        }}
      />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div
          className={cn(
            "max-h-[36vh] min-h-0 shrink-0 overflow-hidden border-b border-emerald-500/15 lg:max-h-none",
            "lg:flex lg:w-[min(320px,30%)] lg:flex-col lg:border-b-0 lg:border-r",
          )}
        >
          <CentralSuggestionHub
            routeId={toolId}
            onFill={(text) => emitSuperToolPrompt(toolId, text)}
            className="py-3 lg:py-6"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {toolId === "nasa-science-solver" && <NasaSciencePanel />}
          {toolId === "marketing-ad-king" && <MarketingKingPanel />}
          {toolId === "business-software-architect" && <BusinessArchitectPanel />}
        </div>
      </div>
    </div>
  );
}
