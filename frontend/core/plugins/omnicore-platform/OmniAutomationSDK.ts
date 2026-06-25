import type { AutomationNode, AutomationWorkflow } from "./types";

/** Automation SDK — workflow nodes, triggers, schedules. */
export class OmniAutomationSDK {
  workflows: AutomationWorkflow[] = [];

  create(pluginId: string, name: string, nodes: AutomationNode[], schedule: string | null = null) {
    const wf: AutomationWorkflow = {
      id: `auto-${Date.now()}`,
      pluginId,
      name,
      nodes,
      schedule,
    };
    this.workflows.push(wf);
    return wf;
  }

  list(pluginId?: string) {
    return pluginId ? this.workflows.filter((w) => w.pluginId === pluginId) : [...this.workflows];
  }

  run(workflowId: string) {
    const wf = this.workflows.find((w) => w.id === workflowId);
    return wf ? { ok: true, executed: wf.nodes.length } : { ok: false };
  }
}

export const omniAutomationSDK = new OmniAutomationSDK();
