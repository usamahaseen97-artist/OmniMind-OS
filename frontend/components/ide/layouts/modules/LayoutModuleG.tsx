"use client";

import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { DynamicToolLiveSimMatrix } from "../../dynamic-workbench-widgets";
import { ChatPanel } from "../layout-shared";
import { SplitPanelBody, SplitPanelHeader, SplitWorkspace2Col } from "../SplitWorkspace";

/** GROUP G — Cinematic video studio (Runway / Sora style) */
export function LayoutModuleG({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "creative-visionary";

  return (
    <SplitWorkspace2Col
      sidebarDefault={28}
      sidebarSide="right"
      footer={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader title="Creative Agent · Dialogue Dock" subtitle="Shot prompts · frame control" />
          <SplitPanelBody padded className="max-h-full">
            <div className="h-[min(22vh,160px)] min-h-[100px] overflow-hidden">
              <ChatPanel routeId={routeId} />
            </div>
          </SplitPanelBody>
        </div>
      }
      footerDefault={22}
      main={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader
            title="Cinematic Canvas"
            subtitle="Timeline · multi-frame generation · audio bed"
            actions={
              <div className="flex flex-wrap gap-1">
                <select
                  className="rounded border bg-black/40 px-2 py-0.5 text-[9px]"
                  style={{ borderColor: "var(--omni-border)", color: "var(--omni-text)" }}
                >
                  <option>50s timeline</option>
                  <option>1 min timeline</option>
                </select>
                {[1, 2, 3, 5].map((n) => (
                  <button key={n} type="button" className="omni-accent-border rounded border px-2 py-0.5 text-[8px]">
                    {n}F
                  </button>
                ))}
              </div>
            }
          />
          <SplitPanelBody className="p-0">
            <DynamicToolLiveSimMatrix tool={tool} />
          </SplitPanelBody>
        </div>
      }
      sidebar={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader title="Motion Controls" subtitle="Camera · seed · style presets" />
          <SplitPanelBody padded className="gap-2 text-[10px]" style={{ color: "var(--omni-text-muted)" }}>
            <label className="block">
              Aspect
              <select className="mt-1 w-full rounded border bg-black/40 px-2 py-1" style={{ borderColor: "var(--omni-border)" }}>
                <option>16:9 Cinematic</option>
                <option>9:16 Social</option>
              </select>
            </label>
            <label className="block">
              Camera
              <select className="mt-1 w-full rounded border bg-black/40 px-2 py-1" style={{ borderColor: "var(--omni-border)" }}>
                <option>Dolly push-in</option>
                <option>Orbital sweep</option>
              </select>
            </label>
            <label className="block">
              Audio bed
              <select className="mt-1 w-full rounded border bg-black/40 px-2 py-1" style={{ borderColor: "var(--omni-border)" }}>
                <option>Cinematic synth</option>
                <option>Corporate neutral</option>
              </select>
            </label>
          </SplitPanelBody>
        </div>
      }
    />
  );
}
