import type { ImagingModality, UploadJob } from "../types";
import { getModalityDefinition } from "../modalities/registry";

const CHUNK_SIZE = 5 * 1024 * 1024;

export type UploadSource = File | { name: string; size: number; type: string };

/** Chunked upload pipeline with validation and duplicate detection */
export class UploadPipeline {
  private jobs = new Map<string, UploadJob>();
  private checksumIndex = new Map<string, string>();

  async initUpload(
    file: UploadSource,
    opts: { patientId?: string; modality?: ImagingModality },
  ): Promise<UploadJob> {
    const name = file instanceof File ? file.name : file.name;
    const size = file instanceof File ? file.size : file.size;
    const mime = file instanceof File ? file.type : file.type;
    const checksum = `${name}:${size}:${mime}`;
    const duplicateOf = this.checksumIndex.get(checksum);

    const job: UploadJob = {
      id: `upload-${Date.now()}`,
      patientId: opts.patientId,
      fileName: name,
      fileSize: size,
      mimeType: mime,
      modality: opts.modality,
      status: duplicateOf ? "duplicate" : "pending",
      progress: 0,
      chunksTotal: Math.max(1, Math.ceil(size / CHUNK_SIZE)),
      chunksUploaded: 0,
      duplicateOf,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    if (!duplicateOf) this.checksumIndex.set(checksum, job.id);
    return job;
  }

  async uploadChunk(jobId: string, chunkIndex: number, _data: ArrayBuffer): Promise<UploadJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("Upload job not found");
    if (job.status === "duplicate") return job;

    job.status = "uploading";
    job.chunksUploaded = Math.max(job.chunksUploaded, chunkIndex + 1);
    job.progress = Math.round((job.chunksUploaded / job.chunksTotal) * 100);
    return job;
  }

  async validate(jobId: string): Promise<{ valid: boolean; errors: string[] }> {
    const job = this.jobs.get(jobId);
    if (!job) return { valid: false, errors: ["Job not found"] };

    const errors: string[] = [];
    if (job.fileSize <= 0) errors.push("Empty file");
    if (job.modality && !getModalityDefinition(job.modality)) errors.push("Unknown modality");

    const allowed = ["application/dicom", "image/", "application/octet-stream"];
    if (!allowed.some((p) => job.mimeType.startsWith(p))) {
      errors.push("File type requires clinical validation");
    }

    job.status = errors.length ? "failed" : "validating";
    return { valid: errors.length === 0, errors };
  }

  complete(jobId: string): UploadJob | undefined {
    const job = this.jobs.get(jobId);
    if (job && job.status !== "failed" && job.status !== "duplicate") {
      job.status = "complete";
      job.progress = 100;
    }
    return job;
  }

  getJob(jobId: string) {
    return this.jobs.get(jobId);
  }
}

let pipeline: UploadPipeline | null = null;

export function getUploadPipeline(): UploadPipeline {
  if (!pipeline) pipeline = new UploadPipeline();
  return pipeline;
}
