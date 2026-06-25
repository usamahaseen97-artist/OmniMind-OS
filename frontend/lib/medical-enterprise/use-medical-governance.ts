"use client";

import { useCallback, useState } from "react";
import { medicalGovernancePlatform } from "@/core/medical-enterprise/governance";
import type { SecurityDashboardMetrics, UnifiedAuditEvent } from "@/core/medical-enterprise/governance/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

export function useMedicalGovernance(role: ClinicalRole = "admin") {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<SecurityDashboardMetrics | null>(null);
  const [audit, setAudit] = useState<UnifiedAuditEvent[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setDashboard(medicalGovernancePlatform.dashboard(role));
      setAudit(await medicalGovernancePlatform.audit(role));
    } finally {
      setLoading(false);
    }
  }, [role]);

  return { loading, dashboard, audit, refresh, compliance: () => medicalGovernancePlatform.compliance(role) };
}
