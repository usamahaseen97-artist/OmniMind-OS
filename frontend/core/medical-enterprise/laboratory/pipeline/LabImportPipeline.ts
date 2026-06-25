import type { LabImportFormat, LabImportJob, LaboratoryPanelKind } from "../types";

export type ImportOptions = {
  patientId: string;
  format: LabImportFormat;
  panelKind?: LaboratoryPanelKind;
  fileName?: string;
  fileSize?: number;
};

/** Lab import pipeline — PDF, CSV, FHIR, HL7, batch, OCR-ready */
export class LabImportPipeline {
  private jobs = new Map<string, LabImportJob>();
  private checksumIndex = new Map<string, string>();

  initImport(options: ImportOptions): LabImportJob {
    const id = `lab-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const chunksTotal = options.fileSize ? Math.max(1, Math.ceil(options.fileSize / (5 * 1024 * 1024))) : undefined;
    const job: LabImportJob = {
      id,
      patientId: options.patientId,
      format: options.format,
      fileName: options.fileName,
      status: options.format === "manual" ? "processing" : "pending",
      progress: 0,
      chunksTotal,
      chunksUploaded: 0,
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async uploadChunk(jobId: string, index: number, _data: ArrayBuffer) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("Import job not found");
    job.status = "uploading";
    job.chunksUploaded = Math.max(job.chunksUploaded ?? 0, index + 1);
    job.progress = job.chunksTotal ? Math.round(((job.chunksUploaded ?? 0) / job.chunksTotal) * 80) : 50;
    return job;
  }

  validate(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return { valid: false, errors: ["Job not found"] };
    const errors: string[] = [];
    if (!job.patientId) errors.push("Patient ID required");
    if (job.format === "hl7" && !job.fileName?.match(/\.(hl7|txt)$/i)) errors.push("HL7 file extension expected");
    if (job.format === "fhir" && !job.fileName?.match(/\.(json|fhir)$/i)) errors.push("FHIR JSON expected");
    return { valid: errors.length === 0, errors };
  }

  checkDuplicate(checksum: string) {
    return this.checksumIndex.get(checksum) ?? null;
  }

  registerChecksum(checksum: string, reportId: string) {
    this.checksumIndex.set(checksum, reportId);
  }

  complete(jobId: string, reportId: string) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("Import job not found");
    job.status = "complete";
    job.progress = 100;
    job.reportId = reportId;
    return job;
  }

  getJob(jobId: string) {
    return this.jobs.get(jobId);
  }

  /** OCR-ready hook — plug in external OCR service */
  async extractFromOCR(_buffer: ArrayBuffer, _format: LabImportFormat) {
    return { values: [] as { analyte: string; value: string | number; unit?: string }[], confidence: 0 };
  }

  /** FHIR DiagnosticReport parser stub */
  parseFHIR(_json: unknown) {
    return { panelKind: "custom-panel" as LaboratoryPanelKind, values: [] as { analyte: string; value: string | number; unit?: string }[] };
  }

  /** HL7 ORU parser stub */
  parseHL7(_text: string) {
    return { panelKind: "custom-panel" as LaboratoryPanelKind, values: [] as { analyte: string; value: string | number; unit?: string }[] };
  }

  /** CSV parser */
  parseCSV(text: string) {
    const lines = text.trim().split("\n");
    const values: { analyte: string; value: string | number; unit?: string }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const [analyte, value, unit] = lines[i]!.split(",").map((s) => s.trim());
      if (analyte) values.push({ analyte, value: isNaN(Number(value)) ? value! : Number(value), unit });
    }
    return { panelKind: "custom-panel" as LaboratoryPanelKind, values };
  }
}

let pipeline: LabImportPipeline | null = null;

export function getLabImportPipeline() {
  if (!pipeline) pipeline = new LabImportPipeline();
  return pipeline;
}
