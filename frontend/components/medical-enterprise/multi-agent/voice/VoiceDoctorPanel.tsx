"use client";

import { useState } from "react";
import { medicalMultiAgentPlatform } from "@/core/medical-enterprise/multi-agent";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

export function VoiceDoctorPanel({ role = "physician" }: { role?: ClinicalRole }) {
  const [status, setStatus] = useState<string>("Idle");
  const [transcript, setTranscript] = useState<string>("");

  const start = async () => {
    const sid = `voice-${Date.now()}`;
    const result = await medicalMultiAgentPlatform.service().startVoiceSession(sid, role, {
      medicalTerminologyBoost: true,
      dictationMode: "clinical",
    });
    setStatus(result.status);
  };

  const simulateDictation = async () => {
    const result = await medicalMultiAgentPlatform.service().transcribe(new ArrayBuffer(0), role);
    setTranscript(result.text);
    const cmd = medicalMultiAgentPlatform.service().parseVoiceCommand(result.text);
    if (cmd) setStatus(`Command: ${cmd.command}`);
  };

  return (
    <div className="p-2">
      <p className="text-[9px] font-medium text-slate-300">Voice Doctor</p>
      <p className="text-[8px] text-slate-500">STT · TTS · Dictation · Hands-free</p>
      <div className="mt-2 flex gap-1">
        <button type="button" onClick={() => void start()} className="rounded bg-violet-500/15 px-2 py-1 text-[8px] text-violet-200">
          Start session
        </button>
        <button type="button" onClick={() => void simulateDictation()} className="rounded border border-white/[0.08] px-2 py-1 text-[8px] text-slate-400">
          Simulate STT
        </button>
      </div>
      <p className="mt-2 text-[8px] text-slate-500">Status: {status}</p>
      {transcript && <p className="mt-1 text-[8px] text-slate-400">{transcript}</p>}
    </div>
  );
}
