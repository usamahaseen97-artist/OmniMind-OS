import type { AutomationPublishJob, PublishPlatform } from "./types";

export class PublishingHubEngine {
  schedule(jobs: AutomationPublishJob[], platform: PublishPlatform, title: string, at: string | null): AutomationPublishJob[] {
    return [
      ...jobs,
      {
        id: `pub-${Date.now()}`,
        platform,
        title,
        status: at ? "scheduled" : "draft",
        scheduledAt: at,
        approvalStatus: "pending",
      },
    ];
  }

  queue(jobs: AutomationPublishJob[], id: string): AutomationPublishJob[] {
    return jobs.map((j) => (j.id === id ? { ...j, status: "queued" } : j));
  }
}

export const publishingHubEngine = new PublishingHubEngine();
