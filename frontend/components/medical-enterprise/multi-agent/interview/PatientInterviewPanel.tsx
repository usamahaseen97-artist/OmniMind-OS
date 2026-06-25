"use client";

import { useState } from "react";
import { medicalMultiAgentPlatform } from "@/core/medical-enterprise/multi-agent";
import { getPatientInterviewEngine } from "@/core/medical-enterprise/multi-agent/interview/PatientInterviewEngine";
import type { PatientInterviewSession } from "@/core/medical-enterprise/multi-agent/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

export function PatientInterviewPanel({
  patientId,
  role = "physician",
}: {
  patientId: string;
  role?: ClinicalRole;
}) {
  const [session, setSession] = useState<PatientInterviewSession | null>(null);
  const [answer, setAnswer] = useState("");

  const start = () => {
    setSession(medicalMultiAgentPlatform.startInterview(patientId, role));
  };

  const sec = session ? getPatientInterviewEngine().getCurrentSection(session.id) : null;

  const submit = () => {
    if (!session || !sec || !answer.trim()) return;
    const updated = medicalMultiAgentPlatform.service().recordInterviewResponse(session.id, sec.id, sec.prompt, answer, role);
    setSession(updated);
    setAnswer("");
  };

  return (
    <div className="p-2">
      <p className="text-[9px] font-medium text-slate-300">Patient Interview</p>
      {!session ? (
        <button type="button" onClick={start} className="mt-2 rounded bg-cyan-500/15 px-2 py-1 text-[8px] text-cyan-200">
          Start guided interview
        </button>
      ) : (
        <>
          <div className="mt-1 h-1 overflow-hidden rounded bg-white/[0.06]">
            <div className="h-full bg-cyan-500/50" style={{ width: `${session.progress}%` }} />
          </div>
          {sec ? (
            <div className="mt-2">
              <p className="text-[8px] font-medium text-slate-400">{sec.label}</p>
              <p className="text-[8px] text-slate-500">{sec.prompt}</p>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="mt-1 w-full rounded border border-white/[0.08] bg-transparent px-2 py-1 text-[9px] text-slate-300"
              />
              <button type="button" onClick={submit} className="mt-1 rounded bg-white/[0.06] px-2 py-0.5 text-[8px] text-slate-400">
                Next
              </button>
            </div>
          ) : (
            <p className="mt-2 text-[8px] text-emerald-400">Interview complete</p>
          )}
        </>
      )}
    </div>
  );
}
