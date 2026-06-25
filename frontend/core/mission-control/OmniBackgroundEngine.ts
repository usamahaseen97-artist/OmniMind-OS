import { omniBackgroundAgents } from "../ecosystem/OmniBackgroundAgents";
import { omniAutomationQueue } from "../automation/OmniAutomationQueue";
import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import type { BackgroundJobKind, BackgroundJobRow } from "./types";

const KIND_MAP: Record<string, BackgroundJobKind> = {
  code: "website-generation",
  video: "video-render",
  music: "music-generation",
  train: "ai-research",
  deploy: "deployment",
  report: "marketing",
};

/** Background Engine — all detached jobs visible in Mission Control. */
export class OmniBackgroundEngine {
  async list(): Promise<BackgroundJobRow[]> {
    const remote = await omniMissionControlApiClient.fetchDashboard();
    const fromEco = omniBackgroundAgents.jobs.map((j) => ({
      id: j.id,
      kind: KIND_MAP[j.kind] ?? "automation",
      label: j.label,
      status: j.status,
      progress: j.progress,
      toolSlug: String(j.toolSlug),
      startedAt: j.createdAt,
    }));
    const fromAuto = omniAutomationQueue.snapshot().items.map((q, i) => ({
      id: `auto-q-${i}`,
      kind: "automation" as const,
      label: `Workflow ${q.workflowId}`,
      status: "queued",
      progress: 0,
      toolSlug: "automation-engine",
      startedAt: q.enqueuedAt,
    }));
    const remoteJobs = remote?.ok ? remote.dashboard.backgroundJobs : [];
    return [...remoteJobs, ...fromEco, ...fromAuto];
  }

  snapshot() {
    return { running: omniBackgroundAgents.running().length };
  }
}

export const omniBackgroundEngine = new OmniBackgroundEngine();
