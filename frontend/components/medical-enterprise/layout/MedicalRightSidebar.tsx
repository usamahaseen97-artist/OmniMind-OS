"use client";

import { cn } from "../../../lib/utils";
import { RIGHT_PANEL_SECTIONS } from "../../../lib/medical-enterprise/constants";
import { useMedicalEnterprise } from "../../../lib/medical-enterprise/context";
import type { RightPanelSection } from "../../../lib/medical-enterprise/types";

const PLACEHOLDER_COPY: Record<RightPanelSection, string> = {
  "ai-findings": "AI findings panel — ready for future medical AI engines. No automated diagnoses displayed.",
  differential: "Differential diagnosis suggestions will appear here after clinical AI integration.",
  risk: "Risk indicators and severity scores — clinician-reviewed only.",
  "follow-up": "Suggested follow-up questions for patient encounter documentation.",
  guidelines: "Clinical guideline references and institutional protocols.",
  "lab-interpretation": "Lab interpretation assist — requires qualified review.",
  "medication-warnings": "Drug interaction and allergy warnings from pharmacy systems.",
  alerts: "Critical alerts and escalation notices.",
  tasks: "Assigned clinical tasks and follow-up items.",
};

export function MedicalRightSidebar() {
  const { activeRightSection, setActiveRightSection } = useMedicalEnterprise();

  return (
    <aside className="medical-enterprise-right flex h-full min-h-0 flex-col overflow-hidden border-l border-white/[0.06] bg-[#0a0f18]">
      <div className="shrink-0 border-b border-white/[0.06] px-2 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-cyan-400/70">Clinical Assist</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-white/[0.06] p-1">
        {RIGHT_PANEL_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveRightSection(s.id)}
            className={cn(
              "rounded px-1.5 py-0.5 text-[8px] transition-colors",
              activeRightSection === s.id
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="rounded-lg border border-dashed border-cyan-500/20 bg-cyan-500/[0.03] p-3">
          <p className="text-[10px] leading-relaxed text-slate-400">{PLACEHOLDER_COPY[activeRightSection]}</p>
          <p className="mt-2 text-[8px] text-slate-600">Engine slot: clinical-ai-vNext</p>
        </div>
      </div>
    </aside>
  );
}
