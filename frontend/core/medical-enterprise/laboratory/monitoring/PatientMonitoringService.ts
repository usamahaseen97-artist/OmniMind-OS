import type { VitalReading, DeviceSession, MonitoringDashboardState, MonitoringEvent } from "../types";
import { getVitalsStreamEngine } from "./VitalsStreamEngine";
import { getTrendAnalysisEngine } from "../trends/TrendAnalysisEngine";
import { getAlertEngine } from "../alerts/AlertEngine";
import { getLabAIEngine } from "../ai-engine/LabAIEngine";

/** Patient monitoring orchestration */
export class PatientMonitoringService {
  private events: MonitoringEvent[] = [];
  private sessions = new Map<string, DeviceSession>();

  recordVital(reading: Omit<VitalReading, "id">): VitalReading {
    const full: VitalReading = { ...reading, id: `vital-${Date.now()}` };
    getVitalsStreamEngine().push(full);
    getAlertEngine().evaluateVital(full);
    this.events.unshift({
      id: `evt-${Date.now()}`,
      patientId: full.patientId,
      type: "vital-reading",
      timestamp: full.recordedAt,
      payload: { type: full.type, value: full.value },
    });
    return full;
  }

  registerSession(session: DeviceSession) {
    this.sessions.set(session.id, session);
    this.events.unshift({
      id: `evt-${Date.now()}`,
      patientId: session.patientId,
      type: session.status === "disconnected" ? "device-disconnect" : "device-connect",
      timestamp: new Date().toISOString(),
      payload: { deviceId: session.deviceId, status: session.status },
    });
    if (session.status === "disconnected") {
      getAlertEngine().triggerDeviceDisconnect(session.patientId, session.deviceId);
    }
  }

  getDashboard(patientId: string): MonitoringDashboardState {
    const vitals = getVitalsStreamEngine().getTimeline(patientId);
    const labTrends = getTrendAnalysisEngine().getTrends(patientId);
    const activeAlerts = getAlertEngine().getActiveAlerts(patientId);
    const deviceSessions = [...this.sessions.values()].filter((s) => s.patientId === patientId);
    const recentObservations = getLabAIEngine().getObservationsByPatient(patientId);

    return {
      patientId,
      vitalsTimeline: vitals,
      labTrends,
      activeAlerts,
      deviceSessions,
      recentObservations: recentObservations.slice(0, 10),
      riskOverview: activeAlerts.some((a) => a.severity === "critical" || a.severity === "emergency")
        ? { level: "elevated", factors: activeAlerts.map((a) => a.title) }
        : { level: "routine", factors: [] },
      lastUpdated: new Date().toISOString(),
    };
  }

  getEvents(patientId: string, limit = 50) {
    return this.events.filter((e) => e.patientId === patientId).slice(0, limit);
  }
}

let service: PatientMonitoringService | null = null;

export function getPatientMonitoringService() {
  if (!service) service = new PatientMonitoringService();
  return service;
}
