import type {
  ImagingModality,
  ImagingStudy,
  ImagingSeries,
  ImagingInstance,
  AnnotationRecord,
  MeasurementRecord,
  ImagingReport,
  UploadJob,
  ProcessingJob,
  AIVisionFinding,
  ImagingSearchQuery,
  ViewerState,
  TileDescriptor,
} from "../types";

export const IMAGING_API_BASE = "/api/v1/medical-enterprise/imaging";

export type ApiResponse<T> = { ok: boolean; data?: T; error?: string; meta?: Record<string, unknown> };

/** POST /upload/init */
export type UploadInitRequest = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  patientId?: string;
  modality?: ImagingModality;
  chunkSize?: number;
};

export type UploadInitResponse = ApiResponse<{
  uploadJobId: string;
  chunksTotal: number;
  chunkSize: number;
  uploadUrl: string;
}>;

/** PUT /upload/chunk/:jobId/:index */
export type UploadChunkResponse = ApiResponse<{ progress: number; chunksUploaded: number }>;

/** POST /upload/complete/:jobId */
export type UploadCompleteResponse = ApiResponse<{ studyId: string; processingJobId: string; duplicate: boolean }>;

/** GET /studies */
export type ListStudiesResponse = ApiResponse<ImagingStudy[]>;

/** GET /studies/:id */
export type GetStudyResponse = ApiResponse<{
  study: ImagingStudy;
  series: ImagingSeries[];
  instances: ImagingInstance[];
}>;

/** GET /studies/:id/stream/:instanceId */
export type StreamImageResponse = ApiResponse<{ streamUrl: string; tiles?: TileDescriptor[] }>;

/** POST /annotations */
export type SaveAnnotationRequest = Omit<AnnotationRecord, "id" | "version" | "createdAt" | "updatedAt"> & {
  parentVersionId?: string;
};

/** GET /annotations/:studyId */
export type ListAnnotationsResponse = ApiResponse<AnnotationRecord[]>;

/** POST /measurements */
export type SaveMeasurementRequest = Omit<MeasurementRecord, "id" | "createdAt">;

/** POST /ai/analyze */
export type ImagingAIAnalyzeRequest = {
  studyId: string;
  seriesId?: string;
  instanceId?: string;
  modelId?: string;
};

export type ImagingAIAnalyzeResponse = ApiResponse<{
  jobId: string;
  findings: AIVisionFinding[];
  disclaimer: string;
}>;

/** POST /ai/feedback */
export type AIFeedbackRequest = {
  findingId: string;
  feedback: "agree" | "disagree" | "uncertain";
  note?: string;
};

/** POST /reports */
export type SaveReportRequest = Omit<ImagingReport, "id" | "status"> & { status?: ImagingReport["status"] };

/** GET /reports/:studyId */
export type GetReportResponse = ApiResponse<ImagingReport>;

/** GET /search */
export type SearchStudiesResponse = ApiResponse<ImagingStudy[]>;

/** POST /export/:studyId */
export type ExportStudyResponse = ApiResponse<{ exportUrl: string; format: "dicom" | "pdf" | "png" }>;

/** GET /viewer-state/:studyId */
export type GetViewerStateResponse = ApiResponse<ViewerState>;

/** PUT /viewer-state/:studyId */
export type SaveViewerStateRequest = ViewerState;

export const IMAGING_API_ROUTES = {
  uploadInit: `${IMAGING_API_BASE}/upload/init`,
  uploadChunk: (jobId: string, index: number) => `${IMAGING_API_BASE}/upload/chunk/${jobId}/${index}`,
  uploadComplete: (jobId: string) => `${IMAGING_API_BASE}/upload/complete/${jobId}`,
  studies: `${IMAGING_API_BASE}/studies`,
  study: (id: string) => `${IMAGING_API_BASE}/studies/${id}`,
  stream: (studyId: string, instanceId: string) => `${IMAGING_API_BASE}/studies/${studyId}/stream/${instanceId}`,
  annotations: (studyId: string) => `${IMAGING_API_BASE}/annotations/${studyId}`,
  saveAnnotation: `${IMAGING_API_BASE}/annotations`,
  measurements: `${IMAGING_API_BASE}/measurements`,
  aiAnalyze: `${IMAGING_API_BASE}/ai/analyze`,
  aiFeedback: `${IMAGING_API_BASE}/ai/feedback`,
  reports: `${IMAGING_API_BASE}/reports`,
  report: (studyId: string) => `${IMAGING_API_BASE}/reports/${studyId}`,
  search: `${IMAGING_API_BASE}/search`,
  export: (studyId: string) => `${IMAGING_API_BASE}/export/${studyId}`,
  viewerState: (studyId: string) => `${IMAGING_API_BASE}/viewer-state/${studyId}`,
  processing: (jobId: string) => `${IMAGING_API_BASE}/processing/${jobId}`,
} as const;

export type { UploadJob, ProcessingJob, ImagingSearchQuery };
