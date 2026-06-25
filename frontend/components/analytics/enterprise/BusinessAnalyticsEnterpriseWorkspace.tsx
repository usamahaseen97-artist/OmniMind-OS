"use client";

import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { EnterpriseAnalyticsProvider } from "../../../lib/enterprise-analytics-context";
import { DynamicToolLiveSimMatrix } from "../../ide/dynamic-workbench-widgets";
import { EnterpriseAnalyticsSidePanel } from "./EnterpriseAnalyticsSidePanel";
import { EnterpriseAnalyticsToolbar } from "./EnterpriseAnalyticsToolbar";
import { NLAnalyticsBar } from "./NLAnalyticsBar";

/**
 * Phase 5 — wraps the existing analytics canvas with enterprise BI modules.
 * Preserves ToolLiveSimAnalytics via DynamicToolLiveSimMatrix.
 */
export function BusinessAnalyticsEnterpriseWorkspace({ tool }: { tool: SovereignToolDef }) {
  return (
    <EnterpriseAnalyticsProvider>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <EnterpriseAnalyticsToolbar />
        <NLAnalyticsBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="w-[220px] shrink-0 overflow-y-auto border-r border-white/[0.06] bg-[#0B0F19]/90">
            <EnterpriseAnalyticsSidePanel />
          </aside>
          <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <DynamicToolLiveSimMatrix tool={tool} />
          </main>
        </div>
      </div>
    </EnterpriseAnalyticsProvider>
  );
}
