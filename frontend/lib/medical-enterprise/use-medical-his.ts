"use client";

import { useCallback, useState } from "react";
import { medicalHISPlatform } from "@/core/medical-enterprise/his";
import type { HospitalDashboardMetrics, EMRRecord } from "@/core/medical-enterprise/his/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

const DEFAULT_HOSPITAL = "hospital-default";

/** Hook for HIS platform — UI-agnostic */
export function useMedicalHIS(role: ClinicalRole = "admin") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<HospitalDashboardMetrics | null>(null);
  const [emr, setEmr] = useState<EMRRecord | null>(null);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const d = await medicalHISPlatform.dashboard(DEFAULT_HOSPITAL, role);
      setDashboard(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dashboard failed");
    } finally {
      setLoading(false);
    }
  }, [role]);

  const loadEMR = useCallback(
    async (patientId: string) => {
      setLoading(true);
      try {
        const record = await medicalHISPlatform.emr(patientId, role);
        setEmr(record);
        return record;
      } catch (e) {
        setError(e instanceof Error ? e.message : "EMR load failed");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [role],
  );

  return { loading, error, dashboard, emr, refreshDashboard, loadEMR, analytics: () => medicalHISPlatform.analytics(DEFAULT_HOSPITAL, role) };
}
