import type { GenerationJob } from "./types";

type ScheduledTask = {
  id: string;
  jobId: string;
  runAt: string;
  priority: GenerationJob["priority"];
  cloudRender: boolean;
};

/** Schedules generation jobs — local queue + optional cloud render flag. */
export class JobScheduler {
  private schedule: ScheduledTask[] = [];

  plan(job: GenerationJob, runAt?: Date) {
    const task: ScheduledTask = {
      id: `sched-${Date.now()}`,
      jobId: job.id,
      runAt: (runAt ?? new Date()).toISOString(),
      priority: job.priority,
      cloudRender: job.cloudRender,
    };
    this.schedule = [...this.schedule, task].sort(
      (a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime(),
    );
    return task;
  }

  list() {
    return [...this.schedule];
  }

  cancel(taskId: string) {
    this.schedule = this.schedule.filter((t) => t.id !== taskId);
  }

  due(now = new Date()) {
    return this.schedule.filter((t) => new Date(t.runAt) <= now);
  }
}

export const jobScheduler = new JobScheduler();
