"use client";

import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { useOmniForgeEngineering } from "../../../lib/omniforge-engineering-context";
import {
  BACKEND_OPTIONS as BE,
  DATABASE_OPTIONS as DB,
  DEPLOY_OPTIONS as DP,
  FRONTEND_OPTIONS as FE,
  ORM_OPTIONS as ORM,
  PROJECT_TYPE_OPTIONS as PT,
} from "../../../lib/omniforge-engineering/wizard-config";
import type { ProjectType } from "../../../lib/omniforge-engineering/types";

const FEATURE_SUGGESTIONS = [
  "Authentication",
  "Dark mode",
  "Admin dashboard",
  "Payments",
  "Search",
  "Notifications",
  "Multi-language",
  "Analytics",
];

function GlassModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#12141c]/95 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function OmniForgeProjectWizard() {
  const eng = useOmniForgeEngineering();
  if (!eng.wizardOpen) return null;

  const { wizard, updateWizard, wizardNext, wizardBack, closeWizard, submitWizardForArchitect, toggleFeature } = eng;
  const step = wizard.step;

  const canNext =
    (step === "project_type" && wizard.projectType) ||
    (step === "project_name" && wizard.projectName.trim().length > 1) ||
    (step === "description" && wizard.description.trim().length > 4) ||
    !["project_type", "project_name", "description"].includes(step);

  return (
    <GlassModal onClose={closeWizard}>
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-100">New Project Wizard</h2>
        </div>
        <p className="mb-4 text-[10px] text-zinc-500">One question at a time — your elite AI engineering team is standing by.</p>

        {step === "project_type" && (
          <div className="grid max-h-[340px] grid-cols-2 gap-2 overflow-y-auto">
            {PT.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  updateWizard({ projectType: opt.id as ProjectType });
                  wizardNext();
                }}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  wizard.projectType === opt.id
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200"
                    : "border-white/8 bg-white/[0.02] text-zinc-300 hover:border-white/15"
                }`}
              >
                <span className="block text-[11px] font-semibold">{opt.label}</span>
                <span className="text-[9px] text-zinc-500">{opt.hint}</span>
              </button>
            ))}
          </div>
        )}

        {step === "project_name" && (
          <input
            autoFocus
            value={wizard.projectName}
            onChange={(e) => updateWizard({ projectName: e.target.value })}
            placeholder="e.g. NovaCommerce"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500/40"
          />
        )}

        {step === "description" && (
          <textarea
            autoFocus
            rows={5}
            value={wizard.description}
            onChange={(e) => updateWizard({ description: e.target.value })}
            placeholder="Describe what you're building, target users, and key workflows…"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500/40"
          />
        )}

        {step === "stack_mode" && (
          <div className="flex flex-col gap-2">
            {(["ai_recommended", "manual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  updateWizard({ stack: { ...wizard.stack, mode } });
                  wizardNext();
                }}
                className={`rounded-lg border px-4 py-3 text-left ${
                  wizard.stack.mode === mode ? "border-indigo-400/50 bg-indigo-500/10" : "border-white/8"
                }`}
              >
                <span className="text-[11px] font-semibold text-zinc-200">
                  {mode === "ai_recommended" ? "AI Recommended Stack" : "Manual Selection"}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === "frontend" && (
          <OptionGrid options={FE} value={wizard.stack.frontend} onPick={(v) => updateWizard({ stack: { ...wizard.stack, frontend: v as typeof wizard.stack.frontend } })} />
        )}
        {step === "backend" && (
          <OptionGrid options={BE} value={wizard.stack.backend} onPick={(v) => updateWizard({ stack: { ...wizard.stack, backend: v as typeof wizard.stack.backend } })} />
        )}
        {step === "database" && (
          <OptionGrid options={DB} value={wizard.stack.database} onPick={(v) => updateWizard({ stack: { ...wizard.stack, database: v as typeof wizard.stack.database } })} />
        )}
        {step === "orm" && (
          <OptionGrid options={ORM} value={wizard.stack.orm} onPick={(v) => updateWizard({ stack: { ...wizard.stack, orm: v as typeof wizard.stack.orm } })} />
        )}
        {step === "deployment" && (
          <OptionGrid options={DP} value={wizard.stack.deployment} onPick={(v) => updateWizard({ stack: { ...wizard.stack, deployment: v as typeof wizard.stack.deployment } })} />
        )}

        {step === "features" && (
          <div className="flex flex-wrap gap-2">
            {FEATURE_SUGGESTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFeature(f)}
                className={`rounded-full px-3 py-1 text-[10px] ${
                  wizard.features.includes(f) ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/30" : "bg-white/5 text-zinc-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {step === "review" && (
          <div className="space-y-2 text-[11px] text-zinc-300">
            <p><span className="text-zinc-500">Type:</span> {wizard.projectType}</p>
            <p><span className="text-zinc-500">Name:</span> {wizard.projectName}</p>
            <p><span className="text-zinc-500">Stack:</span> {wizard.stack.frontend} · {wizard.stack.backend} · {wizard.stack.database}</p>
            <p className="text-zinc-500">{wizard.description.slice(0, 120)}…</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={wizardBack} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300">
            <ChevronLeft className="h-3 w-3" /> Back
          </button>
          {step === "review" ? (
            <button
              type="button"
              onClick={() => void submitWizardForArchitect()}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white"
            >
              Create Architecture Plan
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext}
              onClick={wizardNext}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-4 py-2 text-[10px] font-semibold text-zinc-200 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </GlassModal>
  );
}

function OptionGrid({ options, value, onPick }: { options: readonly string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onPick(opt)}
          className={`rounded-lg border px-3 py-2 text-[11px] capitalize ${
            value === opt ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200" : "border-white/8 text-zinc-400"
          }`}
        >
          {opt.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
