import type { ImagingModality, ImagingStudy, ProcessingJob, ProcessingJobStatus } from "../types";
import { getModalityDefinition } from "../modalities/registry";

const STAGES: ProcessingJobStatus[] = [
  "validating",
  "extracting",
  "preprocessing",
  "ai-queued",
  "rendering",
  "complete",
];

/** Image validation → metadata → preprocess → AI queue → render → cache */
export class ProcessingPipeline {
  private jobs = new Map<string, ProcessingJob>();

  createJob(studyId: string, uploadJobId?: string): ProcessingJob {
    const job: ProcessingJob = {
      id: `proc-${Date.now()}`,
      studyId,
      uploadJobId,
      status: "queued",
      stages: STAGES.map((name) => ({ name, status: "queued" as ProcessingJobStatus })),
      aiQueued: false,
      renderQueued: false,
      thumbnailReady: false,
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async run(jobId: string, modality: ImagingModality, onProgress?: (job: ProcessingJob) => void) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("Processing job not found");

    for (const stage of job.stages) {
      job.status = stage.name as ProcessingJobStatus;
      stage.status = stage.name as ProcessingJobStatus;
      stage.startedAt = new Date().toISOString();
      onProgress?.(job);

      await this.simulateStage(stage.name);

      stage.completedAt = new Date().toISOString();
      if (stage.name === "ai-queued") job.aiQueued = true;
      if (stage.name === "rendering") {
        job.renderQueued = true;
        job.thumbnailReady = true;
      }
    }

    job.status = "complete";
    void modality;
    void getModalityDefinition(modality);
    return job;
  }

  private simulateStage(name: string) {
    return new Promise<void>((r) => setTimeout(r, name === "rendering" ? 50 : 20));
  }

  getJob(jobId: string) {
    return this.jobs.get(jobId);
  }

  extractMetadata(_fileRef: string) {
    return {
      studyInstanceUid: `1.2.840.${Date.now()}`,
      seriesCount: 1,
      instanceCount: 1,
      modality: "dicom" as ImagingModality,
    };
  }

  createStudyFromMetadata(patientId: string, meta: ReturnType<ProcessingPipeline["extractMetadata"]>): ImagingStudy {
    return {
      id: `study-${Date.now()}`,
      patientId,
      modality: meta.modality,
      description: "Imported study",
      studyDate: new Date().toISOString(),
      status: "processing",
      seriesCount: meta.seriesCount,
      instanceCount: meta.instanceCount,
      pacsStudyUid: meta.studyInstanceUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

let processing: ProcessingPipeline | null = null;

export function getProcessingPipeline(): ProcessingPipeline {
  if (!processing) processing = new ProcessingPipeline();
  return processing;
}
