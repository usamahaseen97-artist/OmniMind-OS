import type { CalendarEvent, PublishJob, SocialPlatform, SocialPost } from "./types";

export class SchedulingEngine {
  createEvent(events: CalendarEvent[], title: string, date: string, type: CalendarEvent["type"]): CalendarEvent[] {
    return [
      ...events,
      { id: `cal-${Date.now()}`, title, date, type, platform: null, status: "planned" },
    ];
  }

  schedulePost(posts: SocialPost[], platform: SocialPlatform, caption: string, at: string): SocialPost[] {
    return [
      ...posts,
      {
        id: `post-${Date.now()}`,
        platform,
        caption,
        hashtags: [],
        cta: null,
        mediaIds: [],
        status: "scheduled",
        scheduledAt: at,
      },
    ];
  }
}

export class PublishingEngine {
  queue(jobs: PublishJob[], postId: string, platform: SocialPlatform, at: string): PublishJob[] {
    return [
      ...jobs,
      { id: `pub-${Date.now()}`, postId, platform, status: "queued", scheduledAt: at, progress: 0 },
    ];
  }
}

export const schedulingEngine = new SchedulingEngine();
export const publishingEngine = new PublishingEngine();
