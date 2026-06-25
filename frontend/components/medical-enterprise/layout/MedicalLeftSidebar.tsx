"use client";

import { cn } from "../../../lib/utils";
import { LEFT_NAV_ITEMS } from "../../../lib/medical-enterprise/constants";
import { useMedicalEnterprise } from "../../../lib/medical-enterprise/context";
import type { MedicalNavSection } from "../../../lib/medical-enterprise/types";

export function MedicalLeftSidebar() {
  const { activeNav, setActiveNav, themeMode } = useMedicalEnterprise();

  return (
    <nav
      className={cn(
        "medical-enterprise-left flex h-full min-h-0 flex-col overflow-hidden border-r",
        themeMode === "light" ? "border-slate-200 bg-slate-50" : "border-white/[0.06] bg-[#0a0f18]",
      )}
      aria-label="Medical workspace navigation"
    >
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-emerald-400/80">Clinical</p>
        <p className="text-[11px] font-medium text-[color:var(--omni-ds-text-primary,#e2e8f0)]">Navigation</p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
        {LEFT_NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActiveNav(item.id as MedicalNavSection)}
              className={cn(
                "w-full px-3 py-2 text-left text-[11px] transition-colors",
                activeNav === item.id
                  ? "border-l-2 border-emerald-400 bg-emerald-500/10 font-medium text-emerald-100"
                  : "border-l-2 border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
