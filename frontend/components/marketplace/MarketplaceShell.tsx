"use client";

import { BarChart3, Building2, Code2, Store } from "lucide-react";
import { DSTabs } from "../../design-system/components/Tabs";
import { DSWorkspaceHeader } from "../../design-system/components/WorkspaceHeader";
import { useOmniMindMarketplace, type MarketplaceView } from "../../lib/omnimind-marketplace-context";
import { MarketplaceAnalyticsDashboard } from "./MarketplaceAnalyticsDashboard";
import { MarketplaceBrowse } from "./MarketplaceBrowse";
import { MarketplaceDeveloperPortal } from "./MarketplaceDeveloperPortal";
import { MarketplaceEnterprisePanel } from "./MarketplaceEnterprisePanel";

const TABS: { id: MarketplaceView; label: string }[] = [
  { id: "browse", label: "App Store" },
  { id: "developer", label: "Developer" },
  { id: "enterprise", label: "Enterprise" },
  { id: "analytics", label: "Analytics" },
];

export function MarketplaceShell() {
  const mp = useOmniMindMarketplace();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[color:var(--omni-ds-bg-canvas)] text-[color:var(--omni-ds-text-primary)]">
      <DSWorkspaceHeader
        title="OmniMind Marketplace"
        subtitle="Tools · Agents · Plugins · Workflows · Themes · Enterprise Connectors"
        actions={
          <DSTabs
            tabs={TABS}
            active={mp.activeView}
            onChange={(id) => mp.setActiveView(id as MarketplaceView)}
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        {mp.activeView === "browse" ? <MarketplaceBrowse /> : null}
        {mp.activeView === "developer" ? <MarketplaceDeveloperPortal /> : null}
        {mp.activeView === "enterprise" ? <MarketplaceEnterprisePanel /> : null}
        {mp.activeView === "analytics" ? <MarketplaceAnalyticsDashboard /> : null}
      </div>
    </div>
  );
}
