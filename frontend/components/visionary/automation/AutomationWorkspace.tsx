"use client";

import { Group, Panel } from "react-resizable-panels";
import { cn } from "../../../lib/utils";
import { AUTOMATION_WORKSPACE_MODES } from "../../../lib/visionary/automation/constants";
import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";
import type { AutomationWorkspaceMode } from "../../../lib/visionary/automation/types";
import { SplitResizeHandle } from "../../ide/layouts/SplitWorkspace";
import { ProjectDashboard } from "./ProjectDashboard";
import { WorkflowBuilder } from "./WorkflowBuilder";
import { AssetPipeline } from "./AssetPipeline";
import { PublishingHub } from "./PublishingHub";
import { TaskManager } from "./TaskManager";
import { ApprovalCenter } from "./ApprovalCenter";
import { ContentPlanner } from "./ContentPlanner";
import { BrandManager } from "./BrandManager";
import { CloudWorkspace } from "./CloudWorkspace";
import { AutomationCenter } from "./AutomationCenter";
import { CreatorEngine } from "./CreatorEngine";
import { AIWorkflowCopilot } from "./AIWorkflowCopilot";
import { NotificationCenter } from "./NotificationCenter";
import { ReviewWorkspace } from "./ReviewWorkspace";

function CenterPanel({ mode }: { mode: AutomationWorkspaceMode }) {
  switch (mode) {
    case "dashboard": return <CreatorEngine />;
    case "workflows": return <WorkflowBuilder full />;
    case "pipeline": return <AssetPipeline />;
    case "publishing": return <PublishingHub />;
    case "tasks": return <TaskManager />;
    case "approvals": return <ReviewWorkspace />;
    case "planner": return <ContentPlanner />;
    case "brand": return <BrandManager />;
    case "cloud": return <CloudWorkspace />;
    case "plugins": return <AutomationCenter pluginsOnly />;
    default: return <ProjectDashboard />;
  }
}

export function AutomationWorkspace() {
  const { workspaceMode, setWorkspaceMode, saveProject } = useVisionaryAutomation();

  return (
    <div className="automation-workspace flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0B0F19]">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0e16] px-2">
        <div className="flex gap-0.5 overflow-x-auto">
          {AUTOMATION_WORKSPACE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setWorkspaceMode(m.id)}
              className={cn(
                "shrink-0 rounded px-2 py-1 text-[10px] transition-colors",
                workspaceMode === m.id ? "bg-indigo-500/15 text-indigo-200" : "text-slate-500 hover:text-slate-300",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={saveProject} className="rounded border border-indigo-500/30 px-2 py-0.5 text-[9px] text-indigo-300 hover:bg-indigo-500/10">
          Save Project
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={20} minSize={14} maxSize={28} className="flex min-h-0 flex-col overflow-hidden border-r border-white/[0.06]">
            <ProjectDashboard compact />
            <AutomationCenter />
            <NotificationCenter compact />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={54} minSize={40} className="min-h-0 overflow-hidden">
            <CenterPanel mode={workspaceMode} />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={26} minSize={18} maxSize={32} className="flex min-h-0 flex-col overflow-hidden border-l border-white/[0.06]">
            <AIWorkflowCopilot />
            <ApprovalCenter compact />
          </Panel>
        </Group>
      </div>
    </div>
  );
}
