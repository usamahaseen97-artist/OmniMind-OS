/**
 * Laboratory Intelligence & Patient Monitoring — type contracts (Phase 4)
 * No diagnostic conclusions — infrastructure and CDS scaffolding only.
 */

export const LABORATORY_AI_DISCLAIMER =
  "AI-assisted laboratory and monitoring analysis for qualified healthcare professionals. " +
  "Does not replace licensed medical judgment. All outputs require clinician review.";

/** Extended panel kinds — superset of Phase 2 clinical-intelligence LabPanelKind */
export type LaboratoryPanelKind =
  | "cbc"
  | "cmp"
  | "lipid"
  | "hba1c"
  | "blood-glucose"
  | "liver-function"
  | "kidney-function"
  | "electrolytes"
  | "inflammatory-markers"
  | "coagulation"
  | "hormones"
  | "thyroid"
  | "urinalysis"
  | "microbiology"
  | "pathology"
  | "genetics"
  | "molecular-diagnostics"
  | "custom-panel";

export type LabImportFormat = "pdf" | "csv" | "fhir" | "hl7" | "hospital-api" | "manual" | "ocr" | "batch";

export type LabReportStatus = "pending" | "processing" | "partial" | "final" | "amended" | "cancelled";

export type LabResultFlag = "low" | "high" | "critical-low" | "critical-high" | "normal" | "unknown";

export type LabResultValue = {
  analyte: string;
  value: number | string;
  unit?: string;
  referenceRange?: string;
  flag?: LabResultFlag;
  loincCode?: string;
  normalizedValue?: number;
  confidence?: number;
};

export type LabReport = {
  id: string;
  patientId: string;
  visitId?: string;
  panelKind: LaboratoryPanelKind;
  status: LabReportStatus;
  source: LabImportFormat;
  collectedAt: string;
  reportedAt?: string;
  orderingProvider?: string;
  labName?: string;
  values: LabResultValue[];
  accessionNumber?: string;
  consentScope?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReferenceRange = {
  id: string;
  analyte: string;
  panelKind?: LaboratoryPanelKind;
  low?: number;
  high?: number;
  criticalLow?: number;
  criticalHigh?: number;
  unit?: string;
  ageMin?: number;
  ageMax?: number;
  sex?: "male" | "female" | "any";
};

export type TrendDirection = "improving" | "stable" | "declining" | "insufficient-data";

export type TrendDataPoint = {
  timestamp: string;
  value: number;
  reportId: string;
  flag?: LabResultFlag;
};

export type AnalyteTrend = {
  analyte: string;
  unit?: string;
  direction: TrendDirection;
  dataPoints: TrendDataPoint[];
  baselineValue?: number;
  latestValue?: number;
  percentChange?: number;
};

export type VitalSignType =
  | "heart-rate"
  | "blood-pressure"
  | "temperature"
  | "respiratory-rate"
  | "spo2"
  | "ecg"
  | "eeg"
  | "blood-glucose"
  | "weight"
  | "bmi"
  | "pain-score"
  | "sleep"
  | "activity"
  | "fluid-balance";

export type VitalReading = {
  id: string;
  patientId: string;
  type: VitalSignType;
  value: number | string;
  unit?: string;
  secondaryValue?: number;
  recordedAt: string;
  source: "manual" | "device" | "wearable" | "hospital-api";
  deviceId?: string;
  sessionId?: string;
};

export type DeviceTransport = "bluetooth" | "wifi" | "rest-api" | "sdk-plugin";

export type WearableDeviceKind =
  | "smart-watch"
  | "fitness-band"
  | "ecg-monitor"
  | "cgm"
  | "bp-monitor"
  | "pulse-oximeter"
  | "sleep-sensor"
  | "generic-medical";

export type DeviceSession = {
  id: string;
  patientId: string;
  deviceId: string;
  deviceKind: WearableDeviceKind;
  transport: DeviceTransport;
  status: "connecting" | "connected" | "streaming" | "disconnected" | "error";
  startedAt: string;
  endedAt?: string;
  lastHeartbeat?: string;
  metadata?: Record<string, unknown>;
};

export type WearableDevice = {
  id: string;
  name: string;
  manufacturer?: string;
  kind: WearableDeviceKind;
  transport: DeviceTransport;
  supportedVitals: VitalSignType[];
  pluginId?: string;
  paired: boolean;
};

export type AlertSeverity = "info" | "warning" | "critical" | "emergency";

export type AlertCategory =
  | "critical-lab"
  | "vital-trend"
  | "deterioration"
  | "missing-follow-up"
  | "medication"
  | "device-disconnect"
  | "custom";

export type MonitoringAlert = {
  id: string;
  patientId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  escalationLevel: number;
  sourceRef?: string;
  metadata?: Record<string, unknown>;
};

export type EscalationRule = {
  id: string;
  name: string;
  category: AlertCategory;
  severity: AlertSeverity;
  condition: string;
  escalationDelayMinutes: number;
  notifyRoles: string[];
  enabled: boolean;
};

export type LabAIObservation = {
  id: string;
  reportId: string;
  patientId: string;
  panelKind: LaboratoryPanelKind;
  summary: string;
  flaggedAnalytes: string[];
  criticalValues: string[];
  trendNotes: string[];
  missingInformation: string[];
  suggestedDataCollection: string[];
  confidence: { level: string; score: number; rationale: string };
  clinicianReviewRequired: true;
  createdAt: string;
};

export type MonitoringEvent = {
  id: string;
  patientId: string;
  type: "vital-reading" | "alert" | "device-connect" | "device-disconnect" | "lab-result";
  timestamp: string;
  payload: Record<string, unknown>;
};

export type LabProcessingJob = {
  id: string;
  reportId: string;
  status: "queued" | "validating" | "extracting" | "normalizing" | "ai-queued" | "complete" | "failed";
  progress: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
};

export type LabImportJob = {
  id: string;
  patientId: string;
  format: LabImportFormat;
  fileName?: string;
  status: "pending" | "uploading" | "processing" | "complete" | "failed" | "duplicate";
  progress: number;
  chunksTotal?: number;
  chunksUploaded?: number;
  reportId?: string;
  errors?: string[];
  createdAt: string;
};

export type MonitoringDashboardState = {
  patientId: string;
  vitalsTimeline: VitalReading[];
  labTrends: AnalyteTrend[];
  activeAlerts: MonitoringAlert[];
  deviceSessions: DeviceSession[];
  recentObservations: LabAIObservation[];
  riskOverview?: { level: string; factors: string[] };
  lastUpdated: string;
};

export type LabSearchQuery = {
  patientId?: string;
  panelKind?: LaboratoryPanelKind;
  status?: LabReportStatus;
  from?: string;
  to?: string;
  q?: string;
};

export type StreamSubscription = {
  id: string;
  patientId: string;
  types: ("vitals" | "alerts" | "labs")[];
  createdAt: string;
  active: boolean;
};
