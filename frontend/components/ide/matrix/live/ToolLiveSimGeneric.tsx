"use client";

import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { EntertainmentWorkspace } from "../../../entertainment/EntertainmentWorkspace";
import { OmniMapsPanel } from "../../../superapp/OmniMapsPanel";
import { OmniTranslatorPanel } from "../../../tools/panels/OmniTranslatorPanel";

const GUEST = "guest-founder";

export function ToolLiveSimGeneric({ tool }: { tool: SovereignToolDef }) {
  if (tool.slug === "omnimap") {
    return (
      <div className="relative h-full min-h-0">
        <OmniMapsPanel />
      </div>
    );
  }

  if (tool.slug === "omnimusic" || tool.slug === "omnitv" || tool.slug === "omnimovies") {
    const viewId = tool.slug === "omnimusic" ? "omnimusic" : tool.slug === "omnitv" ? "omnitv" : "omnimovies";
    return (
      <div className="h-full min-h-0 overflow-hidden">
        <EntertainmentWorkspace viewId={viewId} userId={GUEST} />
      </div>
    );
  }

  const Icon = tool.icon;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6" style={{ background: "var(--omni-bg)" }}>
      <Icon className="h-12 w-12 omni-accent-text" />
      <p className="text-sm font-semibold">{tool.name}</p>
      <p className="text-[11px]" style={{ color: "var(--omni-text-muted)" }}>{tool.tagline} · Live preview</p>
    </div>
  );
}
