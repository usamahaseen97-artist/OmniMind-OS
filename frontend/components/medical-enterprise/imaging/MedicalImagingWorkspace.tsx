"use client";

import { useEffect, useState } from "react";
import type { ImagingStudy } from "@/core/medical-enterprise/imaging/types";
import { medicalImagingPlatform } from "@/core/medical-enterprise/imaging";
import { getViewerEngine } from "@/core/medical-enterprise/imaging/viewer/ViewerEngine";
import { RadiologyViewer } from "./viewer/RadiologyViewer";
import { ImagingUploadZone } from "./upload/ImagingUploadZone";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

/**
 * Standalone Medical Imaging Workspace (Phase 3).
 * Does not modify Phase 1 layout — import where needed.
 */
export function MedicalImagingWorkspace({
  patientId,
  role = "radiologist",
}: {
  patientId: string;
  role?: ClinicalRole;
}) {
  const [studies, setStudies] = useState<ImagingStudy[]>([]);
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setStudies(medicalImagingPlatform.search({ patientId }, role));
  }, [patientId, role]);

  const activeStudy = studies.find((s) => s.id === activeStudyId) ?? studies[0];

  return (
    <div className={`flex h-full flex-col overflow-hidden bg-[#0a0f18] ${fullscreen ? "fixed inset-0 z-50" : ""}`}>
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div>
          <p className="text-[11px] font-semibold text-slate-200">Medical Imaging Platform</p>
          <p className="text-[9px] text-slate-500">DICOM · MRI · CT · AI Vision · 3D ready</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (activeStudy) getViewerEngine().setFullscreen(activeStudy.id, !fullscreen);
            setFullscreen(!fullscreen);
          }}
          className="rounded border border-white/[0.08] px-2 py-1 text-[9px] text-slate-400 hover:bg-white/[0.06]"
        >
          {fullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] gap-0">
        <aside className="overflow-y-auto border-r border-white/[0.06] p-2">
          <ImagingUploadZone
            patientId={patientId}
            role={role}
            onUploaded={(id) => {
              setStudies(medicalImagingPlatform.search({ patientId }, role));
              setActiveStudyId(id);
            }}
          />
          <ul className="mt-3 space-y-1">
            {studies.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveStudyId(s.id)}
                  className={`w-full rounded px-2 py-1.5 text-left text-[9px] ${
                    activeStudy?.id === s.id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-500 hover:bg-white/[0.04]"
                  }`}
                >
                  {s.modality.toUpperCase()} — {s.description}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="min-h-0 overflow-hidden">
          {activeStudy ? (
            <RadiologyViewer study={activeStudy} />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-slate-500">
              Upload or select a study
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
