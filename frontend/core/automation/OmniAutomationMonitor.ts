import { omniAutomationApiClient } from "./OmniAutomationApiClient";
import { omniWorkflowExecutor } from "./OmniWorkflowExecutor";
import { omniAutomationQueue } from "./OmniAutomationQueue";
import type { AutomationMetrics } from "./types";

/** Automation monitoring dashboard metrics. */
export class OmniAutomationMonitor {
  lastMetrics: AutomationMetrics | null = null;

  async refresh(): Promise<AutomationMetrics> {
    const remote = await omniAutomationApiClient.metrics();
    if (remote?.ok) {
      this.lastMetrics = remote.metrics;
      return remote.metrics;
    }
    const history = omniWorkflowExecutor.history();
    const completed = history.filter((e) => e.status === "completed").length;
    const failed = history.filter((e) => e.status === "failed").length;
    const total = history.length || 1;
    const avgMs =
      history.reduce((sum, e) => {
        const start = new Date(e.startedAt).getTime();
        const end = e.finishedAt ? new Date(e.finishedAt).getTime() : Date.now();
        return sum + (end - start);
      }, 0) / total;

    this.lastMetrics = {
      totalExecutions: total,
      successRate: completed / total,
      failureRate: failed / total,
      avgExecutionMs: Math.round(avgMs),
      resourceUsage: { cpu: null, queueDepth: omniAutomationQueue.depth() },
      aiDecisions: history.filter((e) => e.logs.some((l) => l.level === "ai")).length,
    };
    return this.lastMetrics;
  }

  dashboard() {
    return {
      metrics: this.lastMetrics,
      queue: omniAutomationQueue.snapshot(),
      recentExecutions: omniWorkflowExecutor.history().slice(0, 10),
    };
  }
}

export const omniAutomationMonitor = new OmniAutomationMonitor();
