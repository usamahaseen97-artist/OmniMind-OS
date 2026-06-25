"use client";

import Link from "next/link";
import { ArrowLeft, PanelLeft } from "lucide-react";
import { MarketplaceShell } from "../../../components/marketplace/MarketplaceShell";
import { OmniMindOSSidebar } from "../../../components/os/OmniMindOSSidebar";
import { OmniMindMarketplaceProvider } from "../../../lib/omnimind-marketplace-context";
import { useOmniMindEcosystem } from "../../../lib/omnimind-ecosystem-context";

export default function MarketplacePage() {
  const { sidebarOpen, setSidebarOpen } = useOmniMindEcosystem();

  return (
    <OmniMindMarketplaceProvider>
      <div className="flex h-full min-h-0 w-full overflow-hidden bg-[#07090f]">
        <OmniMindOSSidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
            {!sidebarOpen ? (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded p-1.5 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                aria-label="Expand sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            ) : null}
            <Link
              href="/"
              className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
            >
              <ArrowLeft className="h-3 w-3" />
              Neural Home
            </Link>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <MarketplaceShell />
          </div>
        </div>
      </div>
    </OmniMindMarketplaceProvider>
  );
}
