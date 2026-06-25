import type { ExportJob, ImportJob } from "./types";

/** Import / export — drag-drop, bulk, ZIP, folder, templates. */
export class OmniImportExport {
  imports: ImportJob[] = [];
  exports: ExportJob[] = [];

  importBulk(source: ImportJob["source"], fileCount: number) {
    const job: ImportJob = {
      id: `imp-${Date.now()}`,
      source,
      status: "queued",
      fileCount,
      progress: 0,
    };
    this.imports.unshift(job);
    job.status = "running";
    job.progress = 100;
    job.status = "completed";
    return job;
  }

  exportZip(assetIds: string[]) {
    const job: ExportJob = {
      id: `exp-${Date.now()}`,
      format: "zip",
      status: "queued",
      assetIds,
      progress: 0,
    };
    this.exports.unshift(job);
    job.status = "completed";
    job.progress = 100;
    return job;
  }

  exportTemplate(projectId: string) {
    const job: ExportJob = {
      id: `exp-${Date.now()}`,
      format: "template",
      status: "completed",
      assetIds: [],
      progress: 100,
    };
    this.exports.unshift(job);
    return { job, projectId };
  }

  onDragDrop(files: string[]) {
    return this.importBulk("drag-drop", files.length);
  }
}

export const omniImportExport = new OmniImportExport();
