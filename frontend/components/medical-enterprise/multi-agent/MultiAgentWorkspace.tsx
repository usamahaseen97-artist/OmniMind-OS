"use client";

import { useState } from "react";
import { useMedicalMultiAgent } from "@/lib/medical-enterprise/use-medical-multi-agent";
import { AgentCollaborationView } from "./agents/AgentCollaborationView";
import { ClinicalConversationPanel } from "./conversation/ClinicalConversationPanel";
import { VoiceDoctorPanel } from "./voice/VoiceDoctorPanel";
import { PatientInterviewPanel } from "./interview/PatientInterviewPanel";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

/**
 * Standalone Multi-Agent Intelligence Workspace (Phase 5).
 * Does not modify Phase 1 layout — import where needed.
 */
export function MultiAgentWorkspace({
  patientId,
  role = "physician",
}: {
  patientId: string;
  role?: ClinicalRole;
}) {
  const { loading, error, response, run, agents } = useMedicalMultiAgent(role);
  const [tab, setTab] = useState<"agents" | "conversation" | "voice" | "interview">("agents");

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0f18]">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div>
          <p className="text-[11px] font-semibold text-slate-200">Multi-Agent Intelligence Platform</p>
          <p className="text-[9px] text-slate-500">15 agents · Voice Doctor · Clinical CDS</p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void run(patientId)}
          className="rounded bg-violet-500/20 px-3 py-1 text-[9px] text-violet-200 hover:bg-violet-500/30 disabled:opacity-50"
        >
          {loading ? "Running…" : "Run multi-agent analysis"}
        </button>
      </header>

      <nav className="flex shrink-0 gap-1 border-b border-white/[0.06] px-2 py-1">
        {(["agents", "conversation", "voice", "interview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded px-2 py-0.5 text-[8px] capitalize ${tab === t ? "bg-white/[0.08] text-slate-200" : "text-slate-500"}`}
          >
            {t}
          </button>
        ))}
      </nav>

      {error && <p className="shrink-0 px-3 py-1 text-[8px] text-red-400">{error}</p>}

      <main className="min-h-0 flex-1 overflow-hidden">
        {tab === "agents" && <AgentCollaborationView response={response} />}
        {tab === "conversation" && <ClinicalConversationPanel patientId={patientId} role={role} />}
        {tab === "voice" && <VoiceDoctorPanel role={role} />}
        {tab === "interview" && <PatientInterviewPanel patientId={patientId} role={role} />}
      </main>

      <footer className="shrink-0 border-t border-white/[0.06] px-3 py-1 text-[7px] text-slate-600">
        {agents.length} agents · Clinician review required on all outputs
      </footer>
    </div>
  );
}
