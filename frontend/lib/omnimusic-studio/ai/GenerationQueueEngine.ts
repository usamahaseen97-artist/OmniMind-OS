import type { GenerationJob, GenerationJobStatus, GenerationPriority, MusicPromptSpec } from "../ai-types";
import { musicModelRouter } from "./ModelRouter";

export class GenerationQueueEngine {
  private jobs: GenerationJob[] = [];

  list(): GenerationJob[] {
    return [...this.jobs].sort((a, b) => {
      const pri = { high: 0, normal: 1, low: 2 };
      return pri[a.priority] - pri[b.priority] || b.createdAt.localeCompare(a.createdAt);
    });
  }

  history(): GenerationJob[] {
    return this.jobs.filter((j) => ["completed", "failed", "cancelled"].includes(j.status));
  }

  active(): GenerationJob[] {
    return this.jobs.filter((j) => ["queued", "running", "paused"].includes(j.status));
  }

  enqueue(projectId: string, prompt: MusicPromptSpec, priority: GenerationPriority = "normal"): GenerationJob {
    const route = musicModelRouter.resolve(prompt.workflow);
    const job: GenerationJob = {
      id: `gen-${Date.now()}`,
      projectId,
      promptId: prompt.id,
      workflow: prompt.workflow,
      status: "queued",
      priority,
      progress: 0,
      estimatedSec: Math.max(30, Math.round(prompt.durationSec * 0.5)),
      providerId: route.providerId,
      modelHint: route.modelHint,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      error: null,
      resultAssetId: null,
    };
    this.jobs.unshift(job);
    return job;
  }

  update(id: string, patch: Partial<GenerationJob>): GenerationJob | null {
    const idx = this.jobs.findIndex((j) => j.id === id);
    if (idx < 0) return null;
    const next = { ...this.jobs[idx]!, ...patch, updatedAt: new Date().toISOString() };
    this.jobs[idx] = next;
    return next;
  }

  pause(id: string) {
    return this.update(id, { status: "paused" });
  }

  resume(id: string) {
    return this.update(id, { status: "running" });
  }

  cancel(id: string) {
    return this.update(id, { status: "cancelled", progress: 0 });
  }

  retry(id: string) {
    const j = this.jobs.find((x) => x.id === id);
    if (!j) return null;
    return this.update(id, { status: "queued", progress: 0, error: null });
  }

  /** Architecture stub — simulates progress without real inference. */
  tick(): GenerationJob[] {
    const running = this.jobs.filter((j) => j.status === "running");
    for (const job of running) {
      const next = Math.min(100, job.progress + 8);
      this.update(job.id, {
        progress: next,
        status: next >= 100 ? "completed" : "running",
        resultAssetId: next >= 100 ? `asset-${job.id}` : null,
      });
    }
    const queued = this.jobs.find((j) => j.status === "queued");
    if (queued && running.length < 2) {
      this.update(queued.id, { status: "running", progress: 5 });
    }
    return this.list();
  }

  setStatus(id: string, status: GenerationJobStatus) {
    return this.update(id, { status });
  }
}

export const generationQueueEngine = new GenerationQueueEngine();
