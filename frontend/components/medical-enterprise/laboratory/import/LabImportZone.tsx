"use client";

import { useRef, useState } from "react";
import { medicalLaboratoryPlatform } from "@/core/medical-enterprise/laboratory";
import type { LaboratoryPanelKind } from "@/core/medical-enterprise/laboratory/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

export function LabImportZone({
  patientId,
  role = "physician",
  onImported,
}: {
  patientId: string;
  role?: ClinicalRole;
  onImported?: (reportId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setStatus("Importing…");
    for (const file of files) {
      try {
        const { report } = await medicalLaboratoryPlatform.import(file, patientId, role);
        setProgress(100);
        setStatus(`Imported ${file.name}`);
        onImported?.(report.id);
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Import failed");
      }
    }
  };

  return (
    <div
      className="rounded border border-dashed border-white/[0.1] bg-white/[0.02] p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void handleFiles(e.dataTransfer.files);
      }}
    >
      <p className="text-[9px] font-medium text-slate-300">Lab Import</p>
      <p className="mt-0.5 text-[8px] text-slate-500">PDF · CSV · FHIR · HL7 · Batch</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 w-full rounded bg-cyan-500/15 px-2 py-1 text-[9px] text-cyan-200 hover:bg-cyan-500/25"
      >
        Choose file
      </button>
      <input ref={inputRef} type="file" className="hidden" accept=".pdf,.csv,.json,.hl7,.txt" multiple onChange={(e) => void handleFiles(e.target.files)} />
      {status && <p className="mt-2 text-[8px] text-slate-400">{status}</p>}
      {progress > 0 && progress < 100 && (
        <div className="mt-1 h-1 overflow-hidden rounded bg-white/[0.06]">
          <div className="h-full bg-cyan-500/50" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export function ManualLabEntry({
  patientId,
  role = "physician",
  panelKind = "cbc",
  onSaved,
}: {
  patientId: string;
  role?: ClinicalRole;
  panelKind?: LaboratoryPanelKind;
  onSaved?: () => void;
}) {
  const save = () => {
    medicalLaboratoryPlatform.service().manualEntry(
      patientId,
      panelKind,
      [{ analyte: "WBC", value: 7.2, unit: "10³/µL" }],
      new Date().toISOString(),
      role,
    );
    onSaved?.();
  };

  return (
    <button type="button" onClick={save} className="mt-2 w-full rounded border border-white/[0.08] px-2 py-1 text-[8px] text-slate-400 hover:bg-white/[0.04]">
      + Manual CBC entry
    </button>
  );
}
