import { omniEcosystemApiClient } from "./OmniEcosystemApiClient";
import { omniEventBus } from "../omnicore/OmniEventBus";
import { getAgentManager } from "../agent/AgentManager";
import type { BackgroundAgentJob } from "./types";
import type { OmniToolSlug } from "../omnicore/types";

/** Background Agents — AI continues when user closes tools. */
export class OmniBackgroundAgents {
  jobs: BackgroundAgentJob[] = [];

  async boot() {
    const remote = await omniEcosystemApiClient.listBackgroundAgents();
    if (remote?.ok) this.jobs = remote.jobs;
    return this;
  }

  async spawn(
    kind: BackgroundAgentJob["kind"],
    label: string,
    toolSlug: OmniToolSlug | string,
  ) {
    const remote = await omniEcosystemApiClient.enqueueBackgroundAgent({
      kind,
      label,
      toolSlug,
      detached: true,
    });
    const job = remote?.job ?? {
      id: `bg-${Date.now()}`,
      kind,
      label,
      toolSlug,
      status: "queued" as const,
      progress: 0,
      detached: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.jobs.unshift(job);
    getAgentManager().tasks.enqueue(label, String(toolSlug));
    omniEventBus.publish("background-agent:spawn", { id: job.id, kind });
    return job;
  }

  running() {
    return this.jobs.filter((j) => j.status === "running" || j.status === "queued");
  }

  snapshot() {
    return { total: this.jobs.length, running: this.running().length, jobs: this.jobs.slice(0, 30) };
  }
}

export const omniBackgroundAgents = new OmniBackgroundAgents();
