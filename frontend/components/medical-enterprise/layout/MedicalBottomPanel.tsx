"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { BOTTOM_PANEL_TABS } from "../../../lib/medical-enterprise/constants";
import { useMedicalEnterprise } from "../../../lib/medical-enterprise/context";
import type { BottomPanelTab } from "../../../lib/medical-enterprise/types";

export function MedicalBottomPanel() {
  const { bottomTab, setBottomTab, bottomPanelOpen, setBottomPanelOpen, auditLog } = useMedicalEnterprise();

  return (
    <div className="medical-enterprise-bottom flex shrink-0 flex-col border-t border-white/[0.06] bg-[#060a10]">
      <div className="flex h-8 items-center justify-between border-b border-white/[0.04] px-2">
        <div className="flex gap-1">
          {BOTTOM_PANEL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setBottomTab(t.id as BottomPanelTab)}
              className={cn(
                "rounded px-2 py-0.5 text-[9px] transition-colors",
                bottomTab === t.id ? "bg-white/10 text-slate-200" : "text-slate-500 hover:text-slate-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
          className="rounded p-1 text-slate-500 hover:bg-white/[0.06]"
          aria-label={bottomPanelOpen ? "Collapse bottom panel" : "Expand bottom panel"}
        >
          {bottomPanelOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {bottomPanelOpen ? (
        <div className="h-[120px] overflow-y-auto p-2 font-mono text-[9px] text-slate-500">
          {bottomTab === "activity-log" || bottomTab === "system-events"
            ? auditLog.map((e) => (
                <div key={e.id} className="border-b border-white/[0.03] py-1">
                  <span className="text-slate-600">{e.timestamp}</span> · {e.action} · {e.resource}
                </div>
              ))
            : (
              <p className="text-slate-600">
                {bottomTab} — streaming timeline ready for future AI reasoning and device integration.
              </p>
            )}
        </div>
      ) : null}
    </div>
  );
}
