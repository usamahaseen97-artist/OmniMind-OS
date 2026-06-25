"use client";

import { cn } from "../../../lib/utils";
import { WORKFLOW_STEPS } from "../../../lib/medical-enterprise/constants";
import { useMedicalEnterprise } from "../../../lib/medical-enterprise/context";
import type { ClinicalWorkflowStep } from "../../../lib/medical-enterprise/types";

export function ClinicalWorkflowStrip() {
  const { workflowStep, setWorkflowStep } = useMedicalEnterprise();
  const currentIdx = WORKFLOW_STEPS.findIndex((s) => s.id === workflowStep);

  return (
    <div className="shrink-0 overflow-x-auto border-b border-white/[0.06] bg-[#080d14] px-2 py-1.5">
      <ol className="flex min-w-max items-center gap-1">
        {WORKFLOW_STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = step.id === workflowStep;
          return (
            <li key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => setWorkflowStep(step.id as ClinicalWorkflowStep)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[8px] font-medium transition-colors",
                  active && "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-500/40",
                  done && !active && "text-emerald-600/80",
                  !done && !active && "text-slate-600 hover:text-slate-400",
                )}
              >
                {step.label}
              </button>
              {idx < WORKFLOW_STEPS.length - 1 ? (
                <span className="mx-0.5 text-[8px] text-slate-700" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
