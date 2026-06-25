"use client";

import { Check, X } from "lucide-react";
import { useOmniForgeShell } from "../../../lib/omniforge-shell-context";
import { useOmniForgeEngineering } from "../../../lib/omniforge-engineering-context";

export function OmniForgeArchitectPlanPanel() {
  const eng = useOmniForgeEngineering();
  const shell = useOmniForgeShell();
  if (!eng.architectOpen) return null;

  const { blueprint, approveArchitectAndBuild, rejectArchitect } = eng;
  const analysis = shell.architectAnalysis;

  const sections = [
    { title: "Architecture", body: blueprint?.architecture },
    { title: "Folder Structure", body: blueprint?.folderStructure?.join("\n") },
    { title: "Database Schema", body: blueprint?.databaseSchema },
    { title: "API Plan", body: blueprint?.apiPlan },
    { title: "Authentication", body: blueprint?.authPlan },
    { title: "Deployment", body: blueprint?.deploymentPlan },
    { title: "Security", body: blueprint?.securityPlan },
    { title: "Testing", body: blueprint?.testingPlan },
    { title: "Performance", body: blueprint?.performancePlan },
  ];

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#12141c] shadow-2xl">
        <header className="border-b border-white/8 px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-100">AI Architect Plan</h2>
          <p className="mt-1 text-[10px] text-zinc-500">Review before code generation begins. One unified AI — eight specialists behind the scenes.</p>
          {analysis ? (
            <p className="mt-2 text-[11px] text-cyan-300/90">
              {analysis.title} · {analysis.domain_label} · DB: {analysis.database.recommended}
            </p>
          ) : null}
        </header>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
          {sections.map((s) => (
            <section key={s.title} className="rounded-lg border border-white/6 bg-white/[0.02] p-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{s.title}</h3>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-zinc-300">{s.body ?? "—"}</pre>
            </section>
          ))}
        </div>
        <footer className="flex justify-end gap-2 border-t border-white/8 px-5 py-4">
          <button type="button" onClick={rejectArchitect} className="flex items-center gap-1 rounded-lg px-4 py-2 text-[10px] text-zinc-400 hover:bg-white/5">
            <X className="h-3 w-3" /> Revise
          </button>
          <button
            type="button"
            onClick={approveArchitectAndBuild}
            className="flex items-center gap-1 rounded-lg bg-emerald-600/90 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-500"
          >
            <Check className="h-3 w-3" /> Approve & Generate
          </button>
        </footer>
      </div>
    </div>
  );
}
