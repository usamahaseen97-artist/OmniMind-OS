import type { AutomationAction, AutomationJob } from "./types";

export class AutomationExecutorEngine {
  queue(jobs: AutomationJob[], workflowId: string, action: AutomationAction): AutomationJob[] {
    return [
      ...jobs,
      {
        id: `job-${Date.now()}`,
        workflowId,
        action,
        status: "queued",
        progress: 0,
        startedAt: null,
      },
    ];
  }
}

export const automationExecutorEngine = new AutomationExecutorEngine();
