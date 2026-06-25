import type { GenerationJob, GenerationJobStatus, GenerationPriority } from "./types";

type QueueListener = (jobs: GenerationJob[]) => void;

/** Priority queue with pause/resume/cancel — simulates background rendering (no real GPU). */
export class GenerationQueue {
  private jobs: GenerationJob[] = [];
  private listeners = new Set<QueueListener>();
  private processing = false;
  private paused = false;
  private tickHandle: ReturnType<typeof setInterval> | null = null;

  subscribe(listener: QueueListener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot(): GenerationJob[] {
    return [...this.jobs].sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority));
  }

  enqueue(job: GenerationJob) {
    this.jobs.push(job);
    this.emit();
    this.ensureProcessor();
  }

  pauseJob(id: string) {
    this.update(id, { status: "paused" });
  }

  resumeJob(id: string) {
    const job = this.jobs.find((j) => j.id === id);
    if (job && job.status === "paused") {
      this.update(id, { status: "queued" });
      this.ensureProcessor();
    }
  }

  cancelJob(id: string) {
    this.update(id, { status: "cancelled", completedAt: new Date().toISOString() });
  }

  pauseAll() {
    this.paused = true;
    this.jobs.forEach((j) => {
      if (j.status === "processing") this.update(j.id, { status: "paused" });
    });
  }

  resumeAll() {
    this.paused = false;
    this.jobs.forEach((j) => {
      if (j.status === "paused") this.update(j.id, { status: "queued" });
    });
    this.ensureProcessor();
  }

  getActiveJob(): GenerationJob | undefined {
    return this.jobs.find((j) => j.status === "processing");
  }

  private priorityWeight(p: GenerationPriority) {
    return { low: 1, normal: 2, high: 3, urgent: 4 }[p];
  }

  private update(id: string, patch: Partial<GenerationJob>) {
    this.jobs = this.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));
    this.emit();
  }

  private emit() {
    const snap = this.snapshot();
    this.listeners.forEach((l) => l(snap));
  }

  private ensureProcessor() {
    if (this.tickHandle) return;
    this.tickHandle = setInterval(() => this.tick(), 800);
  }

  private tick() {
    if (this.paused) return;

    const active = this.jobs.find((j) => j.status === "processing");
    if (active) {
      const nextProgress = Math.min(100, active.progress + 8 + Math.random() * 12);
      const eta = active.estimatedSecondsRemaining
        ? Math.max(0, active.estimatedSecondsRemaining - 1)
        : null;
      if (nextProgress >= 100) {
        this.update(active.id, {
          progress: 100,
          status: "completed",
          completedAt: new Date().toISOString(),
          estimatedSecondsRemaining: 0,
          outputAssetId: `asset-gen-${active.id}`,
        });
      } else {
        this.update(active.id, { progress: nextProgress, estimatedSecondsRemaining: eta });
      }
      return;
    }

    const next = this.snapshot().find((j) => j.status === "queued");
    if (!next) {
      if (this.tickHandle) {
        clearInterval(this.tickHandle);
        this.tickHandle = null;
      }
      return;
    }

    this.update(next.id, {
      status: "processing",
      startedAt: new Date().toISOString(),
      gpuSlot: "GPU-0",
      estimatedSecondsRemaining: 12 + Math.floor(Math.random() * 20),
      progress: 2,
    });
  }

  dispose() {
    if (this.tickHandle) clearInterval(this.tickHandle);
    this.listeners.clear();
  }
}

export const generationQueue = new GenerationQueue();
