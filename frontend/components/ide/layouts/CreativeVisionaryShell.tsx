"use client";

import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { CreativeVisionaryStudio } from "../../creative/CreativeVisionaryStudio";
import { ToolSwitcher } from "../ToolSwitcher";
import { ProjectUtilityDeck } from "../workspace/ProjectUtilityDeck";

/** Full-viewport generative media studio — no side chat, no legacy scene grid */
export function CreativeVisionaryShell({
  tool,
  embeddedInAppShell,
}: {
  tool: SovereignToolDef;
  embeddedInAppShell?: boolean;
}) {
  const routeId = tool.omniRouteId ?? tool.slug;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {!embeddedInAppShell ? (
      <header
        className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-2"
        style={{ borderColor: "#1E293B", background: "#111827" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ToolSwitcher tool={tool} />
        </div>
        <ProjectUtilityDeck toolSlug={tool.slug} exportLabel="Export Asset" />
      </header>
      ) : (
        <header
          className="flex shrink-0 justify-end border-b px-3 py-1"
          style={{ borderColor: "#1E293B", background: "#111827" }}
        >
          <ProjectUtilityDeck toolSlug={tool.slug} exportLabel="Export Asset" />
        </header>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <CreativeVisionaryStudio routeId={routeId} />
      </div>
    </div>
  );
}
