/**
 * Medical Imaging & Visualization Platform — Phase 3
 */
export type * from "./types";
export * from "./api/contracts";
export * from "./modalities/registry";
export * from "./models/schema";
export * from "./pipeline/UploadPipeline";
export * from "./pipeline/ProcessingPipeline";
export * from "./viewer/ViewerEngine";
export * from "./viewer/tools/MeasurementTools";
export * from "./annotations/AnnotationStore";
export * from "./volume/VolumeRenderingArchitecture";
export * from "./ai-vision/AIVisionEngine";
export * from "./reporting/ImagingReportBuilder";
export * from "./patient/StudyPatientLinker";
export * from "./performance/TileCache";
export * from "./security/ImagingAccessControl";
export * from "./bridge/ImagingBrainBridge";
export * from "./services/ImagingService";

import { getImagingService } from "./services/ImagingService";

export const medicalImagingPlatform = {
  service: getImagingService,
  upload: (...args: Parameters<ReturnType<typeof getImagingService>["uploadFile"]>) => getImagingService().uploadFile(...args),
  search: (...args: Parameters<ReturnType<typeof getImagingService>["search"]>) => getImagingService().search(...args),
  analyze: (...args: Parameters<ReturnType<typeof getImagingService>["runAIAnalysis"]>) => getImagingService().runAIAnalysis(...args),
};
