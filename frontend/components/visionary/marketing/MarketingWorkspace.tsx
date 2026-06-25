"use client";

import { Group, Panel } from "react-resizable-panels";
import { cn } from "../../../lib/utils";
import { WORKSPACE_MODES } from "../../../lib/visionary/marketing/constants";
import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";
import type { MarketingWorkspaceMode } from "../../../lib/visionary/marketing/types";
import { SplitResizeHandle } from "../../ide/layouts/SplitWorkspace";
import { CampaignManager } from "./CampaignManager";
import { BrandStudio } from "./BrandStudio";
import { ProductStudio } from "./ProductStudio";
import { CreativeStudio } from "./CreativeStudio";
import { SocialMediaStudio } from "./SocialMediaStudio";
import { ContentFactory } from "./ContentFactory";
import { CalendarPlanner } from "./CalendarPlanner";
import { PublishingCenter } from "./PublishingCenter";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { TemplateMarketplace } from "./TemplateMarketplace";
import { PromptLibrary } from "./PromptLibrary";
import { BrandGuidelines } from "./BrandGuidelines";
import { Scheduler } from "./Scheduler";
import { AssetMarketplace } from "./AssetMarketplace";

function TeamPanel() {
  const { teamMembers, approvalRequests, versionHistory } = useVisionaryMarketing();
  return (
    <div className="flex h-full gap-2 p-2">
      <div className="min-w-0 flex-1"><CampaignManager full /></div>
      <div className="w-64 shrink-0 overflow-y-auto rounded border border-white/[0.06] bg-[#0a0e16] p-2">
        <p className="mb-2 text-[9px] uppercase text-slate-600">Team Workspace</p>
        {teamMembers.map((m) => (
          <p key={m.id} className="text-[10px] text-slate-400">{m.name} · {m.role}</p>
        ))}
        <p className="mt-3 text-[8px] text-slate-600">Approvals: {approvalRequests.length}</p>
        <p className="text-[8px] text-slate-600">Versions: {versionHistory.length}</p>
      </div>
    </div>
  );
}

function CenterPanel({ mode }: { mode: MarketingWorkspaceMode }) {
  switch (mode) {
    case "campaigns": return <CampaignManager full />;
    case "brand": return <BrandStudio />;
    case "product": return <ProductStudio />;
    case "creative": return <CreativeStudio />;
    case "social": return <SocialMediaStudio />;
    case "content-factory": return <ContentFactory />;
    case "calendar": return <CalendarPlanner />;
    case "publishing": return <PublishingCenter />;
    case "analytics": return <AnalyticsDashboard />;
    case "marketplace": return <TemplateMarketplace />;
    case "team": return <TeamPanel />;
    default: return <CampaignManager full />;
  }
}

export function MarketingWorkspace() {
  const { workspaceMode, setWorkspaceMode, saveProject } = useVisionaryMarketing();

  return (
    <div className="marketing-workspace flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0B0F19]">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0e16] px-2">
        <div className="flex gap-0.5 overflow-x-auto">
          {WORKSPACE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setWorkspaceMode(m.id)}
              className={cn(
                "shrink-0 rounded px-2 py-1 text-[10px] transition-colors",
                workspaceMode === m.id ? "bg-violet-500/15 text-violet-200" : "text-slate-500 hover:text-slate-300",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={saveProject}
          className="rounded border border-violet-500/30 px-2 py-0.5 text-[9px] text-violet-300 hover:bg-violet-500/10"
        >
          Save Project
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={18} minSize={14} maxSize={28} className="flex min-h-0 flex-col overflow-hidden border-r border-white/[0.06]">
            <CampaignManager />
            <Scheduler compact />
            <PromptLibrary compact />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={58} minSize={40} className="min-h-0 overflow-hidden">
            <CenterPanel mode={workspaceMode} />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={24} minSize={18} maxSize={32} className="flex min-h-0 flex-col overflow-hidden border-l border-white/[0.06]">
            <BrandGuidelines />
            <AssetMarketplace compact />
          </Panel>
        </Group>
      </div>
    </div>
  );
}
