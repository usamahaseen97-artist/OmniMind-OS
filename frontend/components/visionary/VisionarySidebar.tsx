"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { SIDEBAR_MODULES } from "../../lib/visionary/constants";
import { useVisionaryStudio } from "../../lib/visionary";
import type { VisionarySidebarModule } from "../../lib/visionary/types";
import { VisionaryAssetLibrary } from "./VisionaryAssetLibrary";
import { VisionaryExportCenter } from "./VisionaryExportCenter";

const GROUP_LABELS = {
  create: "Create",
  studio: "Studios",
  library: "Library",
} as const;

export function VisionarySidebar() {
  const { activeModule, setActiveModule, dock, toggleLeftPanel } = useVisionaryStudio();

  if (dock.leftCollapsed) {
    return (
      <div className="flex h-full w-8 shrink-0 flex-col items-center border-r border-white/[0.06] bg-[#080c14] py-2">
        <button
          type="button"
          onClick={toggleLeftPanel}
          className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-cyan-300"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  const groups = (["create", "studio", "library"] as const).map((group) => ({
    group,
    items: SIDEBAR_MODULES.filter((m) => m.group === group),
  }));

  const showAssets = activeModule === "cloud-assets" || activeModule === "templates";
  const showExport = activeModule === "export-center";

  return (
    <aside
      className="visionary-sidebar flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-white/[0.06] bg-[#080c14]"
      aria-label="Visionary modules"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-cyan-400/80">Visionary</p>
          <p className="text-[11px] font-medium text-slate-200">Studio Modules</p>
        </div>
        <button
          type="button"
          onClick={toggleLeftPanel}
          className="rounded p-1 text-slate-500 hover:bg-white/[0.06]"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
        {groups.map(({ group, items }) => (
          <div key={group} className="mb-2">
            <p className="px-3 py-1 text-[8px] font-semibold uppercase tracking-widest text-slate-600">
              {GROUP_LABELS[group]}
            </p>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveModule(item.id as VisionarySidebarModule)}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-[11px] transition-colors",
                      activeModule === item.id
                        ? "border-l-2 border-cyan-400 bg-cyan-500/10 font-medium text-cyan-100"
                        : "border-l-2 border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {showAssets ? (
        <div className="max-h-[45%] shrink-0 border-t border-white/[0.06]">
          <VisionaryAssetLibrary compact />
        </div>
      ) : null}
      {showExport ? (
        <div className="max-h-[45%] shrink-0 border-t border-white/[0.06]">
          <VisionaryExportCenter compact />
        </div>
      ) : null}
    </aside>
  );
}
