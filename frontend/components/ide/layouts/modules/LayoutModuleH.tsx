"use client";

import type { SovereignToolDef } from "../../../../lib/sovereign-tool-registry";
import { DynamicToolLiveSimMatrix } from "../../dynamic-workbench-widgets";
import { AgentChatHub } from "../../workspace/AgentChatHub";
import { SplitPanelBody, SplitPanelHeader, SplitWorkspaceNLE } from "../SplitWorkspace";

/** GROUP H — professional NLE + adjacent AI prompt deck */
export function LayoutModuleH({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? "vfx-master";

  return (
    <SplitWorkspaceNLE
      topLeftDefault={30}
      bottomDefault={36}
      topLeft={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader title="Input Deck · Media Pool" subtitle="Upload clips · AI edit prompts" />
          <SplitPanelBody padded className="gap-2">
            <div
              className="shrink-0 rounded-xl border border-dashed py-6 text-center text-[9px] omni-state-ring"
              style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}
            >
              Drop raw video / audio clips
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <AgentChatHub routeId={routeId} toolSlug={tool.slug} />
            </div>
            <p className="shrink-0 text-[8px] italic" style={{ color: "var(--omni-text-muted)" }}>
              e.g. &quot;Color grade cinematic, apply 3D lightning overlay&quot;
            </p>
          </SplitPanelBody>
        </div>
      }
      topRight={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader
            title="Program Monitor"
            subtitle="Live playback · grade preview · audio meters"
            badge={<span className="omni-state-ring rounded-full px-2 py-0.5 text-[8px] omni-accent-text">HD</span>}
          />
          <SplitPanelBody className="p-0">
            <div className="flex h-full flex-col" style={{ background: "#000" }}>
              <div className="flex min-h-0 flex-[2] items-center justify-center border-b" style={{ borderColor: "#1E293B" }}>
                <p className="text-[10px]" style={{ color: "var(--omni-text-muted)" }}>
                  Processed clip · live playback
                </p>
              </div>
              <div className="flex shrink-0 items-end gap-0.5 px-3 py-2" style={{ background: "#0B0F19" }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-sm omni-accent-bg"
                    style={{ height: `${8 + Math.sin(i * 0.7) * 12 + 12}px`, opacity: 0.7 }}
                  />
                ))}
                <span className="ml-2 text-[8px]" style={{ color: "var(--omni-text-muted)" }}>
                  A1 · -6dB
                </span>
              </div>
            </div>
          </SplitPanelBody>
        </div>
      }
      bottom={
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <SplitPanelHeader
            title="Multi-Layer Timeline · NLE"
            subtitle="Cut · splice · transitions · overlay FX"
            actions={
              <div className="flex gap-1">
                {["Razor", "Grade", "FX", "Export"].map((t) => (
                  <button key={t} type="button" className="omni-state-ring rounded border px-2 py-0.5 text-[8px]" style={{ borderColor: "#1E293B" }}>
                    {t}
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
    />
  );
}
