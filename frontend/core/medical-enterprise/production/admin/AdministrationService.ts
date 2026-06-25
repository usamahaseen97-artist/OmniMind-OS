import type { AdminDashboardState } from "../types";
import { getObservabilityHub } from "../observability/ObservabilityHub";
import { getAIQualityControl } from "../ai-quality/AIQualityControl";

/** Administrator dashboard — federates Phase 7 governance + Phase 8 observability */
export class AdministrationService {
  async getDashboard(): Promise<AdminDashboardState> {
    const observability = await getObservabilityHub().getSnapshot();
    const aiMetrics = getAIQualityControl().getMetrics();

    let integrations: AdminDashboardState["integrations"] = [];
    try {
      const { getInteropHub } = await import("../../his/interoperability/InteropHub");
      integrations = getInteropHub().list().map((c) => ({
        name: c.name,
        status: (c.enabled ? "healthy" : "unknown") as AdminDashboardState["integrations"][0]["status"],
      }));
    } catch { /* optional */ }

    return {
      systemHealth: observability.health,
      observability,
      aiUsage: {
        requests24h: aiMetrics.totalRecommendations,
        tokensEstimate: aiMetrics.totalRecommendations * 1200,
        agentsActive: 12,
      },
      storage: { usedGb: 42, totalGb: 500, imagingGb: 28, emrGb: 8 },
      licenses: { seats: 100, used: 34 },
      integrations,
    };
  }
}

let service: AdministrationService | null = null;

export function getAdministrationService() {
  if (!service) service = new AdministrationService();
  return service;
}
