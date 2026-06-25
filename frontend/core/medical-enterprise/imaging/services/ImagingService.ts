import type {
  ImagingStudy,
  ImagingSearchQuery,
  ImagingModality,
  AnnotationRecord,
  MeasurementRecord,
  ImagingReport,
  ViewerState,
} from "../types";
import { getUploadPipeline } from "../pipeline/UploadPipeline";
import { getProcessingPipeline } from "../pipeline/ProcessingPipeline";
import { getViewerEngine } from "../viewer/ViewerEngine";
import { getAnnotationStore } from "../annotations/AnnotationStore";
import { getMeasurementTools } from "../viewer/tools/MeasurementTools";
import { getAIVisionEngine } from "../ai-vision/AIVisionEngine";
import { getImagingReportBuilder } from "../reporting/ImagingReportBuilder";
import { getStudyPatientLinker } from "../patient/StudyPatientLinker";
import { getImagingAccessControl } from "../security/ImagingAccessControl";
import { getImagingBrainBridge, getClinicalAIImagingBridge } from "../bridge/ImagingBrainBridge";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { Point } from "../viewer/tools/MeasurementTools";

/** Unified imaging platform service facade */
export class ImagingService {
  private studies = new Map<string, ImagingStudy>();
  private reports = new Map<string, ImagingReport>();
  private ac = getImagingAccessControl();
  private brain = getImagingBrainBridge();
  private clinical = getClinicalAIImagingBridge();

  async uploadFile(file: File, patientId: string, role: ClinicalRole, modality?: ImagingModality) {
    this.ac.assert(role, "imaging:upload");
    const upload = getUploadPipeline();
    const job = await upload.initUpload(file, { patientId, modality });
    if (job.status === "duplicate") return { job, study: null };

    const buffer = await file.arrayBuffer();
    const chunks = job.chunksTotal;
    for (let i = 0; i < chunks; i++) {
      const start = i * (buffer.byteLength / chunks);
      const end = Math.min(buffer.byteLength, start + buffer.byteLength / chunks);
      await upload.uploadChunk(job.id, i, buffer.slice(start, end));
    }

    const validation = await upload.validate(job.id);
    if (!validation.valid) throw new Error(validation.errors.join("; "));

    upload.complete(job.id);

    const processing = getProcessingPipeline();
    const procJob = processing.createJob(`pending-${job.id}`, job.id);
    const meta = processing.extractMetadata(job.fileName);
    const study = processing.createStudyFromMetadata(patientId, meta);
    study.modality = modality ?? meta.modality;
    study.status = "ready";

    await processing.run(procJob.id, study.modality);
    this.studies.set(study.id, study);
    getStudyPatientLinker().linkStudy(study);
    this.brain.registerStudy(study.id, patientId);
    this.ac.audit({ actorId: "current-user", action: "imaging.upload", resourceType: "study", resourceId: study.id, patientId });

    return { job, study, processingJob: procJob };
  }

  getStudy(studyId: string, role: ClinicalRole) {
    this.ac.assert(role, "imaging:read");
    return this.studies.get(studyId);
  }

  search(query: ImagingSearchQuery, role: ClinicalRole) {
    this.ac.assert(role, "imaging:read");
    let results = [...this.studies.values()];
    if (query.patientId) results = results.filter((s) => s.patientId === query.patientId);
    if (query.modality) results = results.filter((s) => s.modality === query.modality);
    if (query.q) {
      const q = query.q.toLowerCase();
      results = results.filter((s) => s.description.toLowerCase().includes(q));
    }
    return results;
  }

  getViewerState(studyId: string, role: ClinicalRole) {
    this.ac.assert(role, "imaging:read");
    return getViewerEngine().getState(studyId);
  }

  saveAnnotation(input: Omit<AnnotationRecord, "id" | "version" | "createdAt" | "updatedAt">, role: ClinicalRole) {
    this.ac.assert(role, "imaging:annotate");
    return getAnnotationStore().save(input);
  }

  addMeasurement(
    studyId: string,
    seriesId: string,
    instanceId: string,
    type: "distance" | "area" | "angle",
    points: Point[],
    createdBy: string,
    role: ClinicalRole,
  ) {
    this.ac.assert(role, "imaging:annotate");
    const tools = getMeasurementTools();
    if (type === "distance") return tools.measureDistance(studyId, seriesId, instanceId, points, createdBy);
    if (type === "area") return tools.measureArea(studyId, seriesId, instanceId, points, createdBy);
    return tools.measureAngle(studyId, seriesId, instanceId, points, createdBy);
  }

  async runAIAnalysis(studyId: string, role: ClinicalRole) {
    this.ac.assert(role, "imaging:ai");
    const study = this.studies.get(studyId);
    if (!study) throw new Error("Study not found");
    const vision = await getAIVisionEngine().analyze({ studyId, modality: study.modality });
    await this.clinical.requestRadiologyAssist(studyId, study.patientId);
    this.ac.audit({ actorId: "current-user", action: "imaging.ai.analyze", resourceType: "study", resourceId: studyId, patientId: study.patientId });
    return vision;
  }

  buildReport(studyId: string, patientId: string, authoredBy: string, role: ClinicalRole) {
    this.ac.assert(role, "imaging:read");
    const findings = getAIVisionEngine().getFindings(studyId);
    const report = getImagingReportBuilder().createDraft(studyId, patientId, authoredBy);
    getImagingReportBuilder().applyAIFindings(report, findings);
    this.reports.set(studyId, report);
    return report;
  }

  exportStudy(studyId: string, role: ClinicalRole) {
    this.ac.assert(role, "imaging:export");
    this.ac.audit({ actorId: "current-user", action: "imaging.export", resourceType: "export", resourceId: studyId });
    return { exportUrl: `/api/v1/medical-enterprise/imaging/export/${studyId}`, format: "dicom" as const };
  }

  saveViewerState(state: ViewerState, role: ClinicalRole) {
    this.ac.assert(role, "imaging:read");
    void getViewerEngine().setTransform(state.studyId, state.transform);
    return state;
  }
}

let service: ImagingService | null = null;

export function getImagingService() {
  if (!service) service = new ImagingService();
  return service;
}
