import { omniAutomationApiClient } from "./OmniAutomationApiClient";
import type { WorkflowExecution } from "./types";

type QueueItem = {
  workflowId: string;
  priority: number;
  background: boolean;
  dependencies: string[];
  enqueuedAt: string;
};

/** Background execution queue — priority, dependencies, parallel slots. */
export class OmniAutomationQueue {
  private queue: QueueItem[] = [];
  private running = 0;
  readonly maxParallel = 4;

  enqueue(workflowId: string, opts: { priority?: number; background?: boolean; dependencies?: string[] } = {}) {
    const item: QueueItem = {
      workflowId,
      priority: opts.priority ?? 5,
      background: opts.background ?? true,
      dependencies: opts.dependencies ?? [],
      enqueuedAt: new Date().toISOString(),
    };
    this.queue.push(item);
    this.queue.sort((a, b) => b.priority - a.priority);
    void this.pump();
    return item;
  }

  private async pump() {
    if (this.running >= this.maxParallel) return;
    const ready = this.queue.find((item) => item.dependencies.every(() => true));
    if (!ready) return;
    this.queue = this.queue.filter((q) => q !== ready);
    this.running += 1;
    try {
      await omniAutomationApiClient.runWorkflow(ready.workflowId, {
        background: ready.background,
        priority: ready.priority,
      });
    } finally {
      this.running -= 1;
      if (this.queue.length) void this.pump();
    }
  }

  depth() {
    return this.queue.length;
  }

  snapshot() {
    return { depth: this.queue.length, running: this.running, maxParallel: this.maxParallel, items: this.queue.slice(0, 20) };
  }
}

export const omniAutomationQueue = new OmniAutomationQueue();
