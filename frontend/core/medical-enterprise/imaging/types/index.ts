/**
 * Medical Imaging & Visualization Platform — type contracts (Phase 3)
 * No diagnostic conclusions — infrastructure and CDS scaffolding only.
 */

export const IMAGING_AI_DISCLAIMER =
  "AI-assisted imaging analysis for qualified healthcare professionals. " +
  "Does not replace radiologist or clinician judgment.";

export type ImagingModality =
  | "dicom"
  | "mri"
  | "ct"
  | "xray"
  | "ultrasound"
  | "pet"
  | "mammography"
  | "dental"
  | "oct"
  | "fundus"
  | "pathology-slide"
  | "microscopy"
  | "endoscopy"
  | "dermatology"
  | "clinical-photo"
  | "volume-3d"
  | "ai-vision";

export type StudyStatus = "uploading" | "processing" | "ready" | "failed" | "archived";

export type ProcessingJobStatus = "queued" | "validating" | "extracting" | "preprocessing" | "ai-queued" | "rendering" | "complete" | "failed";

export type ImagingStudy = {
  id: string;
  patientId: string;
  visitId?: string;
  modality: ImagingModality;
  description: string;
  studyDate: string;
  accessionNumber?: string;
  status: StudyStatus;
  seriesCount: number;
  instanceCount: number;
  pacsStudyUid?: string;
  consentScope?: string;
  createdAt: string;
  updatedAt: string;
};

export type ImagingSeries = {
  id: string;
  studyId: string;
  seriesNumber: number;
  modality: ImagingModality;
  description: string;
  instanceCount: number;
  bodyPart?: string;
  sliceThickness?: number;
};

export type ImagingInstance = {
  id: string;
  seriesId: string;
  instanceNumber: number;
  sopInstanceUid?: string;
  rows?: number;
  columns?: number;
  transferSyntax?: string;
  thumbnailUrl?: string;
  tileUrlTemplate?: string;
  frameCount: number;
};

export type ViewerTool =
  | "pan"
  | "zoom"
  | "rotate"
  | "window-level"
  | "distance"
  | "area"
  | "angle"
  | "annotate"
  | "roi"
  | "bookmark";

export type WindowLevelPreset = {
  id: string;
  label: string;
  center: number;
  width: number;
};

export type ViewerTransform = {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  brightness: number;
  contrast: number;
  windowCenter: number;
  windowWidth: number;
};

export type ViewerState = {
  studyId: string;
  seriesId?: string;
  instanceId?: string;
  tool: ViewerTool;
  transform: ViewerTransform;
  fullscreen: boolean;
  synchronizedGroupId?: string;
  comparisonStudyId?: string;
  timelineIndex?: number;
};

export type MeasurementRecord = {
  id: string;
  studyId: string;
  seriesId: string;
  instanceId: string;
  type: "distance" | "area" | "angle";
  value: number;
  unit: string;
  points: { x: number; y: number }[];
  createdBy: string;
  createdAt: string;
};

export type AnnotationRecord = {
  id: string;
  studyId: string;
  seriesId: string;
  instanceId: string;
  version: number;
  parentVersionId?: string;
  type: "draw" | "mark" | "highlight" | "comment" | "roi";
  geometry: Record<string, unknown>;
  label?: string;
  comment?: string;
  createdBy: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
};

export type AIVisionFinding = {
  id: string;
  studyId: string;
  seriesId?: string;
  instanceId?: string;
  regionOfInterest?: { x: number; y: number; width: number; height: number };
  label: string;
  description: string;
  confidence: { level: string; score: number };
  evidence: { source: string; reference?: string }[];
  clinicianReviewRequired: true;
  clinicianFeedback?: "agree" | "disagree" | "uncertain" | "pending";
  feedbackNote?: string;
};

export type ImagingReport = {
  id: string;
  studyId: string;
  patientId: string;
  findings: string;
  impression: string;
  recommendations: string;
  comparison?: string;
  aiSummary?: string;
  clinicianNotes?: string;
  attachments: string[];
  status: "draft" | "preliminary" | "final";
  authoredBy: string;
  signedAt?: string;
};

export type UploadJob = {
  id: string;
  patientId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  modality?: ImagingModality;
  status: "pending" | "uploading" | "validating" | "complete" | "duplicate" | "failed";
  progress: number;
  chunksTotal: number;
  chunksUploaded: number;
  duplicateOf?: string;
  error?: string;
  createdAt: string;
};

export type ProcessingJob = {
  id: string;
  studyId: string;
  uploadJobId?: string;
  status: ProcessingJobStatus;
  stages: { name: string; status: ProcessingJobStatus; startedAt?: string; completedAt?: string }[];
  aiQueued: boolean;
  renderQueued: boolean;
  thumbnailReady: boolean;
  error?: string;
};

export type VolumeRenderConfig = {
  studyId: string;
  seriesId: string;
  mode: "volume" | "mpr-axial" | "mpr-coronal" | "mpr-sagittal";
  gpuEnabled: boolean;
  sliceIndex: number;
  sliceCount: number;
  synchronizedViewers: string[];
};

export type ImagingSearchQuery = {
  patientId?: string;
  modality?: ImagingModality;
  dateFrom?: string;
  dateTo?: string;
  accessionNumber?: string;
  q?: string;
};

export type TileDescriptor = {
  instanceId: string;
  level: number;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
};
