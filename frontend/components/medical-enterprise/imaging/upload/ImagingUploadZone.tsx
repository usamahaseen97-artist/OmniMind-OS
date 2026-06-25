"use client";

import { useCallback, useState } from "react";
import type { ImagingModality } from "@/core/medical-enterprise/imaging/types";
import { IMAGING_MODALITY_REGISTRY } from "@/core/medical-enterprise/imaging/modalities/registry";
import { medicalImagingPlatform } from "@/core/medical-enterprise/imaging";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

export function ImagingUploadZone({
  patientId,
  role = "radiologist",
  onUploaded,
}: {
  patientId: string;
  role?: ClinicalRole;
  onUploaded?: (studyId: string) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [modality, setModality] = useState<ImagingModality>("dicom");

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setStatus("Uploading…");
      for (const file of Array.from(files)) {
        const result = await medicalImagingPlatform.upload(file, patientId, role, modality);
        setProgress(result.job.progress);
        if (result.study) {
          setStatus(`Study ${result.study.id} ready`);
          onUploaded?.(result.study.id);
        } else if (result.job.status === "duplicate") {
          setStatus("Duplicate detected");
        }
      }
    },
    [patientId, role, modality, onUploaded],
  );

  return (
    <div className="rounded-lg border border-dashed border-cyan-500/30 bg-cyan-500/[0.02] p-4">
      <p className="text-[10px] font-medium text-slate-300">Imaging Upload</p>
      <p className="mt-1 text-[9px] text-slate-500">Drag & drop · folder · chunked · background processing</p>
      <select
        value={modality}
        onChange={(e) => setModality(e.target.value as ImagingModality)}
        className="mt-2 rounded border border-white/[0.08] bg-black/30 px-2 py-1 text-[9px] text-slate-300"
        aria-label="Imaging modality"
      >
        {IMAGING_MODALITY_REGISTRY.map((m: (typeof IMAGING_MODALITY_REGISTRY)[number]) => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>
      <div
        className="mt-3 flex min-h-[80px] cursor-pointer items-center justify-center rounded border border-white/[0.06] bg-black/20 text-[9px] text-slate-500 hover:border-cyan-500/30"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <label className="cursor-pointer">
          Drop files or click to upload
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </label>
      </div>
      {status ? <p className="mt-2 text-[9px] text-emerald-400/80">{status} {progress ? `(${progress}%)` : ""}</p> : null}
    </div>
  );
}
