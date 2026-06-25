import type { LabReport, LabSearchQuery, LabResultValue, LaboratoryPanelKind, VitalReading } from "../types";
import { getLabImportPipeline } from "../pipeline/LabImportPipeline";
import { getLabProcessingPipeline } from "../pipeline/ProcessingPipeline";
import { getLabAIEngine } from "../ai-engine/LabAIEngine";
import { getTrendAnalysisEngine } from "../trends/TrendAnalysisEngine";
import { getPatientMonitoringService } from "../monitoring/PatientMonitoringService";
import { getVitalsStreamEngine } from "../monitoring/VitalsStreamEngine";
import { getDeviceRegistry } from "../devices/DeviceRegistry";
import { getAlertEngine } from "../alerts/AlertEngine";
import { getLaboratoryAccessControl } from "../security/LaboratoryAccessControl";
import { getLaboratoryBrainBridge, getClinicalAILabBridge } from "../bridge/LaboratoryBrainBridge";
import { getAnalysisCache } from "../performance/AnalysisCache";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { LabPanelInput, LabPanelKind } from "../../clinical-intelligence/types";

function toPhase2Kind(kind: LaboratoryPanelKind): LabPanelKind | null {
  const supported: LabPanelKind[] = ["cbc", "cmp", "lipid", "liver-function", "kidney-function", "blood-glucose", "hba1c", "thyroid", "inflammatory-markers", "urinalysis"];
  return supported.includes(kind as LabPanelKind) ? (kind as LabPanelKind) : null;
}

/** Unified laboratory & monitoring platform service facade */
export class LaboratoryService {
  private reports = new Map<string, LabReport>();
  private ac = getLaboratoryAccessControl();
  private brain = getLaboratoryBrainBridge();
  private clinical = getClinicalAILabBridge();
  private monitoring = getPatientMonitoringService();

  async importFile(file: File, patientId: string, role: ClinicalRole, format?: LabReport["source"], panelKind?: LaboratoryPanelKind) {
    this.ac.assert(role, "lab:import");
    const importPipeline = getLabImportPipeline();
    const fmt = format ?? (file.name.endsWith(".csv") ? "csv" : file.name.endsWith(".json") ? "fhir" : "pdf");
    const job = importPipeline.initImport({ patientId, format: fmt, fileName: file.name, fileSize: file.size, panelKind });

    const buffer = await file.arrayBuffer();
    const chunks = job.chunksTotal ?? 1;
    for (let i = 0; i < chunks; i++) {
      const start = i * (buffer.byteLength / chunks);
      const end = Math.min(buffer.byteLength, start + buffer.byteLength / chunks);
      await importPipeline.uploadChunk(job.id, i, buffer.slice(start, end));
    }

    const validation = importPipeline.validate(job.id);
    if (!validation.valid) throw new Error(validation.errors.join("; "));

    let values: LabResultValue[] = [];
    let resolvedKind = panelKind ?? "custom-panel";
    if (fmt === "csv") {
      const parsed = importPipeline.parseCSV(new TextDecoder().decode(buffer));
      values = parsed.values.map((v) => ({ ...v, flag: "unknown" as const }));
      resolvedKind = panelKind ?? parsed.panelKind;
    }

    const processing = getLabProcessingPipeline();
    const report = processing.createReportFromValues(patientId, resolvedKind, values, fmt);
    const procJob = processing.createJob(report.id, job.id);
    await processing.run(procJob.id);

    const normalized = getLabAIEngine().normalizeReport(report);
    this.reports.set(report.id, normalized);
    getTrendAnalysisEngine().ingestReport(normalized);
    getAlertEngine().evaluateLabReport(normalized);
    importPipeline.complete(job.id, report.id);
    this.brain.registerReport(report.id, patientId, report.panelKind);
    this.ac.audit({ actorId: "current-user", action: "lab.import", resourceType: "import", resourceId: report.id, patientId });

    return { job, report: normalized, processingJob: procJob };
  }

  manualEntry(patientId: string, panelKind: LaboratoryPanelKind, values: LabResultValue[], collectedAt: string, role: ClinicalRole) {
    this.ac.assert(role, "lab:import");
    const processing = getLabProcessingPipeline();
    const report = processing.createReportFromValues(patientId, panelKind, values, "manual");
    report.collectedAt = collectedAt;
    const normalized = getLabAIEngine().normalizeReport(report);
    this.reports.set(report.id, normalized);
    getTrendAnalysisEngine().ingestReport(normalized);
    getAlertEngine().evaluateLabReport(normalized);
    this.brain.registerReport(report.id, patientId, panelKind);
    return normalized;
  }

  getReport(reportId: string, role: ClinicalRole) {
    this.ac.assert(role, "lab:read");
    return this.reports.get(reportId);
  }

