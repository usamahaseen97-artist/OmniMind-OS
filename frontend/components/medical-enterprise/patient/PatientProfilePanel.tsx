"use client";

import { useEffect, useState } from "react";
import { patientService, timelineService } from "../../../core/medical-enterprise/services";
import type { PatientProfile, ClinicalTimelineEvent } from "../../../lib/medical-enterprise/types";
import type { WorkspaceViewMode } from "../../../lib/medical-enterprise/types";
import { cn } from "../../../lib/utils";

export function PatientProfilePanel({
  patientId,
  viewMode,
}: {
  patientId: string | null;
  viewMode: WorkspaceViewMode;
}) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [timeline, setTimeline] = useState<ClinicalTimelineEvent[]>([]);

  useEffect(() => {
    if (!patientId) return;
    void patientService.getById(patientId).then(setProfile);
    void timelineService.getForPatient(patientId).then(setTimeline);
  }, [patientId]);

  if (!patientId || !profile) {
    return (
      <div className="flex h-full items-center justify-center text-[11px] text-slate-500">
        Select a patient to view profile
      </div>
    );
  }

  const sections = [
    { title: "Allergies", items: profile.allergies },
    { title: "Current Medications", items: profile.currentMedications },
    { title: "Previous Diagnoses", items: profile.previousDiagnoses },
    { title: "Family History", items: profile.familyHistory },
    { title: "Vaccinations", items: profile.vaccinations },
    { title: "Previous Surgeries", items: profile.previousSurgeries },
  ];

  return (
    <div
      className={cn(
        "h-full overflow-y-auto p-3",
        viewMode === "split" && "grid grid-cols-2 gap-3 overflow-hidden",
        viewMode === "comparison" && "grid grid-cols-2 gap-3",
      )}
    >
      <div className="space-y-3">
        <header className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
          <h2 className="text-[13px] font-semibold text-slate-100">
            {profile.lastName}, {profile.firstName}
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            {profile.mrn} · DOB {profile.dateOfBirth} · {profile.sex}
            {profile.bloodType ? ` · ${profile.bloodType}` : ""}
          </p>
          <p className="text-[10px] text-slate-500">
            {profile.department}
            {profile.attendingPhysician ? ` · ${profile.attendingPhysician}` : ""}
          </p>
        </header>

        <div className="grid gap-2 sm:grid-cols-2">
          {sections.map((s) => (
            <div key={s.title} className="rounded-lg border border-white/[0.06] bg-black/20 p-2">
              <h3 className="text-[9px] font-semibold uppercase tracking-wide text-emerald-400/80">{s.title}</h3>
              <ul className="mt-1 space-y-0.5">
                {s.items.length ? (
                  s.items.map((item, i) => (
                    <li key={i} className="text-[10px] text-slate-400">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-[10px] text-slate-600">None recorded</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-black/20 p-2">
          <h3 className="text-[9px] font-semibold uppercase tracking-wide text-emerald-400/80">Emergency Contacts</h3>
          {profile.emergencyContacts.map((c, i) => (
            <p key={i} className="mt-1 text-[10px] text-slate-400">
              {c.name} ({c.relation}) — {c.phone}
            </p>
          ))}
        </div>
      </div>

      {(viewMode === "timeline" || viewMode === "split" || viewMode === "comparison") && (
        <div className="rounded-lg border border-white/[0.06] bg-black/20 p-2">
          <h3 className="text-[9px] font-semibold uppercase tracking-wide text-cyan-400/80">Clinical Timeline</h3>
          <ol className="mt-2 space-y-2">
            {timeline.map((e) => (
              <li key={e.id} className="border-l-2 border-cyan-500/30 pl-2">
                <p className="text-[10px] font-medium text-slate-300">{e.title}</p>
                <p className="text-[9px] text-slate-500">{e.timestamp}</p>
                <p className="text-[9px] text-slate-600">{e.summary}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="rounded-lg border border-dashed border-white/[0.08] p-3 sm:col-span-2">
        <h3 className="text-[9px] font-semibold uppercase text-slate-500">Clinical Report Editor</h3>
        <textarea
          className="mt-2 h-24 w-full resize-none rounded border border-white/[0.08] bg-black/30 p-2 text-[10px] text-slate-300 outline-none focus:border-emerald-500/30"
          placeholder="Document clinical findings and plan…"
          aria-label="Clinical report editor"
        />
        <p className="mt-1 text-[8px] text-slate-600">AI recommendation panel connects in future phase.</p>
      </div>
    </div>
  );
}
