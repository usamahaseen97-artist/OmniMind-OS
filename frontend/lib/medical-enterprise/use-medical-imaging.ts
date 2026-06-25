"use client";

import { useCallback, useState } from "react";
import { medicalImagingPlatform } from "../../core/medical-enterprise/imaging";
import type { ImagingStudy, ViewerState } from "../../core/medical-enterprise/imaging/types";
import type { ClinicalRole } from "./types";

/** Hook for medical imaging platform — UI-agnostic */
export function useMedicalImaging(patientId: string, role: ClinicalRole = "radiologist") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studies, setStudies] = useState<ImagingStudy[]>([]);

  const refresh = useCallback(() => {
    setStudies(medicalImagingPlatform.search({ patientId }, role));
  }, [patientId, role]);

  const upload = useCallback(
    async (file: File, modality?: ImagingStudy["modality"]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await medicalImagingPlatform.upload(file, patientId, role, modality);
        refresh();
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [patientId, role, refresh],
  );

  const analyze = useCallback(
    async (studyId: string) => {
      setLoading(true);
      try {
        return await medicalImagingPlatform.analyze(studyId, role);
      } finally {
        setLoading(false);
      }
    },
    [role],
  );

  const saveViewerState = useCallback(
    (state: ViewerState) => medicalImagingPlatform.service().saveViewerState(state, role),
    [role],
  );

  return { loading, error, studies, refresh, upload, analyze, saveViewerState };
}
