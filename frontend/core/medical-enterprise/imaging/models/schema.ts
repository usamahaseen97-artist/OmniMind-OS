import type {
  ImagingStudy,
  ImagingSeries,
  ImagingInstance,
  AnnotationRecord,
  MeasurementRecord,
  ImagingReport,
  ProcessingJob,
  UploadJob,
  ViewerState,
  AIVisionFinding,
} from "../types";

/** Scalable database model contracts (frontend + backend alignment) */

export type DbImagingStudy = ImagingStudy & {
  encryptedAtRest: boolean;
  storageKey: string;
  auditLogId: string;
};

export type DbImagingSeries = ImagingSeries & { storagePrefix: string };

export type DbImagingInstance = ImagingInstance & {
  checksum: string;
  sizeBytes: number;
  decodedCacheKey?: string;
};

export type DbAnnotation = AnnotationRecord & { encrypted: boolean };

export type DbMeasurement = MeasurementRecord;

export type DbImagingReport = ImagingReport & { version: number };

export type DbViewerState = ViewerState & {
  userId: string;
  savedAt: string;
};

export type DbProcessingJob = ProcessingJob;

export type DbUploadJob = UploadJob;

export type DbAIVisionResult = {
  id: string;
  studyId: string;
  jobId: string;
  findings: AIVisionFinding[];
  modelId: string;
  modelVersion: string;
  disclaimer: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type DbImagingAuditEntry = {
  id: string;
  actorId: string;
  action: string;
  resourceType: "study" | "series" | "instance" | "annotation" | "report" | "export";
  resourceId: string;
  patientId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};
