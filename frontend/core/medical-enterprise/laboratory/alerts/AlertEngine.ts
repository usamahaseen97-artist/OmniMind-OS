import type { MonitoringAlert, AlertCategory, AlertSeverity, EscalationRule, VitalReading, LabReport } from "../types";

const DEFAULT_RULES: EscalationRule[] = [
  { id: "rule-critical-lab", name: "Critical Lab Value", category: "critical-lab", severity: "critical", condition: "critical flag", escalationDelayMinutes: 15, notifyRoles: ["physician", "nurse"], enabled: true },
  { id: "rule-vital-trend", name: "Abnormal Vital Trend", category: "vital-trend", severity: "warning", condition: "3 consecutive abnormal", escalationDelayMinutes: 30, notifyRoles: ["nurse"], enabled: true },
  { id: "rule-device", name: "Device Disconnect", category: "device-disconnect", severity: "info", condition: "heartbeat timeout", escalationDelayMinutes: 5, notifyRoles: ["nurse"], enabled: true },
  { id: "rule-followup", name: "Missing Follow-up", category: "missing-follow-up", severity: "warning", condition: "overdue lab order", escalationDelayMinutes: 1440, notifyRoles: ["physician"], enabled: true },
];

/** Configurable clinical alert engine */
export class AlertEngine {
  private alerts: MonitoringAlert[] = [];
  private rules = new Map<string, EscalationRule>();

  constructor() {
    for (const r of DEFAULT_RULES) this.rules.set(r.id, r);
  }

  trigger(input: Omit<MonitoringAlert, "id" | "triggeredAt" | "escalationLevel">) {
    const alert: MonitoringAlert = {
      ...input,
      id: `alert-${Date.now()}`,
      triggeredAt: new Date().toISOString(),
      escalationLevel: 0,
    };
    this.alerts.unshift(alert);
    return alert;
  }

  evaluateVital(reading: VitalReading) {
    const thresholds: Partial<Record<VitalReading["type"], { low?: number; high?: number }>> = {
      "heart-rate": { low: 50, high: 120 },
      spo2: { low: 92 },
      "blood-pressure": { high: 180 },
      "blood-glucose": { low: 60, high: 250 },
    };
    const t = thresholds[reading.type];
    const num = typeof reading.value === "number" ? reading.value : parseFloat(String(reading.value));
    if (!t || isNaN(num)) return;

    if ((t.low !== undefined && num < t.low) || (t.high !== undefined && num > t.high)) {
      this.trigger({
        patientId: reading.patientId,
        category: "vital-trend",
        severity: num < (t.low ?? 0) || num > (t.high ?? 999) ? "warning" : "info",
        title: `Abnormal ${reading.type}`,
        message: `${reading.type} reading ${num} ${reading.unit ?? ""} — requires clinician review`.trim(),
        sourceRef: reading.id,
      });
    }
  }

  evaluateLabReport(report: LabReport) {
    const critical = report.values.filter((v) => v.flag === "critical-low" || v.flag === "critical-high");
    for (const v of critical) {
      this.trigger({
        patientId: report.patientId,
        category: "critical-lab",
        severity: "critical",
        title: `Critical lab: ${v.analyte}`,
        message: `${v.analyte} = ${v.value} ${v.unit ?? ""} — immediate clinician review recommended`.trim(),
        sourceRef: report.id,
      });
    }
  }

  triggerDeviceDisconnect(patientId: string, deviceId: string) {
    const rule = [...this.rules.values()].find((r) => r.category === "device-disconnect" && r.enabled);
    if (!rule) return;
    this.trigger({
      patientId,
      category: "device-disconnect",
      severity: "info",
      title: "Device disconnected",
      message: `Device ${deviceId} lost connection`,
      sourceRef: deviceId,
    });
  }

  acknowledge(alertId: string, acknowledgedBy: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) throw new Error("Alert not found");
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = acknowledgedBy;
    return alert;
  }

  resolve(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) throw new Error("Alert not found");
    alert.resolvedAt = new Date().toISOString();
    return alert;
  }

  getActiveAlerts(patientId?: string) {
    return this.alerts.filter((a) => !a.resolvedAt && (!patientId || a.patientId === patientId));
  }

  getRules() {
    return [...this.rules.values()];
  }

  updateRule(rule: EscalationRule) {
    this.rules.set(rule.id, rule);
  }
}

let engine: AlertEngine | null = null;

export function getAlertEngine() {
  if (!engine) engine = new AlertEngine();
  return engine;
}

export type { AlertCategory, AlertSeverity };
