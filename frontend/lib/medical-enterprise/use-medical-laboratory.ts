"use client";

import { useCallback, useState } from "react";
import { medicalLaboratoryPlatform } from "@/core/medical-enterprise/laboratory";
import type { LabReport, MonitoringDashboardState, VitalReading } from "@/core/medical-enterprise/laboratory/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

/** Hook for laboratory & monitoring platform — UI-agnostic */
export function useMedicalLaboratory(patientId: string, role: ClinicalRole = "physician") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [dashboard, setDashboard] = useState<MonitoringDashboardState | null>(null);

  const refresh = useCallback(() => {
    setReports(medicalLaboratoryPlatform.search({ patientId }, role));
    setDashboard(medicalLaboratoryPlatform.dashboard(patientId, role));
  }, [patientId, role]);

  const importFile = useCallback(
    async (file: File, panelKind?: LabReport["panelKind"]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await medicalLaboratoryPlatform.import(file, patientId, role, undefined, panelKind);
        refresh();
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Import failed");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [patientId, role, refresh],
  );

  const analyze = useCallback(
    async (reportId: string) => {
      setLoading(true);
      try {
        const obs = await medicalLaboratoryPlatform.analyze(reportId, role);
        refresh();
        return obs;
      } finally {
        setLoading(false);
      }
    },
    [role, refresh],
  );

  const recordVital = useCallback(
    (reading: Omit<VitalReading, "id" | "patientId">) => {
      const result = medicalLaboratoryPlatform.recordVital({ ...reading, patientId }, role);
      refresh();
      return result;
    },
    [patientId, role, refresh],
  );

  return { loading, error, reports, dashboard, refresh, importFile, analyze, recordVital };
}
