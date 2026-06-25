import { omniCloudApiClient } from "./OmniCloudApiClient";
import type { RemoteJob, RemoteJobKind } from "./types";

/** Remote Execution — queue, status, ETA, progress, logs, resource usage. */
export class OmniCloudRemoteExecution {
  jobs: RemoteJob[] = [];

  async enqueue(kind: RemoteJobKind, label: string, payload?: Record<string, unknown>) {
    const remote = await omniCloudApiClient.enqueueRemote(kind, label, payload);
    if (remote?.ok) {
      this.jobs.unshift(remote.job);
      return remote.job;
    }
    const job: RemoteJob = {
      id: `job-${Date.now()}`,
      kind,
      label,
      status: "queued",
      progress: 0,
      etaSeconds: 120,
      logs: [`Queued ${kind}: ${label}`],
      resourceUsage: { cpu: null, memoryMb: null },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.jobs.unshift(job);
    return job;
  }

  async list() {
    const remote = await omniCloudApiClient.listRemoteJobs();
    if (remote?.ok) {
      this.jobs = remote.jobs;
      return this.jobs;
    }
    return this.jobs;
  }

  get(jobId: string) {
    return this.jobs.find((j) => j.id === jobId) ?? null;
  }

  queue() {
    return this.jobs.filter((j) => j.status === "queued" || j.status === "running");
  }

  snapshot() {
    return {
      total: this.jobs.length,
      queued: this.jobs.filter((j) => j.status === "queued").length,
      running: this.jobs.filter((j) => j.status === "running").length,
      completed: this.jobs.filter((j) => j.status === "completed").length,
    };
  }
}

export const omniCloudRemoteExecution = new OmniCloudRemoteExecution();
