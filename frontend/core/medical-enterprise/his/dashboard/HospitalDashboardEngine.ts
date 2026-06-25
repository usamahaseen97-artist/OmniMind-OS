import type { HospitalDashboardMetrics, HospitalId } from "../types";

/** Executive hospital dashboard — aggregates operational metrics */
export class HospitalDashboardEngine {
  private metricsCache = new Map<HospitalId, HospitalDashboardMetrics>();

  compute(hospitalId: HospitalId, context: Partial<HospitalDashboardMetrics> = {}): HospitalDashboardMetrics {
    const metrics: HospitalDashboardMetrics = {
      hospitalId,
      activePatients: context.activePatients ?? 42,
      admissionsToday: context.admissionsToday ?? 8,
      dischargesToday: context.dischargesToday ?? 5,
      emergencyCases: context.emergencyCases ?? 3,
      icuOccupancy: context.icuOccupancy ?? { occupied: 12, total: 16, percent: 75 },
      operationTheaters: context.operationTheaters ?? { active: 2, total: 4 },
      appointmentsToday: context.appointmentsToday ?? 34,
      staffOnDuty: context.staffOnDuty ?? 28,
      beds: context.beds ?? { available: 18, occupied: 82, total: 100 },
      aiAlerts: context.aiAlerts ?? 0,
      systemHealth: context.systemHealth ?? "healthy",
      lastUpdated: new Date().toISOString(),
    };
    this.metricsCache.set(hospitalId, metrics);
    return metrics;
  }

  getCached(hospitalId: HospitalId) {
    return this.metricsCache.get(hospitalId);
  }
}

let engine: HospitalDashboardEngine | null = null;

export function getHospitalDashboardEngine() {
  if (!engine) engine = new HospitalDashboardEngine();
  return engine;
}
