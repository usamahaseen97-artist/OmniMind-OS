import type { AiAgentId, AiProviderId, InferenceJob } from "./types";
import { omniModelRouter } from "./OmniModelRouter";

/** Inference job queue with priority. */
export class OmniInferenceQueue {
  jobs: InferenceJob[] = [];
  private maxJobs = 200;

  enqueue(prompt: string, opts?: { modelId?: string; providerId?: AiProviderId; agentId?: AiAgentId | null; priority?: number }) {
    const route = omniModelRouter.route({ prompt, modelId: opts?.modelId, providerId: opts?.providerId, agentId: opts?.agentId ?? undefined });
    const job: InferenceJob = {
      id: `job-${Date.now()}`,
      providerId: route?.providerId ?? "openai",
      modelId: route?.modelId ?? "gpt-4o",
      agentId: opts?.agentId ?? null,
      prompt,
      status: "queued",
      priority: opts?.priority ?? 0,
      createdAt: new Date().toISOString(),
      latencyMs: null,
      tokenUsage: null,
    };
    this.jobs.unshift(job);
    this.jobs.sort((a, b) => b.priority - a.priority);
    this.evictCompleted();
    return job;
  }

  list(status?: InferenceJob["status"]) {
    return status ? this.jobs.filter((j) => j.status === status) : [...this.jobs];
  }

  processNext(): InferenceJob | null {
    const job = this.jobs.find((j) => j.status === "queued");
    if (!job) return null;
    const start = Date.now();
    job.status = "running";
    job.latencyMs = Date.now() - start + 120;
    job.tokenUsage = omniModelRouter.estimateTokens(job.prompt);
    job.status = "completed";
    return job;
  }

  cancel(id: string) {
    const job = this.jobs.find((j) => j.id === id);
    if (job && job.status === "queued") job.status = "cancelled";
    return job ?? null;
  }

  private evictCompleted() {
    if (this.jobs.length <= this.maxJobs) return;
    const active = this.jobs.filter((j) => j.status === "queued" || j.status === "running");
    const completed = this.jobs.filter((j) => j.status === "completed" || j.status === "cancelled");
    this.jobs = [...active, ...completed.slice(0, this.maxJobs - active.length)];
  }
}

export const omniInferenceQueue = new OmniInferenceQueue();
