import type {
  LabReport,
  LabResultValue,
  ReferenceRange,
  TrendDataPoint,
  AnalyteTrend,
  VitalReading,
  DeviceSession,
  MonitoringAlert,
  LabAIObservation,
  LabProcessingJob,
  LabImportJob,
  MonitoringEvent,
  MonitoringDashboardState,
} from "../types";

/** Scalable database model contracts (frontend + backend alignment) */

export type DbLabReport = LabReport & {
  encryptedAtRest: boolean;
  storageKey: string;
  checksum?: string;
};

export type DbLabResult = LabResultValue & {
  id: string;
  reportId: string;
  patientId: string;
};

export type DbReferenceRange = ReferenceRange;

export type DbTrendHistory = {
  id: string;
  patientId: string;
  analyte: string;
  dataPoints: TrendDataPoint[];
  updatedAt: string;
};

export type DbVitalReading = VitalReading & { encrypted: boolean };

export type DbDeviceSession = DeviceSession;

export type DbStreamingBuffer = {
  id: string;
  sessionId: string;
  patientId: string;
  readings: VitalReading[];
  flushedAt?: string;
};

export type DbMonitoringAlert = MonitoringAlert & { encrypted: boolean };

export type DbMonitoringEvent = MonitoringEvent;

export type DbLabAIObservation = LabAIObservation & {
  modelId: string;
  modelVersion: string;
  disclaimer: string;
};

export type DbLabProcessingJob = LabProcessingJob;

export type DbLabImportJob = LabImportJob;

export type DbDashboardSnapshot = MonitoringDashboardState & { snapshotId: string };

export type DbLaboratoryAuditEntry = {
  id: string;
  actorId: string;
  action: string;
  resourceType: "report" | "vital" | "alert" | "device" | "export" | "import";
  resourceId: string;
  patientId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};
