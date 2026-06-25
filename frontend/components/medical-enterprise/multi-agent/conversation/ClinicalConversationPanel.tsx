"use client";

import { useState } from "react";
import { medicalMultiAgentPlatform } from "@/core/medical-enterprise/multi-agent";
import type { ClinicalConversationSession } from "@/core/medical-enterprise/multi-agent/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

export function ClinicalConversationPanel({
  patientId,
  role = "physician",
}: {
  patientId: string;
  role?: ClinicalRole;
}) {
  const [session, setSession] = useState<ClinicalConversationSession | null>(null);
  const [input, setInput] = useState("");

  const start = () => {
    const s = medicalMultiAgentPlatform.createConversation(patientId, role, role);
    setSession(s);
  };

  const send = () => {
    if (!session || !input.trim()) return;
    medicalMultiAgentPlatform.sendMessage(session.id, input, role);
    setSession(medicalMultiAgentPlatform.service().getConversation(session.id, role) ?? session);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      {!session ? (
        <button type="button" onClick={start} className="m-2 rounded bg-cyan-500/15 px-2 py-1 text-[9px] text-cyan-200">
          Start clinical conversation
        </button>
      ) : (
        <>
          <ul className="flex-1 space-y-1 overflow-y-auto p-2">
            {session.messages.map((m) => (
              <li key={m.id} className={`rounded px-2 py-1 text-[8px] ${m.role === "clinician" ? "bg-white/[0.04] text-slate-300" : "text-slate-500"}`}>
                <span className="text-[7px] uppercase text-slate-600">{m.role}</span> {m.content}
              </li>
            ))}
          </ul>
          <div className="flex gap-1 border-t border-white/[0.06] p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask follow-up…"
              className="flex-1 rounded border border-white/[0.08] bg-transparent px-2 py-1 text-[9px] text-slate-300"
            />
            <button type="button" onClick={send} className="rounded bg-white/[0.06] px-2 text-[9px] text-slate-400">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
