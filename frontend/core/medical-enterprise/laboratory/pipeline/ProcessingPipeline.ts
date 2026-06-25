import type { LabReport, LabProcessingJob, LaboratoryPanelKind, LabResultValue } from "../types";
import { getPanelRegistry } from "../panels/registry";

/** Background lab processing — validation, metadata, AI queue */
export class LabProcessingPipeline {
  private jobs = new Map<string, LabProcessingJob>();

  createJob(reportId: string, importJobId?: string): LabProcessingJob {
    const job: LabProcessingJob = {
      id: `lab-proc-${Date.now()}`,
      reportId,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.id, job);
    void importJobId;
    return job;
  }

  extractMetadata(fileName: string, format: string) {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const panelGuess: LaboratoryPanelKind = ext === "csv" ? "custom-panel" : "cbc";
    return { panelKind: panelGuess, format, description: `Lab import: ${fileName}` };
  }

  createReportFromValues(
    patientId: string,
    panelKind: LaboratoryPanelKind,
    values: LabResultValue[],
    source: LabReport["source"],
  ): LabReport {
    const now = new Date().toISOString();
    const panel = getPanelRegistry().get(panelKind);
    return {
      id: `lab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      patientId,
      panelKind,
      status: "final",
      source,
      collectedAt: now,
      reportedAt: now,
      values: values.length ? values : (panel?.defaultAnalytes ?? []).map((a) => ({ analyte: a, value: "—", flag: "unknown" as const })),
      createdAt: now,
      updatedAt: now,
    };
  }

  async run(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("Processing job not found");

    const stages = ["validating", "extracting", "normalizing", "ai-queued", "complete"] as const;
    for (let i = 0; i < stages.length; i++) {
      job.status = stages[i]!;
      job.progress = Math.round(((i + 1) / stages.length) * 100);
      await new Promise((r) => setTimeout(r, 10));
    }
    job.completedAt = new Date().toISOString();
    return job;
  }

  getJob(jobId: string) {
    return this.jobs.get(jobId);
  }
}

let pipeline: LabProcessingPipeline | null = null;

export function getLabProcessingPipeline() {
  if (!pipeline) pipeline = new LabProcessingPipeline();
  return pipeline;
}