  search(query: LabSearchQuery, role: ClinicalRole) {
    this.ac.assert(role, "lab:read");
    let results = [...this.reports.values()];
    if (query.patientId) results = results.filter((r) => r.patientId === query.patientId);
    if (query.panelKind) results = results.filter((r) => r.panelKind === query.panelKind);
    if (query.status) results = results.filter((r) => r.status === query.status);
    if (query.from) results = results.filter((r) => r.collectedAt >= query.from!);
    if (query.to) results = results.filter((r) => r.collectedAt <= query.to!);
    if (query.q) {
      const q = query.q.toLowerCase();
      results = results.filter((r) => r.values.some((v) => v.analyte.toLowerCase().includes(q)));
    }
    return results;
  }

  getTrends(patientId: string, role: ClinicalRole, analyte?: string) {
    this.ac.assert(role, "lab:read");
    return getTrendAnalysisEngine().getTrends(patientId, analyte);
  }

  recordVital(reading: Omit<VitalReading, "id">, role: ClinicalRole) {
    this.ac.assert(role, "vitals:write");
    const result = this.monitoring.recordVital(reading);
    this.brain.rememberVitalTrend(reading.patientId, reading.type, reading.value);
    this.ac.audit({ actorId: "current-user", action: "vitals.record", resourceType: "vital", resourceId: result.id, patientId: reading.patientId });
    return result;
  }

  getVitalsTimeline(patientId: string, role: ClinicalRole) {
    this.ac.assert(role, "vitals:read");
    return getVitalsStreamEngine().getTimeline(patientId);
  }

  subscribeVitals(patientId: string, role: ClinicalRole) {
    this.ac.assert(role, "vitals:read");
    return getVitalsStreamEngine().subscribe(patientId);
  }

  async syncDevice(patientId: string, deviceId: string, role: ClinicalRole) {
    this.ac.assert(role, "vitals:write");
    const { session, readings } = await getDeviceRegistry().sync(patientId, deviceId);
    this.monitoring.registerSession(session);
    for (const r of readings) this.monitoring.recordVital(r);
    return { session, readings };
  }

  getMonitoringDashboard(patientId: string, role: ClinicalRole) {
    this.ac.assert(role, "monitoring:read");
    return this.monitoring.getDashboard(patientId);
  }

  getAlerts(patientId: string | undefined, role: ClinicalRole) {
    this.ac.assert(role, "monitoring:read");
    return getAlertEngine().getActiveAlerts(patientId);
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string, role: ClinicalRole) {
    this.ac.assert(role, "alerts:manage");
    return getAlertEngine().acknowledge(alertId, acknowledgedBy);
  }

  async runAIAnalysis(reportId: string, role: ClinicalRole) {
    this.ac.assert(role, "lab:ai");
    const report = this.reports.get(reportId);
    if (!report) throw new Error("Report not found");

    const cached = getAnalysisCache().get(reportId);
    if (cached) return cached;

    const observation = await getLabAIEngine().analyze(report);
    getAnalysisCache().set(reportId, observation);

    const phase2 = toPhase2Kind(report.panelKind);
    if (phase2) {
      const panel: LabPanelInput = {
        kind: phase2,
        collectedAt: report.collectedAt,
        values: report.values.map((v) => ({
          analyte: v.analyte, value: v.value, unit: v.unit, referenceRange: v.referenceRange,
          flag: v.flag === "critical-low" || v.flag === "critical-high" ? "critical" : v.flag === "low" ? "low" : v.flag === "high" ? "high" : v.flag === "normal" ? "normal" : "unknown",
        })),
      };
      await this.clinical.requestLabInterpretation(report.patientId, [panel]);
    }

    await this.brain.queueBrainProcessing(reportId, observation.summary);
    this.ac.audit({ actorId: "current-user", action: "lab.ai.analyze", resourceType: "report", resourceId: reportId, patientId: report.patientId });
    return observation;
  }

  async runVitalsAI(patientId: string, role: ClinicalRole) {
    this.ac.assert(role, "lab:ai");
    const recent = getVitalsStreamEngine().getRecent(patientId);
    const latest = recent[recent.length - 1];
    if (!latest) return null;
    const vitals = {
      heartRate: recent.find((r) => r.type === "heart-rate")?.value as number | undefined,
      spO2: recent.find((r) => r.type === "spo2")?.value as number | undefined,
      temperatureC: recent.find((r) => r.type === "temperature")?.value as number | undefined,
      recordedAt: latest.recordedAt,
    };
    return this.clinical.requestVitalsAnalysis(patientId, vitals);
  }

  exportReport(reportId: string, role: ClinicalRole) {
    this.ac.assert(role, "lab:export");
    this.ac.audit({ actorId: "current-user", action: "lab.export", resourceType: "export", resourceId: reportId });
    return { exportUrl: `/api/v1/medical-enterprise/laboratory/export/${reportId}`, format: "fhir" as const };
  }

  listDevices(role: ClinicalRole) {
    this.ac.assert(role, "vitals:read");
    return getDeviceRegistry().list();
  }
}

let service: LaboratoryService | null = null;

export function getLaboratoryService() {
  if (!service) service = new LaboratoryService();
  return service;
}
