"use client";

import { useCallback, useState } from "react";
import { medicalProductionPlatform } from "@/core/medical-enterprise/production";
import type { AdminDashboardState, HealthDashboard } from "@/core/medical-enterprise/production/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

export function useMedicalProduction(role: ClinicalRole = "admin") {
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState<AdminDashboardState | null>(null);
  const [health, setHealth] = useState<HealthDashboard | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboard, healthData] = await Promise.all([
        medicalProductionPlatform.admin(role),
        medicalProductionPlatform.health(role),
      ]);
      setAdmin(dashboard);
      setHealth(healthData);
    } finally {
      setLoading(false);
    }
  }, [role]);

  return {
    loading,
    admin,
    health,
    refresh,
    qa: () => medicalProductionPlatform.qa(role),
    aiQuality: () => medicalProductionPlatform.aiQuality(role),
  };
}
